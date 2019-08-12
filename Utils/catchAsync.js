module.exports = callback => {
  return (req, res, next) => {
    // uses the same req res and next as above...
    // call back is an async function, all async functions return promises, so we can catch a rejected promise here...
    callback(req, res, next).catch(next);
  };
};
