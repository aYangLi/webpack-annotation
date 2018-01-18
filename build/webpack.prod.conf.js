var path = require('path') // path模块对路径的操作
var utils = require('./utils') // 封装的工具
var webpack = require('webpack')
var config = require('../config') // 配置文件
var merge = require('webpack-merge')
var baseWebpackConfig = require('./webpack.base.conf') // webpack基础配置
var CopyWebpackPlugin = require('copy-webpack-plugin') // 在webpack中拷贝文件和文件夹
var HtmlWebpackPlugin = require('html-webpack-plugin') // html插件，生成的文件插入到html中
var ExtractTextPlugin = require('extract-text-webpack-plugin') // 主要是为了抽离css样式,防止将样式打包在js中引起页面样式加载错乱的现象;
var OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin') // 压缩css
var glob = require('glob'); // glob是一个文件匹配包，就是用来根据指定样式或正则来匹配搜索文件的
var env = config.build.env;
var vConsolePlugin = require('vconsole-webpack-plugin'); // vConsole 插件

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
  // webpack插件位置，有固定的用法
  // 1. 利用Plugin的初始方法并传入Plugin预设的参数进行初始化，生成一个实例。
  // 2. 将此实例插入到webpack配置文件中的plugins参数（数组类型）里即可。
  plugins: [
    // http://vuejs.github.io/vue-loader/en/workflow/production.html
    // DefinePlugin 是webpack 的内置插件，该插件可以在打包时候替换制定的变量
    new webpack.DefinePlugin({
      'process.env': env
    }),
    // 压缩js
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      },
      sourceMap: config.build.productionSourceMap ? true : false
    }),
    // extract css into its own file 将css提取到自己的文件中
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
    // split vendor js into its own file webpack分离js；根据需求分离js到不同的文件
    // 如果文件是多入口的文件，可能存在，重复代码，把公共代码提取出来，又不会重复下载公共代码了
    // （多个页面间会共享此文件的缓存）
    // CommonsChunkPlugin的初始化常用参数有解析？
    // name: 这个给公共代码的chunk唯一的标识
    // filename，如何命名打包后生产的js文件，也是可以用上[name]、[hash]、[chunkhash]
    // minChunks，公共代码的判断标准：某个js模块被多少个chunk加载了才算是公共代码
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
// 开启 gzip 压缩 暂时没开启
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
