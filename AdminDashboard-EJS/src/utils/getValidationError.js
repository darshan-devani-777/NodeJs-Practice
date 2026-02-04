const getValidationError = (error) => {
  console.log(error);
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map(e => e.message);
    return messages[0];
  }

  if (error.code === 11000) {
    return 'Email already exists';
  }

  return 'Server error';
};

module.exports = getValidationError;
