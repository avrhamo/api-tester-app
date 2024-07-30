module.exports = {
    setTimeout: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
    setImmediate: () => new Promise(resolve => setImmediate(resolve)),
  };