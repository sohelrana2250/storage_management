

import httpStatus from 'http-status';
import AppError from '../app/error/AppError';
import users from '../module/user/user.model';

const UnauthorizedUserChecker = async () => {
  await users
    .deleteMany({ isVerify: false })
    .then(() => {})
    .catch((error) => {
      throw new AppError(
        httpStatus.SERVICE_UNAVAILABLE,
        'Unauthorized User Checker Issues',
        error,
      );
    });
};

export const unauthorizedUser = {
  UnauthorizedUserChecker,
};
