var path = require('path')
var utils = require('./utils')
var webpack = require('webpack')
var config = require('../config')
var merge = require('webpack-merge')
var baseWebpackConfig = require('./webpack.base.conf')
var CopyWebpackPlugin = require('copy-webpack-plugin')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
var glob = require('glob');
var env = config.build.env;
var vConsolePlugin = require('vconsole-webpack-plugin');

var webpackConfig = merge(baseWebpackConfig, {
  module: {
    rules: utils.styleLoaders({
      sourceMap: config.build.productionSourceMap,
      extract: true
    })
  },
  devtool: config.build.productionSourceMap ? '#source-map' : false,
  output: {
    path: config.build.assetsRoot,
    filename: utils.assetsPath('js/[name].[chunkhash].js'),
    chunkFilename: utils.assetsPath('js/[id].[chunkhash].js')
  },
  plugins: [
    // http://vuejs.github.io/vue-loader/en/workflow/production.html
    new webpack.DefinePlugin({
      'process.env': env
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      },
      sourceMap: config.build.productionSourceMap ? true : false
    }),
    // extract css into its own file
    new ExtractTextPlugin({
      filename: utils.assetsPath('css/[name].[contenthash].css')
    }),
    // Compress extracted CSS. We are using this plugin so that possible
    // duplicated CSS from different components can be deduped.
    new OptimizeCSSPlugin({
      cssProcessorOptions: {
        safe: true
      }
    }),
    new webpack.optimize.ModuleConcatenationPlugin(),
    // split vendor js into its own file
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: function (module, count) {
        // any required modules inside node_modules are extracted to vendor
        return (
          module.resource &&
          /\.js$/.test(module.resource) &&
          module.resource.indexOf(
            path.join(__dirname, '../node_modules')
          ) === 0
        )
      }
    }),
    // extract webpack runtime and module manifest to its own file in order to
    // prevent vendor hash from being updated whenever app bundle is updated
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest',
      chunks: ['vendor']
    }),
    // copy custom static assets
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../static'),
        to: config.build.assetsSubDirectory,
        ignore: ['.*']
      }
    ]),
    //vConsole webPack plugin
    new vConsolePlugin({
      enable: false // 发布代码前记得改回 false
    }),
  ]
})

if (config.build.productionGzip) {
  var CompressionWebpackPlugin = require('compression-webpack-plugin')

  webpackConfig.plugins.push(
    new CompressionWebpackPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: new RegExp(
        '\\.(' +
        config.build.productionGzipExtensions.join('|') +
        ')$'
      ),
      threshold: 10240,
      minRatio: 0.8
    })
  )
}

if (config.build.bundleAnalyzerReport) {
  var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
  webpackConfig.plugins.push(new BundleAnalyzerPlugin())
}

let pages = ((globalPath)=>{
  let htmlFiles = {},
    pageName;

  glob.sync(globalPath).forEach((pagePath)=>{
    var basename = path.basename(pagePath, path.extname(pagePath));
    pageName = basename;
    htmlFiles[pageName] = {};
    htmlFiles[pageName]['chunk'] = basename;
    htmlFiles[pageName]['path'] = pagePath;

  });
  return htmlFiles;
})(utils.resolve('src')+'/modules/**/*.html');

for (let entryName in pages) {
  let conf = {
    // 生成出来的html文件名
    //Fixed by qiangkailiang on 20171204
    //若输出为首页，则输出至根目录下index.html
    filename: (entryName==="index"?"../"+entryName + '.html':entryName + '.html'),
    // 每个html的模版，这里多个页面使用同一个模版
    template: pages[entryName]['path'],
    // 自动将引用插入html
    inject: true,
    minify: {
      removeComments: true,
      collapseWhitespace: true,
      removeAttributeQuotes: true
      // more options:
      // https://github.com/kangax/html-minifier#options-quick-reference
    },
    chunks:[entryName,'manifest','vendor'],
    /*
    * Fixed By Qiangkailiang on 20170806
    * 多页架构若不添加chunks将引入全部项目文件
    * entryName为页面唯一路径标识
    * 若有不匹配的资源文件将不被引入
    * manifest与vendor为webpackJsonP公用类必须引入
    * */
    // necessary to consistently work with multiple chunks via CommonsChunkPlugin
    chunksSortMode: 'dependency'
  };
  /*入口文件对应html文件（配置多个，一个页面对应一个入口，通过chunks对应）*/
  webpackConfig.plugins.push(new HtmlWebpackPlugin(conf));
}

module.exports = webpackConfig;
