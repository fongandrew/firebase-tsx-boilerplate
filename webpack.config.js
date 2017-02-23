const _ = require('lodash'),
      autoprefixer = require('autoprefixer'),
      path = require('path'),
      webpack = require('webpack'),
      ExtractTextPlugin = require('extract-text-webpack-plugin'),
      HtmlWebpackPlugin = require('html-webpack-plugin');

/*
  Are we in production mode? We also include staging (or any other non-
  development environment) as prod-like for webpack purposes, but pass
  the actual environment to the config file.
*/
const NODE_ENV = process.env.NODE_ENV || 'development';
const prodLike = (NODE_ENV !== 'development');

// Actual config object
let config = {
  entry: {
    app: './src/index.js'
  },

  output: {
    path: path.resolve(__dirname, 'public'),
    publicPath: "/",
    filename: 'js/[name]-[chunkhash].js',
    chunkFilename: 'js/[name]-[chunkhash].js'
  },

  module: {
    rules: [

      // CSS
      { test: /(\.css|\.scss)$/,
        loader: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: [{
            loader: "css-loader",
            options: {
              minimize: prodLike,
              sourceMap: true
            }
          }, {
            loader: 'postcss-loader',
            options: {
              plugins: function () { return [autoprefixer]; },
              sourceMap: true
            }
          }, {
            loader: 'sass-loader',
            options: { sourceMap: true }
          }]
        }) },

      // TypeScript
      { test: /\.ts(x?)$/,
        exclude: /node_modules/,
        use: [{
          loader: 'ts-loader',
          options: { sourceMap: true }
        }] },

      // Source map extraction
      { test: /\.js$/,
        use: ["source-map-loader"],
        enforce: "pre" }
    ]
  },

  resolve: {
    extensions: ['.ts', '.js', '.tsx', '.jsx', '.json'],
    modules: [path.join(__dirname, 'src'), 'node_modules'],
    alias: {
      // Special config path based on environment
      config$: path.join(__dirname, 'config', NODE_ENV)
    }
  },

  // Enable sourcemaps for debugging webpack's output.
  devtool: "source-map",

  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(
        prodLike ? "production" : NODE_ENV)
    }),

    new ExtractTextPlugin({
      filename: "css/[name]--[contenthash].css",
      allChunks: true
    }),

    new HtmlWebpackPlugin({
      template: './src/index.html',
      inject: true
    })
  ]
};

if (prodLike) {
  config.plugins.push(new webpack.optimize.UglifyJsPlugin({
    compress: {
      screw_ie8: true,

      // Disable warnings about un-reachable conditions and what not. Most
      // of those are intentional (e.g. via webpack.DefinePlugin)
      warnings: false
    },
    sourceMap: true
  }));
}

else {
  config.devServer = {
    contentBase: path.join(__dirname, "public"),
    port: 5000,
    historyApiFallback: true
  };
}

module.exports = config;