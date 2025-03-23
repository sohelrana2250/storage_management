import express from 'express';
import validationRequest from '../../middleware/validationRequest';
import LoginValidationSchema from './auth.validation';
import AuthController from './auth.controller';
import UserValidationSchema from '../user/user.validation';

const router = express.Router();

router.post(
  '/login_user',
  validationRequest(LoginValidationSchema.LoginSchema),
  AuthController.loginUser,
);

router.post('/refresh-token',validationRequest(LoginValidationSchema.requestTokenValidationSchema),AuthController.refreshToken);
router.patch("/forgot_password",validationRequest(LoginValidationSchema.forgetPasswordValidation),AuthController.forgetPassword);
router.patch("/reset_verification",validationRequest(LoginValidationSchema.resetVerification),AuthController.resetVerification);
router.post("/social_media_auth",validationRequest( UserValidationSchema.UserAuthSchema), AuthController.social_media_auth);

const AuthRouter = router;
export default AuthRouter;
