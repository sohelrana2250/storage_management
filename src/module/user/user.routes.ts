import express, { NextFunction, Request, Response } from 'express';
import validationRequest from '../../middleware/validationRequest';
import UserValidationSchema from './user.validation';
import UserController from './user.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../../utility/userrole.constant';
import { upload } from '../../utility/sendImageToCloudinary';

const router = express.Router();

router.post(
  '/create_user',
  validationRequest(UserValidationSchema.UserAuthSchema),
  UserController.createUserAuth,
);
router.patch(
  '/user_verification',
  validationRequest(UserValidationSchema.UserVerification),
  UserController.userVarification,
);
router.patch(
  '/change_password',
  auth(USER_ROLE.USER),
  validationRequest(UserValidationSchema.ChnagePasswordSchema),
  UserController.chnagePassword,
);
router.get('/my_profile', auth(USER_ROLE.USER), UserController.myProfile);
router.patch(
  '/update_my_profile',
  auth(USER_ROLE.USER),
  upload.single('file'),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    next();
  },
  validationRequest(UserValidationSchema.UpdateUserProfileSchema),
  UserController.updateMyProfile,
);

router.delete("/delete_my_account",auth(USER_ROLE.USER),UserController.deleteMyAccount);
const UserRouter = router;

export default UserRouter;
