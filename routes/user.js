const express = require('express');
const userController = require('../controllers/user');
const authController= require('../middlewares/authentication');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();
router.post('/signup',userController.signupAuthentication);
router.post('/login',userController.loginAuthentication); 
router.post('/postGroupMessage',authController.authorization,userController.postUserMessage);
router.post('/createGroup',authController.authorization,userController.createGroup);
router.post('/updateGroup',authController.authorization,userController.updateGroup);
router.post('/postImage',authController.authorization,upload.single('image'),userController.saveImages)
router.get('/registeredSuccessfully',userController.getRegisteredSuccessfully);
router.get('/dashboard',userController.getUserDashboard);
router.get('/getAllUser',authController.authorization,userController.getAllUser);
router.get('/getAllGroup',authController.authorization,userController.getAllGroup);
router.get('/getGroupMessages',userController.getGroupChatHistory);
router.get('/getUserStatus',authController.authorization,userController.getUserStatus);
router.get('/getGroupMembers',authController.authorization,userController.getGroupMembers);


module.exports = router;