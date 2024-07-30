const webpack = require('webpack');

module.exports = function override(config, env) {
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "timers": require.resolve("timers-browserify"),
    "stream": require.resolve("stream-browserify"),
    "crypto": require.resolve("crypto-browserify"),
    "util": require.resolve("util/"),
    "buffer": require.resolve("buffer/"),
    "process": require.resolve("process/browser"),
  };

  config.plugins.push(
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    })
  );

  return config;
};
