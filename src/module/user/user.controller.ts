import { RequestHandler } from 'express';
import catchAsync from '../../utility/catchAsync';
import UserServices from './user.services';
import sendRespone from '../../utility/sendRespone';
import httpStatus from 'http-status';

const createUserAuth: RequestHandler = catchAsync(async (req, res) => {
  const result = await UserServices.createUserAuthIntoDb(req.body);
  sendRespone(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Successfully Send Email',
    data: result,
  });
});

const userVarification: RequestHandler = catchAsync(async (req, res) => {
  const result = await UserServices.userVarificationIntoDb(
    req.body.verificationCode,
  );
  sendRespone(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Successfully Varified Your Account',
    data: result,
  });
});

const chnagePassword: RequestHandler = catchAsync(async (req, res) => {
  const result = await UserServices.chnagePasswordIntoDb(req.body, req.user.id);
  sendRespone(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Successfully Change Password',
    data: result,
  });
});

const myProfile: RequestHandler = catchAsync(async (req, res) => {
  const result = await UserServices.myProfileIntoDb(req.user.id);
  sendRespone(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Successfully Find By Profile',
    data: result,
  });
});
const  updateMyProfile:RequestHandler=catchAsync(async(req,res)=>{

     const result=await UserServices.updateMyProfileIntoDb(req,req.user.id);
     sendRespone(res, {
          success: true,
          statusCode: httpStatus.OK,
          message: 'Successfully Update Profile Profile',
          data: result,
        });
});

const deleteMyAccount:RequestHandler=catchAsync(async(req ,res)=>{

     const result=await UserServices.deleteMyAccountIntoDb(req.user.id);
     sendRespone(res, {
          success: true,
          statusCode: httpStatus.OK,
          message: 'Successfully  Delete Account',
          data: result,
        });

});
const UserController = {
  createUserAuth,
  userVarification,
  chnagePassword,
  myProfile,
  updateMyProfile,
  deleteMyAccount
};
export default UserController;
