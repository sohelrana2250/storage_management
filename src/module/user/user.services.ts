import httpStatus from 'http-status';
import AppError from '../../app/error/AppError';
import { TUser } from './user.interface';
import users from './user.model';
import sendEmail from '../../utility/sendEmail';
import emailcontext from '../../utility/sendemail/emailcontext';
import mongoose from 'mongoose';
import { jwtHelpers } from '../../app/jwtHalpers/jwtHalpers';
import config from '../../app/config';
import bcrypt from 'bcrypt';
import { USER_STATUS } from '../../utility/userrole.constant';
import { Request } from 'express';
import { sendImageToCloudinary } from '../../utility/sendImageToCloudinary';
import createfiles from '../file/file.model';
import createfolders from '../create_folder/create_folder.modal';

const createUserAuthIntoDb = async (payload: Partial<TUser>) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const otp = Number(Math.floor(100000 + Math.random() * 900000).toString());
    payload.verificationCode = otp;
    const buildInShoes = new users(payload);
    const result = await buildInShoes.save({ session });
    await sendEmail(
      result.email,
      emailcontext.sendvarificationData(result.email, otp),
      'Verification OTP Code',
    );

    await session.commitTransaction();
    session.endSession();

    return { message: 'Checked Your Email Inbox' };
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();

    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      'user auth error',
      error,
    );
  }
};

const userVarificationIntoDb = async (verificationCode: number) => {
  try {
    if (!verificationCode) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Verification code is required',
        '',
      );
    }

    const updatedUser = await users.findOneAndUpdate(
      { verificationCode },
      { isVerify: true },
      { new: true },
    );

    if (!updatedUser) {
      throw new AppError(httpStatus.NOT_FOUND, 'Invalid verification code', '');
    }

    const jwtPayload = {
      id: updatedUser.id,
      role: updatedUser.role,
      email: updatedUser.email,
    };

    let accessToken: string | null = null;

    if (updatedUser.isVerify) {
      accessToken = jwtHelpers.generateToken(
        jwtPayload,
        config.jwt_access_secret as string,
        config.expires_in as string,
      );
    }

    return {
      message: 'User verification successful',
      accessToken,
    };
  } catch (error: any) {
    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      'Verification auth error',
      error,
    );
  }
};

const chnagePasswordIntoDb = async (
  payload: {
    newpassword: string;
    oldpassword: string;
  },
  id: string,
) => {
  try {
    const isUserExist = await users.findOne(
      {
        $and: [
          { _id: id },
          { isVerify: true },
          { status: USER_STATUS.isProgress },
          { isDeleted: false },
        ],
      },
      { password: 1 },
    );

    if (
      await users.isPasswordMatched(
        config.googleauth as string,
        isUserExist?.password as string,
      )
    ) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "social media auth don't allow change password",
        '',
      );
    }

    if (!isUserExist) {
      throw new AppError(httpStatus.NOT_FOUND, 'User not found', '');
    }

    if (
      !(await users.isPasswordMatched(
        payload.oldpassword,
        isUserExist?.password,
      ))
    ) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        'Old password does not match',
        '',
      );
    }

    const newHashedPassword = await bcrypt.hash(
      payload.newpassword,
      Number(config.bcrypt_salt_rounds),
    );

    const updatedUser = await users.findByIdAndUpdate(
      id,
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
      message: 'Password updated successfully',
    };
  } catch (error: any) {
    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      'Password change failed',
      error,
    );
  }
};

const myProfileIntoDb = async (id: string) => {
  try {
    return await users.findOne({
      $and: [
        { _id: id },
        { isVerify: true },
        { status: USER_STATUS.isProgress },
        { isDeleted: false },
      ],
    });
  } catch (error: any) {
    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      'fatch profiled isuses',
      error,
    );
  }
};

const updateMyProfileIntoDb = async (req: Request, id: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const file = req.file;
    const { username } = req.body;

    const updateFields: Record<string, any> = {};

    if (file) {
      const { secure_url } = (await sendImageToCloudinary(
        file.filename,
        file.path,
      )) as any;

      if (!secure_url) {
        throw new AppError(httpStatus.NOT_FOUND, 'Image upload failed', '');
      }

      updateFields.photo = secure_url;
    }

    if (username) {
      updateFields.username = username;
    }

    if (Object.keys(updateFields).length === 0) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'No valid fields to update',
        '',
      );
    }

    const result = await users.findByIdAndUpdate(id, updateFields, {
      new: true,
      session,
    });

    if (!result) {
      throw new AppError(httpStatus.NOT_FOUND, 'User not found', '');
    }

    await session.commitTransaction();
    session.endSession();

    return { message: 'Successfully updated your profile' };
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();

    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      'Fetch profile issues',
      error,
    );
  }
};

const deleteMyAccountIntoDb = async (userId: string) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const deleteFiles = await createfiles.deleteMany({ userId }, { session });

    if (!deleteFiles) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Issues deleting user files',
        '',
      );
    }

    const deleteFolders = await createfolders.deleteMany(
      { userId },
      { session },
    );

    if (!deleteFolders) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Issues deleting user folders',
        '',
      );
    }

    const deleteUser = await users.findOneAndDelete(
      { _id: userId },
      { session },
    );

    if (!deleteUser) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Issues deleting user account',
        '',
      );
    }

    await session.commitTransaction();
    session.endSession();

    return { message: 'Successfully Deleted User' };
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      'Error deleting user account',
      error,
    );
  }
};

const UserServices = {
  createUserAuthIntoDb,
  userVarificationIntoDb,
  chnagePasswordIntoDb,
  myProfileIntoDb,
  updateMyProfileIntoDb,
  deleteMyAccountIntoDb,
};

export default UserServices;
