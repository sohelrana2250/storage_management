import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import httpStatus from 'http-status';
import AppError from '../app/error/AppError';

import catchAsync from '../utility/catchAsync';

import config from '../app/config';
import { TUserRole } from '../module/user/user.interface';
import users from '../module/user/user.model';

const auth = (...requireRoles: TUserRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;
    if (!token) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'You are not Authorized', '');
    }

    let decoded;

   

    try {
      decoded = jwt.verify(
        token,
        config.jwt_access_secret as string,
      ) as JwtPayload;
    } catch (error) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'Unauthorized', '');
    }



    const { role, id } = decoded;

   

    const isUserExist = users.findOne({ _id: id }, { _id: 1 });
    if (!isUserExist) {
      throw new AppError(httpStatus.NOT_FOUND, 'This User is Not Founded', '');
    }
    if (requireRoles && !requireRoles.includes(role)) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'Yout Role Not Exist', '');
    }
    req.user = decoded as JwtPayload;

    next();
  });
};

export default auth;
