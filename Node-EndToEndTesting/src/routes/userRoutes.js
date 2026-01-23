const express = require('express');
const { body, param, query, validationResult } = require('express-validator');

const {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  loginUser,
  changePassword
} = require('../controllers/userController');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

const router = express.Router();

const userValidationRules = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name is required and cannot exceed 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name is required and cannot exceed 50 characters'),
  body('phoneNumber')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number')
];

const loginValidationRules = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const updateUserValidationRules = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),
  body('phoneNumber')
    .optional()
    .matches(/^\+?[0-9]{7,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
];

const changePasswordValidationRules = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
];

const paginationValidationRules = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'firstName', 'lastName', 'email'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  query('search')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Search query cannot exceed 100 characters')
];

router.post('/', userValidationRules, handleValidationErrors, createUser);

router.get('/', paginationValidationRules, handleValidationErrors, getUsers);

router.get('/:id',
  param('id').isMongoId().withMessage('Invalid user ID'),
  handleValidationErrors,
  getUser
);

router.put('/:id',
  param('id').isMongoId().withMessage('Invalid user ID'),
  updateUserValidationRules,
  handleValidationErrors,
  updateUser
);

router.delete('/:id',
  param('id').isMongoId().withMessage('Invalid user ID'),
  handleValidationErrors,
  deleteUser
);

router.post('/login', loginValidationRules, handleValidationErrors, loginUser);

router.put('/:id/change-password',
  param('id').isMongoId().withMessage('Invalid user ID'),
  changePasswordValidationRules,
  handleValidationErrors,
  changePassword
);

module.exports = router;
