require('./check-versions')() // 判断各个包的版本和环境是否符合等，在控制台输出；

process.env.NODE_ENV = 'production'

var ora = require('ora') // 主要用来实现node.js命令行环境的loading效果，和显示各种状态的图标等
var rm = require('rimraf') // 以包的形式包装rm -rf命令，就是用来删除文件和文件夹的，不管文件夹是否为空，都可以删除。
var path = require('path') // path模块对路径的操作
var chalk = require('chalk') // 配置控制台输出颜色等；
var webpack = require('webpack')
var config = require('../config') // 配置文件
var webpackConfig = require('./webpack.prod.conf') // webpack 生产环境配置

var spinner = ora('正在编译至生产环境...')
spinner.start()

rm(path.join(config.build.assetsRoot, config.build.assetsSubDirectory), err => {
  if (err) throw err
  webpack(webpackConfig, function (err, stats) {
    spinner.stop()
    if (err) throw err
    // process.stdout属性返回一个对象，表示标准输出。该对象的write方法等同于console.log，可用在标准输出向用户显示内容。
    process.stdout.write(stats.toString({
      colors: true,
      modules: false,
      children: false,
      chunks: false,
      chunkModules: false
    }) + '\n\n')

    console.log(chalk.cyan('  编译完成.\n'))
    console.log(chalk.yellow(
      '  提示：编译后的文件需在HTTP服务下启用.\n' +
      '  直接开启index.html将无法访问.\n'+
      '  多页文件编译至/dist目录下，唯医骨科项目组之Webpack打包请联系强凯亮完成.\n'+
      '  严禁在不通知其他开发人员时进行打包构建.\n'
    ))
  })
})
