var path = require('path'); // path模块对路径的操作
var utils = require('./utils'); // 封装的工具
var config = require('../config'); // 配置文件
var vueLoaderConfig = require('./vue-loader.conf'); // vue-loader配置
var buildEntries = require('./build-entries'); // 获取所有模块的文件夹名

// 配置文件的内容需要通过module.exports暴露
module.exports = {
  // 配置需要打包的入口文件，值可以是字符串、数组、对象。
  // 1. 字符串： entry： './entry'
  // 2. 字符串： entry：[ './entry1','entry2'] (多入口)
  // 3. 对象：   entry： {alert/index': path.resolve(pagesDir, `./alert/index/page`)}
  // 多入口书写的形式应为object，因为object,的key在webpack里相当于此入口的name,
  entry: buildEntries,
  // 输出文件配置，output 输出有自己的一套规则，常用的参数基本就是这三个
  output: {
    //path: 表示生成文件的根目录 需要一个**绝对路径** path仅仅告诉Webpack结果存储在哪里
    path: config.build.assetsRoot, 
    // filename 属性表示的是如何命名出来的入口文件，规则是一下三种： 
    // [name] 指代入口文件的name，也就是上面提到的entry参数的key，因此，我们可以在name里利用/，即可达到控制文件目录结构的效果。
    // [hash]，指代本次编译的一个hash版本，值得注意的是，只要是在同一次编译过程中生成的文件，这个[hash].js 
    //的值就是一样的；在缓存的层面来说，相当于一次全量的替换。
    filename: '[name].js',
    // publicPath 参数表示的是一个URL 路径（指向生成文件的跟目录），用于生成css/js/图片/字体文件
    // 等资源的路径以确保网页能正确地加载到这些资源.
    // “publicPath”项则被许多Webpack的插件用于在生产模式下更新内嵌到css、html文件里的url值.
    // 例如，在localhost（即本地开发模式）里的css文件中边你可能用“./test.png”这样的url来加载图片，
    // 但是在生产模式下“test.png”文件可能会定位到CDN上并且你的Node.js服务器可能是运行在HeroKu上边的。
    // 这就意味着在生产环境你必须手动更新所有文件里的url为CDN的路径。
    //开发环境：Server和图片都是在localhost（域名）下
    //.image { 
    // background-image: url('./test.png');
    //}
    // 生产环境：Server部署下HeroKu但是图片在CDN上
    //.image { 
    //  background-image: url('https://someCDN/test.png');
    //}
    publicPath: process.env.NODE_ENV === 'production'
      ? config.build.assetsPublicPath
      : config.dev.assetsPublicPathprocess // process对象是一个全局变量，它提供当前 Node.js 进程的有关信息，以及控制当前 Node.js 进程。 因为是全局变量，所以无需使用 require()。
  },
  // 用来配置依赖文件的匹配，如依赖文件的别名配置、模块的查找目录、默认查找的
  // 文件后缀名
  // resolve.root 该选型用来制定模块查找的根路径，必须为**绝对路径**，值可以
  // 是路径字符串或者路径数组若是数组，则会依次查找
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    // 用来配置依赖文件的别名，值是一个对，该对象的键是别名，值是实际路径
    alias: {
      '@': utils.resolve('src'),
      'common': utils.resolve('src/common'),
      'components': utils.resolve('src/components'),
      'api': utils.resolve('src/api'),
      'static':utils.resolve('static')
    }
  },
  // 用来进行模块加载相关的配置
  module: {
    rules: [
      // {
      //   test: /\.(js|vue)$/,
      //   loader: 'eslint-loader',
      //   enforce: 'pre',
      //   include: [utils.resolve('src')],
      //   options: {
      //     formatter: require('eslint-friendly-formatter')
      //   }
      // },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: vueLoaderConfig
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [utils.resolve('src')]
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('img/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
        }
      }
    ]
  }
};
