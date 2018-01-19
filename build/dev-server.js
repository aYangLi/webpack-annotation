require('./check-versions')() // 判断各个包的版本和环境是否符合等，在控制台输出；

var config = require('../config') // 配置文件
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = JSON.parse(config.dev.env.NODE_ENV)
}

var opn = require('opn') // 主要用来实现node.js命令行环境的loading效果，和显示各种状态的图标等
var path = require('path') // path模块对路径的操作
var express = require('express') // express 搭建 node 服务器
var webpack = require('webpack')
var proxyMiddleware = require('http-proxy-middleware') // 用于把请求代理转发到其他服务器的中间件
var webpackConfig = require('./webpack.dev.conf') // webpack 开发环境配置

// default port where dev server listens for incoming traffic
var port = process.env.PORT || config.dev.port
// automatically open browser, if not set will be false 自动打开浏览器，如果不设置就会是false
var autoOpenBrowser = !!config.dev.autoOpenBrowser
// Define HTTP proxies to your custom API backend
// https://github.com/chimurai/http-proxy-middleware
var proxyTable = config.dev.proxyTable

var app = express()
var compiler = webpack(webpackConfig)

//webpack-dev-middleware,作用就是，生成一个与webpack的compiler绑定的中间件，然后在express启动的服务app中调用这个中间件。
var devMiddleware = require('webpack-dev-middleware')(compiler, {
  publicPath: webpackConfig.output.publicPath,
  quiet: true
})
// webpack-hot-middleware是一个结合webpack-dev-middleware使用的middleware，它可以实现浏览器的无刷新更新（hot reload）。
var hotMiddleware = require('webpack-hot-middleware')(compiler, {
  log: () => {}
})
// force page reload when html-webpack-plugin template changes 当html-webpack-plugin模板更改时，强制页面重新加载
compiler.plugin('compilation', function (compilation) {
  compilation.plugin('html-webpack-plugin-after-emit', function (data, cb) {
    hotMiddleware.publish({ action: 'reload' })
    cb()
  })
})

// proxy api requests 设置代理api请求
Object.keys(proxyTable).forEach(function (context) {
  var options = proxyTable[context]
  if (typeof options === 'string') {
    options = { target: options }
  }
  app.use(proxyMiddleware(options.filter || context, options))
})

// handle fallback for HTML5 history API 处理HTML5历史API的回退
app.use(require('connect-history-api-fallback')())

// serve webpack bundle output 服务webpack输出
app.use(devMiddleware)

// enable hot-reload and state-preserving
// compilation error display
app.use(hotMiddleware)

// serve pure static assets
var staticPath = path.posix.join(config.dev.assetsPublicPath, config.dev.assetsSubDirectory)
app.use(staticPath, express.static(  './static'))

var uri = '10.1.8.32:' + port


var _resolve
var readyPromise = new Promise(resolve => {
  _resolve = resolve
})

console.log('> 正在启动本地服务...')
devMiddleware.waitUntilValid(() => {
  console.log('> 本地服务已启动.正在监听 ' + uri + '服务.\n')
  // when env is testing, don't need open it
  if (autoOpenBrowser && process.env.NODE_ENV !== 'testing') {
    opn(uri)
  }
  _resolve()
})

var server = app.listen(port)

module.exports = {
  ready: readyPromise,
  close: () => {
    server.close()
  }
}
