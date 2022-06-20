const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const host = process.env.HOST || 'localhost';
process.env.NODE_ENV = 'development';

module.exports = merge(common, {
  mode: 'development',
  devtool: false,
  devServer: {
    historyApiFallback: true,
    compress: true,
    hot: true,
    host,
    port: 3000,
  },
});
