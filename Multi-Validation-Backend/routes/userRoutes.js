const express = require('express');
const router = express.Router();

const { registerWithValidator } = require('../controllers/userValidatorController');
const { registerWithJoi } = require('../controllers/userJoiController');
const { registerWithYup } = require('../controllers/userYupController');
const { registerWithZod } = require('../controllers/userZodController');

const {validateWithValidator} = require('../validators/userValidator');
const {validateWithJoi} = require('../validators/userJoi');
const {validateWithYup} = require('../validators/userYup');
const {validateWithZod} = require('../validators/userZod');
const { error } = require('../utils/response');

const useValidation = (validatorFn) => async (req, res, next) => {
  try {
    const { isValid, errors } = await validatorFn(req.body); 
    if (!isValid) {
      return error(res, 'Validation failed', 400, errors);
    }
    next();
  } catch (err) {
    console.error('Validation middleware error:', err);
    return error(res, 'Internal server error during validation', 500, undefined, err);
  }
};

router.post('/register-validator', useValidation(validateWithValidator), registerWithValidator);
router.post('/register-joi', useValidation(validateWithJoi), registerWithJoi);
router.post('/register-yup', useValidation(validateWithYup), registerWithYup);
router.post('/register-zod', useValidation(validateWithZod), registerWithZod);

module.exports = router;
