import { UploadApiResponse, v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import config from '../app/config';
import AppError from '../app/error/AppError';
import httpStatus from 'http-status';

dotenv.config();

cloudinary.config({
  cloud_name: config.uplode_file_cloudinary.cloudinary_cloud_name,
  api_key: config.uplode_file_cloudinary.cloudinary_api_key,
  api_secret: config.uplode_file_cloudinary.cloudinary_api_secret,
});

export const sendImageToCloudinary = async (
  imageName: string,
  filePath: string,
): Promise<UploadApiResponse> => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      public_id: imageName,
      resource_type: 'auto',
    });

    await fs.unlink(filePath);

    return result;
  } catch (error: any) {
    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      'Failed to upload image to Cloudinary',
      error,
    );
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'src/uploads/');
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

export const upload = multer({ storage });
