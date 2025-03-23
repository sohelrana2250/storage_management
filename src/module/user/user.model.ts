import { Schema, model } from 'mongoose';
import { TUser, UserModel } from './user.interface';
import bcrypt from 'bcrypt';
import { USER_ROLE, USER_STATUS } from '../../utility/userrole.constant';
import config from '../../app/config';

const TUserSchema = new Schema<TUser, UserModel>(
  {
    username: {
      type: String,
      required: [true, 'user name is Required'],
    },
    password: { type: String, required: [true, 'Password is Required'] },

    email: {
      type: String,
      required: [true, 'Email is Required'],
      trim: true,
      unique: true,
    },
    role: {
      type: String,
      enum: {
        values: [USER_ROLE.ADMIN, USER_ROLE.USER],
        message: '{VALUE} is Not Required',
      },
      default: USER_ROLE.USER,
      required: [true, 'Role is Required'],
    },
    photo: {
      type: String,
      required: [false, 'phot is not required'],
      default: null,
    },
    status: {
      type: String,
      enum: {
        values: [USER_STATUS.blocked, USER_STATUS.isProgress],
        message: '{VALUE} is not required',
      },
      required: [true, 'Status is Required'],
      default: USER_STATUS.isProgress,
    },
    verificationCode: {
      type: Number,
      required: [true, 'verificationCode Is Requred'],
      unique:true
    },
    isVerify: {
      type: Boolean,
      required: [false, 'is Verify is Required'],
      default: false,
    },
    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is Required'],
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

TUserSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.password;
    return ret;
  },
});

// mongoose middlewere
TUserSchema.pre('save', async function (next) {
  const user = this;
  user.password = await bcrypt.hash(
    user.password,
    Number(config.bcrypt_salt_rounds as string),
  );

  next();
});
TUserSchema.post('save', function (doc, next) {
  doc.password = '';
  next();
});

TUserSchema.pre('find', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});
TUserSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
  next();
});
TUserSchema.pre('findOne', function (next) {
  this.find({ isDeleted: { $ne: true } });

  next();
});

TUserSchema.statics.isUserExistByCustomId = async function (id: string) {
  return await users.findOne({ id });
};
TUserSchema.statics.isPasswordMatched = async function (
  plainTextPassword: string,
  hashPassword: string,
) {
  const password = await bcrypt.compare(plainTextPassword, hashPassword);
  return password;
};

TUserSchema.statics.isJWTIssuesBeforePasswordChange = async function (
  passwordChangeTimestamp: Date,
  jwtIssuesTime: number,
) {
  const passwordChangeTime = new Date(passwordChangeTimestamp).getTime() / 1000;
  return passwordChangeTime > jwtIssuesTime;
};

const users = model<TUser, UserModel>('users', TUserSchema);
export default users;
