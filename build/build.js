require('./check-versions')()

process.env.NODE_ENV = 'production'

var ora = require('ora')
var rm = require('rimraf')
var path = require('path')
var chalk = require('chalk')
var webpack = require('webpack')
var config = require('../config')
var webpackConfig = require('./webpack.prod.conf')

var spinner = ora('正在编译至生产环境...')
spinner.start()

rm(path.join(config.build.assetsRoot, config.build.assetsSubDirectory), err => {
  if (err) throw err
  webpack(webpackConfig, function (err, stats) {
    spinner.stop()
    if (err) throw err
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
