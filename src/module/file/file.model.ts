import { Schema, model } from 'mongoose';

import { FILE_LOCK } from '../../utility/userrole.constant';
import config from '../../app/config';
import bcrypt from 'bcrypt';
import { CreateFileModel, TCreateFile } from './file.interface';

const TCreateFileSchema = new Schema<TCreateFile, CreateFileModel>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    folderId: {
      type: Schema.Types.ObjectId,
      ref: 'createfolders',
      required: false,
    },

    folderlock: {
      type: String,
      enum: [FILE_LOCK.YES, FILE_LOCK.NO],
      default: FILE_LOCK.NO,
      required: [true, 'folder lock is required'],
    },

    mimetype: { type: String, required: [true, 'mimtype is not required'] },

    password: { type: String, required: [false, 'password is not required'] },

    filepath: {
      type: String,
      required: [true, 'file path is required'],
      trim: true,
    },
    originalname: {
     type: String,
     required: [true, 'orignal name is required'],
     trim: true,
    },

    filesize: {
      type: Number,
      required: [true, 'file size is required'],
      trim: true,
    },

    isFavourit: { type: Boolean, default: false },

    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// 🔒 **Middleware for Hashing Password**
TCreateFileSchema.pre('save', async function (next) {
  if (this.password) {
    this.password = await bcrypt.hash(
      this.password,
      Number(config.bcrypt_salt_rounds),
    );
  }
  next();
});

TCreateFileSchema.post('save', function (doc, next) {
  doc.password = '';
  next();
});

TCreateFileSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.password;
    return ret;
  },
});



TCreateFileSchema.pre('find', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

TCreateFileSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
  next();
});

TCreateFileSchema.pre('findOne', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

TCreateFileSchema.statics.isFileExist = async function (
  id: string,
): Promise<TCreateFile | null> {
  return await this.findById(id);
};

const createfiles = model<TCreateFile, CreateFileModel>(
  'createfiles',
  TCreateFileSchema,
);

export default createfiles;
