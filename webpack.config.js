var path = require('path');
var glob = require('glob');
var webpack = require('webpack');
var glob_entries = require('webpack-glob-entries')

module.exports = {
  entry: glob_entries('./handlers/*.js'),
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
    library: '[name]',
    libraryTarget: 'commonjs2',
  },
  target: 'node',
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
        exclude: path.resolve(__dirname, 'node_modules')
      },
      {
        test: /\.json$/,
        loader: 'json'
      }
    ]
  },
  plugins: [
    new webpack.IgnorePlugin(/vertx/),
  ],
}
