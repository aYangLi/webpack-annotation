// 配置控制台输出颜色等；
var chalk = require('chalk')
// 语义化版本检查插件（The semantic version parser used by npm）
var semver = require('semver')
// 引入package.json
var packageConfig = require('../package.json')
var shell = require('shelljs') // shelljs模块重新包装了child_process,调用系统命令更加简单
// 开辟子进程执行指令cmd并返回结果
function exec (cmd) {
  return require('child_process').execSync(cmd).toString().trim()
}

// node和npm版本需求
var versionRequirements = [
  {
    name: 'node',
    currentVersion: semver.clean(process.version),
    versionRequirement: packageConfig.engines.node
  },
]

//判定npm命令是否可用
if (shell.which('npm')) {
  versionRequirements.push({
    name: 'npm',
    currentVersion: exec('npm --version'),
    versionRequirement: packageConfig.engines.npm
  })
}

module.exports = function () {
  var warnings = []
  // 依次判断版本是否符合要求
  for (var i = 0; i < versionRequirements.length; i++) {
    var mod = versionRequirements[i]
    if (!semver.satisfies(mod.currentVersion, mod.versionRequirement)) {
      warnings.push(mod.name + ': ' +
        chalk.red(mod.currentVersion) + ' should be ' +
        chalk.green(mod.versionRequirement)
      )
    }
  }

  if (warnings.length) {
    console.log('')
    console.log(chalk.yellow('To use this template, you must update following to modules:'))
    console.log()
    for (var i = 0; i < warnings.length; i++) {
      var warning = warnings[i]
      console.log('  ' + warning)
    }
    console.log()
    process.exit(1)
  }
}
