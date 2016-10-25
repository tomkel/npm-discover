const webpack = require('webpack')

const plugins = []
if (process.env.NODE_ENV) {
  plugins.push(
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      },
    })
  )
}

module.exports = {
  entry: './src/index',
  output: {
    filename: './build/bundle.js',
  },
  resolve: {
    extensions: ['', '.js', '.jsx'],
  },
  devtool: 'source-map',
  module: {
    loaders: [{
      test: /\.jsx?$/,
      loader: 'babel',
      query: {
        presets: [['env', { targets:
          { browsers: '> 1%, last 2 version, not IE < 11, not ie_mob < 11, Firefox ESR' },
        }], 'react'],
        plugins: ['transform-class-properties'],
        cacheDirectory: true,
      },
    }],
  },
  plugins,

  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
  },
}
