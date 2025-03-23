import { Model, Types } from 'mongoose';
import { USER_ROLE } from '../../utility/userrole.constant';

export type TUser = {

  username:string;
  role: 'USER' | 'ADMIN';
  password: string;
  email: string;
  photo?: string;
  status: 'Blocked' | 'is-Progress';
  isVerify: Boolean;
  verificationCode: Number;
  isDeleted?: boolean;
};

export interface UserModel extends Model<TUser> {
  isUserExistByCustomId(id: string): Promise<TUser>;
  isPasswordMatched(
    userSendingPassword: string,
    existingPassword: string,
  ): Promise<boolean>;
  isJWTIssuesBeforePasswordChange(
    passwordChangeTimestamp: Date,
    jwtIssuesTime: number,
  ): Promise<boolean>;
}

export type TUserRole = keyof typeof USER_ROLE;
