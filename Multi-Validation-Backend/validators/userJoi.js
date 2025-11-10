const Joi = require('joi');

exports.validateWithJoi = (data) => {
  const schema = Joi.object({
    name: Joi.string()
      .min(2)
      .max(10)
      .required()
      .custom((value, helpers) => {
        if (!/^[A-Za-z\s]+$/.test(value)) {
          return helpers.error('name.invalidChars');
        }
        if (!/[aeiouAEIOU]/.test(value)) {
          return helpers.error('name.noVowel');
        }
        if (/([a-zA-Z])\1{2,}/.test(value)) {
          return helpers.error('name.repeating');
        }
        return value;
      })
      .messages({
        'string.empty': 'Name is required',
        'any.required': 'Name is required',
        'string.min': 'Name must be at least 2 characters',
        'string.max': 'Name must not exceed 10 characters',
        'name.invalidChars': 'Name can only contain letters and spaces',
        'name.noVowel': 'Name must contain at least one vowel (a, e, i, o, u)',
        'name.repeating': 'Name cannot contain repeating letters (e.g. aaa, sss)',
      }),

    email: Joi.string().email().required().messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required',
    }),

    password: Joi.string()
      .min(6)
      .max(10)
      .required()
      .custom((value, helpers) => {
        if (!/[a-z]/.test(value)) {
          return helpers.error('password.lowercase');
        }
        if (!/[A-Z]/.test(value)) {
          return helpers.error('password.uppercase');
        }
        if (!/\d/.test(value)) {
          return helpers.error('password.number');
        }
        if (!/[@$!%*?&]/.test(value)) {
          return helpers.error('password.special');
        }
        return value;
      })
      .messages({
        'string.empty': 'Password is required',
        'any.required': 'Password is required',
        'string.min': 'Password must be at least 6 characters long',
        'string.max': 'Password must not exceed 10 characters',
        'password.lowercase': 'Password must include at least one lowercase letter',
        'password.uppercase': 'Password must include at least one uppercase letter',
        'password.number': 'Password must include at least one number',
        'password.special': 'Password must include at least one special character (e.g. @, $, !, %)',
      }),
  });

  const { error } = schema.validate(data, { abortEarly: false });

  if (error) {
    const errors = {};
    error.details.forEach((d) => {
      errors[d.context.key] = d.message;
    });
    return { isValid: false, errors };
  }

  return { isValid: true, errors: {} };
};
