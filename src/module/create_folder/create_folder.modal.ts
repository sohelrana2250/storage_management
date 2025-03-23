import { Schema, model } from 'mongoose';
import { CreateFolderModel, TCreateFolder } from './create_folder.interface';
import { FILE_LOCK } from '../../utility/userrole.constant';
import config from '../../app/config';
import bcrypt from 'bcrypt';

const TCreateFolderSchema = new Schema<TCreateFolder, CreateFolderModel>(
  {
    foldername: { type: String, required: true, trim: true },
    userId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    password: { type: String, select: false },
    folderlock: {
      type: String,
      enum: [FILE_LOCK.YES, FILE_LOCK.NO],
      default: FILE_LOCK.NO,
      required: [true, 'Folder lock status is required'],
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

TCreateFolderSchema.pre('save', async function (next) {
  if (this.isModified('password') && this.password) {
    this.password = await bcrypt.hash(
      this.password,
      Number(config.bcrypt_salt_rounds),
    );
  }
  next();
});

TCreateFolderSchema.post('save', function (doc, next) {
  doc.password = '';
  next();
});

TCreateFolderSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.password;
    return ret;
  },
});

TCreateFolderSchema.pre('find', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});
TCreateFolderSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
  next();
});

TCreateFolderSchema.statics.isFolderExist = async function (
  id: string,
): Promise<TCreateFolder | null> {
  return await this.findById(id);
};

TCreateFolderSchema.statics.isPasswordMatched = async function (
  plainTextPassword: string,
  hashPassword: string,
) {
  const password = await bcrypt.compare(plainTextPassword, hashPassword);
  return password;
};

const createfolders = model<TCreateFolder, CreateFolderModel>(
  'createfolders',
  TCreateFolderSchema,
);

export default createfolders;
