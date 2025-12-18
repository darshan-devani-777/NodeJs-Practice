const validator = require('validator');

exports.validateWithValidator = (data) => {
  const errors = {};
  const name = data.name ? data.name.trim() : '';
  const email = data.email ? data.email.trim() : '';
  const password = data.password ? data.password.trim() : '';

  if (validator.isEmpty(name)) {
    errors.name = 'Name is required';
  } else if (!/^[A-Za-z\s]+$/.test(name)) {
    errors.name = 'Name can only contain letters and spaces';
  } else if (!/[aeiouAEIOU]/.test(name)) {
    errors.name = 'Name must contain at least one vowel (a, e, i, o, u)';
  } else if (/([a-zA-Z])\1{2,}/.test(name)) {
    errors.name = 'Name cannot contain repeating letters (e.g. aaa, ddd)';
  } else if (!validator.isLength(name, { min: 2, max: 10 })) {
    errors.name = 'Name must be between 2 and 10 characters long';
  }

  if (validator.isEmpty(email)) {
    errors.email = 'Email is required';
  } else if (!validator.isEmail(email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (validator.isEmpty(password)) {
    errors.password = 'Password is required';
  } else if (!validator.isLength(password, { min: 6, max: 10 })) {
    errors.password = 'Password must be between 6 and 10 characters long';
  } else if (!/[a-z]/.test(password)) {
    errors.password = 'Password must include at least one lowercase letter';
  } else if (!/[A-Z]/.test(password)) {
    errors.password = 'Password must include at least one uppercase letter';
  } else if (!/\d/.test(password)) {
    errors.password = 'Password must include at least one number';
  } else if (!/[@$!%*?&]/.test(password)) {
    errors.password = 'Password must include at least one special character (e.g. @, $, !, %)';
  }  

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
