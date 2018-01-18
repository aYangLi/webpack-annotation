var merge = require('webpack-merge')
var prodEnv = require('./prod.env')

// 暴露出全局变量 NODE_ENV 为开发环境
module.exports = merge(prodEnv, {
  NODE_ENV: '"development"'
})
