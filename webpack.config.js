const path = require('path');

module.exports = {
  resolve: {
    fallback: {
      "timers": require.resolve("timers-browserify"),
      "stream": require.resolve("stream-browserify"),
      "crypto": require.resolve("crypto-browserify"),
      "util": require.resolve("util/"),
      "buffer": require.resolve("buffer/"),
      "process": require.resolve("process/browser"),
    },
    alias: {
      'timers/promises': path.resolve(__dirname, 'src/utils/timerPromises.js'),
    },
  },
};