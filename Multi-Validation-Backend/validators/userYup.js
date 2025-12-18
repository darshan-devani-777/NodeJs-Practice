const yup = require('yup');

const schema = yup.object().shape({
  name: yup
    .string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(10, 'Name must not exceed 10 characters')
    .test(
      'letters-spaces',
      'Name can only contain letters and spaces',
      (value) => (value ? /^[A-Za-z\s]+$/.test(value) : true)
    )
    .test(
      'vowel-check',
      'Name must contain at least one vowel (a, e, i, o, u)',
      (value) => (value ? /[aeiouAEIOU]/.test(value) : true)
    )
    .test(
      'repeating-letters',
      'Name cannot contain repeating letters (e.g. aaa, ddd)',
      (value) => (value ? !/([a-zA-Z])\1{2,}/.test(value) : true)
    ),

  email: yup
    .string()
    .required('Email is required')
    .email('Enter valid email'),

  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters')
    .max(10, 'Password must not exceed 10 characters')
    .test(
      'lowercase',
      'Password must include at least one lowercase letter',
      (value) => (value ? /[a-z]/.test(value) : true)
    )
    .test(
      'uppercase',
      'Password must include at least one uppercase letter',
      (value) => (value ? /[A-Z]/.test(value) : true)
    )
    .test(
      'number',
      'Password must include at least one number',
      (value) => (value ? /\d/.test(value) : true)
    )
    .test(
      'special',
      'Password must include at least one special character (e.g. @, $, !, %)',
      (value) => (value ? /[@$!%*?&]/.test(value) : true)
    ),
});

exports.validateWithYup = async (data) => {
  try {
    await schema.validate(data, { abortEarly: false });
    return { isValid: true, errors: {} };
  } catch (error) {
    const errors = {};

    if (error.inner && error.inner.length > 0) {
      error.inner.forEach((err) => {
        errors[err.path] = err.message;
      });
    } else if (error.path) {
      errors[error.path] = error.message;
    } else {
      errors.general = 'Validation failed';
    }

    return { isValid: false, errors };
  }
};
