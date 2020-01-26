const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './src/instancer.js',
  target: 'node',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'pax-request.js',
    library: 'paxRequest',
    libraryTarget: 'umd',
    libraryExport: 'default',
    globalObject: 'typeof window === "object" ? window : global'
  },

  node: {
    process: false
  },

  devtool: 'source-map',

  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    }),
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1
    })
  ],

  mode: 'development'
};
