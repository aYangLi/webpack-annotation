var path = require('path') // path模块对路径的操作
var utils = require('./utils') // 封装的工具
var webpack = require('webpack')
var config = require('../config') // 配置文件
var merge = require('webpack-merge')
var baseWebpackConfig = require('./webpack.base.conf') // webpack基础配置
var HtmlWebpackPlugin = require('html-webpack-plugin') // html插件，生成的文件插入到html中
var FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin') // 识别某些类型的webpack错误并清理
var glob = require('glob') // glob是一个文件匹配包，就是用来根据指定样式或正则来匹配搜索文件的
var vConsolePlugin = require('vconsole-webpack-plugin'); // vConsole 插件

// add hot-reload related code to entry chunks
Object.keys(baseWebpackConfig.entry).forEach(function (name) {
  baseWebpackConfig.entry[name] = ['./build/dev-client'].concat(baseWebpackConfig.entry[name])
})

let devConfig = merge(baseWebpackConfig, {
  module: {
    rules: utils.styleLoaders({ sourceMap: config.dev.cssSourceMap })
  },
  // cheap-module-eval-source-map is faster for development
  devtool: '#cheap-module-eval-source-map',
  plugins: [
    // DefinePlugin 是webpack 的内置插件，该插件可以在打包时候替换制定的变量
    new webpack.DefinePlugin({
      'process.env': config.dev.env
    }),
    // https://github.com/glenjamin/webpack-hot-middleware#installation--usage
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new FriendlyErrorsPlugin(),
    new vConsolePlugin({
      enable: false // 发布代码前记得改回 false
    }),
  ]
})

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
    filename: entryName + '.html',
    // 每个html的模版，这里多个页面使用同一个模版
    template: pages[entryName]['path'],
    // 自动将引用插入html
    inject: true,
    hash: false,
    // 每个html引用的js模块，也可以在这里加上vendor等公用模块
    chunks: ['vendor','manifest',pages[entryName]['chunk']],
    minify: { //压缩HTML文件
      removeComments: true, //移除HTML中的注释
      collapseWhitespace: false //删除空白符与换行符
    }
  };
  /*入口文件对应html文件（配置多个，一个页面对应一个入口，通过chunks对应）*/
  devConfig.plugins.push(new HtmlWebpackPlugin(conf));
}

module.exports = devConfig;
