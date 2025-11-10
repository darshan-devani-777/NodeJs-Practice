const express = require('express');
const router = express.Router();
const multer = require('multer');
const userController = require('../controller/user.controller');

const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// CREATE USER
router.post('/', upload.single('image'), userController.createUser);

// GET USER
router.get('/', userController.getUsers);

// UPDATE USER
router.put('/:id', upload.single('image'), userController.updateUser); 

// DELETE USER
router.delete('/:id', userController.deleteUser);

module.exports = router;
