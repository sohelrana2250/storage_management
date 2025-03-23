import { RequestHandler } from 'express';
import catchAsync from '../../utility/catchAsync';
import sendRespone from '../../utility/sendRespone';
import httpStatus from 'http-status';
import AuthServices from './auth.services';
import config from '../../app/config';

const loginUser: RequestHandler = catchAsync(async (req, res) => {
  const result = await AuthServices.loginUserIntoDb(req.body);

  const { refreshToken, accessToken } = result;
  res.cookie('refreshToken', refreshToken, {
    secure: config.NODE_ENV === 'production',
    httpOnly: true,
  });
  sendRespone(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Successfully Login',
    data: {
      accessToken,
    },
  });
});

const refreshToken: RequestHandler = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies;
  const result = await AuthServices.refreshTokenIntoDb(refreshToken);
  sendRespone(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Access token is Retrived Successfully',
    data: result,
  });
});

const forgetPassword: RequestHandler = catchAsync(async (req, res) => {
  const result = await AuthServices.forgetPasswordIntoDb(req.body.email);
  sendRespone(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Checked Your Email And Reset Password',
    data: result,
  });
});

const resetVerification: RequestHandler = catchAsync(async (req, res) => {
  const result = await AuthServices.resetVerificationIntoDb(req.body);
  sendRespone(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Successfully Reset Now Change Your Password',
    data: result,
  });
});

const social_media_auth: RequestHandler = catchAsync(async (req, res) => {
  const result = await AuthServices.social_media_auth_IntoDb(req.body);
  const { refreshToken, accessToken } = result;
  res.cookie('refreshToken', refreshToken, {
    secure: config.NODE_ENV === 'production',
    httpOnly: true,
  });
  sendRespone(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Successfully Login',
    data: { accessToken },
  });
});

const AuthController = {
  loginUser,
  refreshToken,
  forgetPassword,
  resetVerification,
  social_media_auth,
};

export default AuthController;
