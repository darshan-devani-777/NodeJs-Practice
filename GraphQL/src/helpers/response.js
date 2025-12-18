const buildResponse = (status, code, message, data = null) => {
    return { status, code, message, data };
  };
  
  module.exports = buildResponse;
  