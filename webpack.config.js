'use strict'

const { join, resolve } = require('path')
const webpack = require('webpack')
const glob = require('glob')

const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')

const extractCSS = new ExtractTextPlugin({
  filename: 'assets/css/[name].css',
  allChunks: true
})
const extractSASS = new ExtractTextPlugin({
  filename: 'assets/css/[name].css',
  allChunks: true
})

const entries = {}
const chunks = []
glob.sync('./src/modules/**/main.js').forEach(path => {
  console.log(path)
  const chunk = path.split('./src/modules/')[1].split('/main.js')[0]
  entries[chunk] = path
  chunks.push(chunk)
})

const config = {
  entry: entries,
  output: {
    path: resolve(__dirname, './dist'),
    filename: 'static/js/[name].js',
    publicPath: '/'
  },
  resolve: {
    extensions: ['.js', '.vue'],
    alias: {
      assets: join(__dirname, '/src/assets'),
      components: join(__dirname, '/src/components'),
      root: join(__dirname, 'node_modules'),
      '@':  join(__dirname,'src'),
      common:  join(__dirname,'src/common'),
      api:  join(__dirname,'src/api'),
      static: join(__dirname,'static')
    }
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            css: ['css-hot-loader'].concat(ExtractTextPlugin.extract({
              use: 'css-loader',
              fallback: 'style-loader'
            })),
            scss: ['css-hot-loader'].concat(ExtractTextPlugin.extract({
              use: ['css-loader', 'postcss-loader', 'sass-loader'],
              fallback: 'style-loader'
            })),
            postcss: ['css-hot-loader'].concat(ExtractTextPlugin.extract({
              use: ['css-loader', 'postcss-loader'],
              fallback: 'style-loader'
            }))
          }
        }
      },
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['css-hot-loader'].concat(ExtractTextPlugin.extract({
          use: ['css-loader', 'postcss-loader'],
          fallback: 'style-loader'
        }))
      },
      {
        test: /\.scss$/,
        use: ['css-hot-loader'].concat(ExtractTextPlugin.extract({
          use: ['css-loader', 'postcss-loader', 'sass-loader'],
          fallback: 'style-loader'
        }))
      },
      {
        test: /\.html$/,
        use: [{
          loader: 'html-loader',
          options: {
            root: resolve(__dirname, 'src'),
            attrs: ['img:src', 'link:href']
          }
        }]
      },
      {
        test: /\.(png|jpg|jpeg|gif|eot|ttf|woff|woff2|svg|svgz)(\?.+)?$/,
        exclude: /favicon\.png$/,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 10000,
            name: 'assets/img/[name].[hash:7].[ext]'
          }
        }]
      }
    ]
  },
  plugins: [
    new webpack.optimize.ModuleConcatenationPlugin(),
    new CommonsChunkPlugin({
      name: 'vendors',
      filename: 'assets/js/vendors.js',
      chunks: chunks,
      minChunks: chunks.length
    }),
    extractSASS,
    extractCSS
  ],
  devServer: {
    host: '0.0.0.0',
    port: 8080,
    historyApiFallback: false,
    noInfo: true,
    proxy: {
      '/mcall':{
        target:'https://m1.allinmed.cn',
        changeOrigin:true,
        secure: false
      }
    },
    open: true,
    openPage: 'index.html'
  },
  devtool: '#eval-source-map'
}

glob.sync('./src/modules/**/*.html').forEach(path => {
  let chunk=[];
  path.split('./src/modules/')[1].split('/').forEach((element,index)=>{
    if (!element.includes(".html")){
      chunk.push(element);
    }
  })
  console.log(process.env.NODE_ENV)
  const filename = chunk.join("/") + '.html'
  const htmlConf = {
    filename: filename,
    template: path,
    inject: 'body',
    favicon: './src/common/image/favicon.ico',
    hash: process.env.NODE_ENV === 'production',
    chunks: ['vendors', chunk.join("/")]
  }
  config.plugins.push(new HtmlWebpackPlugin(htmlConf))
})

module.exports = config

if (process.env.NODE_ENV === 'production') {
  module.exports.devtool = '#source-map'
  // http://vue-loader.vuejs.org/en/workflow/production.html
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      },
      sourceMap: true
    }),
    new OptimizeCSSPlugin()
  ])
}
