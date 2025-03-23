import httpStatus from 'http-status';
import { USER_STATUS } from '../../utility/userrole.constant';
import users from '../user/user.model';
import AppError from '../../app/error/AppError';
import { jwtHelpers } from '../../app/jwtHalpers/jwtHalpers';
import config from '../../app/config';
import sendEmail from '../../utility/sendEmail';
import emailcontext from '../../utility/sendemail/emailcontext';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { TUser } from '../user/user.interface';

const loginUserIntoDb = async (payload: {
  email: string;
  password: string;
}) => {
  const isUserExist = await users.findOne(
    {
      $and: [
        { email: payload.email },
        { isVerify: true },
        { status: USER_STATUS.isProgress },
        { isDeleted: false },
      ],
    },
    { password: 1, _id: 1, isVerify: 1, email: 1, role: 1 },
  );

  if (!isUserExist) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found', '');
  }

  if (
    !(await users.isPasswordMatched(payload?.password, isUserExist.password))
  ) {
    throw new AppError(httpStatus.FORBIDDEN, 'This Password Not Matched', '');
  }

  const jwtPayload = {
    id: isUserExist.id,
    role: isUserExist.role,
    email: isUserExist.email,
  };

  let accessToken: string | null = null;
  let refreshToken: string | null = null;

  if (isUserExist.isVerify) {
    accessToken = jwtHelpers.generateToken(
      jwtPayload,
      config.jwt_access_secret as string,
      config.expires_in as string,
    );
    refreshToken = jwtHelpers.generateToken(
      jwtPayload,
      config.jwt_refresh_secret as string,
      config.refresh_expires_in as string,
    );
  }
  return {
    accessToken,
    refreshToken,
  };
};

const refreshTokenIntoDb = async (token: string) => {
  try {
    const decoded = jwtHelpers.verifyToken(
      token,
      config.jwt_refresh_secret as string,
    );

    const { id } = decoded;

    const isUserExist = await users.findOne(
      {
        $and: [
          { _id: id },
          { isVerify: true },
          { status: USER_STATUS.isProgress },
          { isDeleted: false },
        ],
      },
      { _id: 1, isVerify: 1, email: 1 },
    );

    if (!isUserExist) {
      throw new AppError(httpStatus.NOT_FOUND, 'User not found', '');
    }
    let accessToken: string | null = null;
    if (isUserExist.isVerify) {
      const jwtPayload = {
        id: isUserExist.id,
        role: isUserExist.role,
        email: isUserExist.email,
      };
      accessToken = jwtHelpers.generateToken(
        jwtPayload,
        config.jwt_access_secret as string,
        config.expires_in as string,
      );
    }

    return {
      accessToken,
    };
  } catch (error: any) {
    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      'refresh Token generator error',
      error,
    );
  }
};

const forgetPasswordIntoDb = async (email: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const isUserExist = await users.findOne(
      {
        $and: [
          { email },
          { isVerify: true },
          { status: USER_STATUS.isProgress },
          { isDeleted: false },
        ],
      },
      { _id: 1, email: 1, password: 1 },
      { session },
    );

    if (
      await users.isPasswordMatched(
        config.googleauth as string,
        isUserExist?.password as string,
      )
    ) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "social media auth don't allow forgot password",
        '',
      );
    }

    if (!isUserExist) {
      throw new AppError(httpStatus.NOT_FOUND, 'User not found', '');
    }

    const otp = Number(Math.floor(100000 + Math.random() * 900000).toString());
    const sendResetOTP = await users.findByIdAndUpdate(
      isUserExist._id,
      { verificationCode: otp },
      { new: true, session },
    );

    await sendEmail(
      isUserExist.email,
      emailcontext.sendvarificationData(isUserExist.email, otp),
      'Reset Password Verification OTP Code',
    );
    await session.commitTransaction();
    session.endSession();

    return (
      sendResetOTP && {
        status: true,
        message: 'Successfully Get Fotgot Password OTP',
      }
    );
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();

    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      'reset password email sending  error',
      error,
    );
  }
};

const resetVerificationIntoDb = async (payload: {
  verificationCode: number;
  newpassword: string;
}) => {
  try {
    const isVerified = await users.findOne(
      {
        $and: [
          { verificationCode: payload.verificationCode },
          { isVerify: true },
          { isDeleted: false },
          { status: USER_STATUS.isProgress },
        ],
      },
      {
        isVerify: 1,
        _id: 1,
      },
    );

    if (!isVerified) {
      throw new AppError(httpStatus.NOT_FOUND, 'User Not Verified User', '');
    }

    const newHashedPassword = await bcrypt.hash(
      payload.newpassword,
      Number(config.bcrypt_salt_rounds),
    );

    const updatedUser = await users.findByIdAndUpdate(
      isVerified._id,
      { password: newHashedPassword },
      { new: true },
    );
    if (!updatedUser) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        'password  change database error',
        '',
      );
    }

    return {
      success: true,
      message: 'Successfuuly Reset Password',
    };
  } catch (error: any) {
    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      'reset password verification   error',
      error,
    );
  }
};

const social_media_auth_IntoDb = async (payload: Partial<TUser>) => {
  payload.password = config.googleauth;
  const isUserExist = await users.findOne(
    {
      email: payload.email,
      isVerify: true,
      isDeleted: false,
      status: USER_STATUS.isProgress,
    },
    { _id: 1, role: 1, email: 1, isVerify: 1 },
  );

  let jwtPayload;

  if (!isUserExist) {
    const otp = Number(Math.floor(100000 + Math.random() * 900000).toString());
    payload.verificationCode = otp;
    payload.isVerify = true;
    const newUser = await new users(payload).save();
    jwtPayload = {
      id: newUser._id.toString(),
      role: newUser.role,
      email: newUser.email,
    };
  } else {
    jwtPayload = {
      id: isUserExist._id.toString(),
      role: isUserExist.role,
      email: isUserExist.email,
    };
  }

  if (!isUserExist || isUserExist.isVerify) {
    const accessToken = jwtHelpers.generateToken(
      jwtPayload,
      config.jwt_access_secret as string,
      config.expires_in as string,
    );

    const refreshToken = jwtHelpers.generateToken(
      jwtPayload,
      config.jwt_refresh_secret as string,
      config.refresh_expires_in as string,
    );

    return { accessToken, refreshToken };
  }

  return { accessToken: null, refreshToken: null };
};
const AuthServices = {
  loginUserIntoDb,
  refreshTokenIntoDb,
  forgetPasswordIntoDb,
  resetVerificationIntoDb,
  social_media_auth_IntoDb,
};

export default AuthServices;
