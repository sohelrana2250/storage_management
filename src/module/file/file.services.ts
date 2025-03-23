import { Request } from 'express';
import AppError from '../../app/error/AppError';
import httpStatus from 'http-status';
import path from 'path';
import {
  documentMimetypes,
  imageMimeTypes,
  pdfMimeTypes,
  VIDEO_EXTENSIONS,
  VIDEO_MIME_TYPES,
} from '../../utility/fileextension/videofile_extension';
import createfiles from './file.model';
import { FILE_LOCK } from '../../utility/userrole.constant';
import createfolders from '../create_folder/create_folder.modal';
import { sendImageToCloudinary } from '../../utility/sendImageToCloudinary';
import QueryBuilder from '../../app/builder/QueryBuilder';
import { FileData, FileDocument, FileStats } from './file.interface';
import calculatedashboard from '../../utility/calculatedashboard/calculatedashboard';
import mongoose from 'mongoose';

/**
 * Checks if a file is not a video file
 * @param file - The file to check
 * @returns boolean indicating if the file is not a video
 */
const isNotVideoFile = (file: Express.Multer.File): boolean => {
  const fileExtension = path.extname(file.originalname).toLowerCase();

  if (VIDEO_EXTENSIONS.includes(fileExtension)) {
    return false;
  }

  if (
    VIDEO_MIME_TYPES.some(
      (mimeType) =>
        file.mimetype.includes(mimeType) || file.mimetype.startsWith('video/'),
    )
  ) {
    return false;
  }

  return true;
};
/**

 * @param file - The file to upload
 * @param userId - The ID of the user uploading the file
 * @param options - Additional options for saving the file
 * @returns Promise with the result of the upload
 */
const uploadSingleFile = async (
  file: Express.Multer.File,
  userId: string,
  options: {
    folderlock?: string;
    password?: string;
    folderId?: string;
  } = {},
) => {
  const { secure_url } = (await sendImageToCloudinary(
    file.filename,
    file.path,
  )) as any;

  if (!secure_url) {
    throw new AppError(httpStatus.NOT_FOUND, 'Image upload failed', '');
  }

  const fileData = {
    filepath: secure_url,
    filesize: file.size,
    originalname: file.originalname.replace(/\.[^/.]+$/, ''),
    userId,
    mimetype: file.mimetype,
    folderlock: options.folderlock || FILE_LOCK.NO,
    ...(options.password && { password: options.password }),
    ...(options.folderId && { folderId: options.folderId }),
  };

  const fileBuilder = new createfiles(fileData);
  const result = await fileBuilder.save();

  return result;
};

/**
 * @param req
 * @param userId
 * @returns
 */
const uplodeFileIntoDb = async (req: Request, userId: string) => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'At least one file is required',
        '',
      );
    }
    const validFiles = files.filter(isNotVideoFile);

    if (validFiles.length === 0) {
      throw new AppError(
        httpStatus.UNSUPPORTED_MEDIA_TYPE,
        'Only non-video files are accepted. All uploaded files were video files.',
        '',
      );
    }

    if (validFiles.length < files.length) {
      console.warn(
        `${files.length - validFiles.length} video files were rejected`,
      );
    }

    const data = req.body && Object.keys(req.body).length > 0 ? req.body : null;
    const uploadPromises = [];

    if (data?.folderId) {
      const folder = await createfolders.findOne(
        { _id: data.folderId },
        { _id: 1, folderlock: 1 },
      );

      if (!folder) {
        throw new AppError(httpStatus.NOT_FOUND, 'Folder not found', '');
      }

      const folderlock =
        folder.folderlock === FILE_LOCK.NO ? FILE_LOCK.NO : FILE_LOCK.YES;

      uploadPromises.push(
        ...validFiles.map((file) =>
          uploadSingleFile(file, userId, {
            folderlock,
            folderId: data.folderId,
          }),
        ),
      );
    } else if (data?.password) {
      uploadPromises.push(
        ...validFiles.map((file) =>
          uploadSingleFile(file, userId, {
            folderlock: FILE_LOCK.YES,
            password: data.password,
          }),
        ),
      );
    } else {
      uploadPromises.push(
        ...validFiles.map((file) => uploadSingleFile(file, userId)),
      );
    }

    await Promise.all(uploadPromises);

    return {
      files: validFiles.length && { message: 'Successfully Uploaded File' },
      rejectedCount: files.length - validFiles.length,
    };
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      'File upload process failed',
      error,
    );
  }
};

const getAllFolderAndFileIntoDb = async (
  query: Record<string, unknown>,
  userId: string,
) => {
  try {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const fileFolderQuery = new QueryBuilder(
      createfiles
        .find({
          $and: [
            { userId },
            { isDeleted: false },
            { folderlock: FILE_LOCK.NO },
            { createdAt: { $gte: twentyFourHoursAgo } },
          ],
        })
        .populate('folderId'),
      query,
    )
      .filter()
      .sort()
      .paginate()
      .fields();

    const files = await fileFolderQuery.modelQuery;
    const meta = await fileFolderQuery.countTotal();


    const folderMap = new Map();
    const filesWithNoFolder = [];
    for (const file of files as any[]) {
      const fileObj: FileData = file.toObject
        ? file.toObject()
        : (file as FileData);

      if (fileObj.folderId && typeof fileObj.folderId === 'object') {
        const folderId = fileObj.folderId._id.toString();

        if (!folderMap.has(folderId)) {
          folderMap.set(folderId, {
            folderId: folderId,
            folderInfo: {
              _id: folderId,
              foldername: fileObj.folderId.foldername,
              userId: fileObj.folderId.userId,
              folderlock: fileObj.folderId.folderlock,
              mimetype: fileObj.mimetype,
              originalname: fileObj.originalname,

              isDeleted: fileObj.folderId.isDeleted,
              createdAt: fileObj.folderId.createdAt,
              updatedAt: fileObj.folderId.updatedAt,
            },
            //   files: [],
          });
        }

        //    folderMap.get(folderId).files.push({
        //      _id: fileObj._id,
        //      filepath: fileObj.filepath,
        //      filesize: fileObj.filesize,
        //      mimetype: fileObj.mimetype,
        //      isFavourit: fileObj.isFavourit || false,
        //      isDeleted: fileObj.isDeleted,
        //      createdAt: fileObj.createdAt,
        //      updatedAt: fileObj.updatedAt,
        //    });
      } else {
        filesWithNoFolder.push({
          _id: fileObj._id,
          filepath: fileObj.filepath,
          filesize: fileObj.filesize,
          mimetype: fileObj.mimetype,
          originalname: fileObj.originalname,
          isFavourit: fileObj.isFavourit || false,
          isDeleted: fileObj.isDeleted,
          createdAt: fileObj.createdAt,
          updatedAt: fileObj.updatedAt,
        });
      }
    }
    const result = Array.from(folderMap.values());
    if (filesWithNoFolder.length > 0) {
      result.push({
        folderId: null,
        folderInfo: null,
        files: filesWithNoFolder,
      });
    }

    return {
      meta,
      result,
    };
  } catch (error: any) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Error fetching recent folders and files',
      error,
    );
  }
};

const fileDashboardIntoDb = async (userId: string) => {
  try {
    const fileFolderQuery = new QueryBuilder(
      createfiles
        .find({
          $and: [{ userId }, { isDeleted: false }],
        })
        .populate('folderId'),
      {},
    )
      .filter()
      .sort()
      .paginate()
      .fields();

    const files = (await fileFolderQuery.modelQuery) as any;
    const meta = await fileFolderQuery.countTotal();

    const storageMetrics = calculatedashboard.calculateUserStorageMetrics({
      success: true,
      message: 'Successfully find dashboard',
      data: { meta, files },
    });
    const storageFolder = calculatedashboard.getStorageAndFolderCounts({
      success: true,
      message: 'Successfully find dashboard',
      data: { meta, files },
    });

    return {
      meta,
      storageMetrics,
      storageFolder,
    };
  } catch (error: any) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Error  dashboard data filtering issues ',
      error,
    );
  }
};

const getAllImagesIntoDb = async (userId: string) => {
  try {
    const fileFolderQuery = new QueryBuilder(
      createfiles
        .find({
          $and: [
            { userId },
            { folderlock: FILE_LOCK.NO },
            { isDeleted: false },
            { mimetype: { $in: imageMimeTypes } },
          ],
        })
        .populate('folderId'),
      {},
    )
      .filter()
      .sort()
      .paginate()
      .fields();

    const files = (await fileFolderQuery.modelQuery) as any;
    const meta = await fileFolderQuery.countTotal();

    return {
      meta,
      files,
    };
  } catch (error: any) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Error all  images  filtering issues ',
      error,
    );
  }
};

const getAllFolderIntoDb = async (userId: string) => {
  try {
    const FolderQuery = new QueryBuilder(
      createfolders.find({
        $and: [{ userId }, { folderlock: FILE_LOCK.NO }, { isDeleted: false }],
      }),

      {},
    )
      .filter()
      .sort()
      .paginate()
      .fields();

    const folders = (await FolderQuery.modelQuery) as any;
    const meta = await FolderQuery.countTotal();

    return {
      meta,
      folders,
    };
  } catch (error: any) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Error all folder  filtering issues ',
      error,
    );
  }
};

const getAllPdfsIntoDb = async (userId: string) => {
  try {
    const pdfsQuery = new QueryBuilder(
      createfiles.find({
        $and: [
          { userId },
          { folderlock: FILE_LOCK.NO },
          { isDeleted: false },
          { mimetype: { $in: pdfMimeTypes } },
        ],
      }),
      {},
    )
      .filter()
      .sort()
      .paginate()
      .fields();

    const pdfs = (await pdfsQuery.modelQuery) as any;
    const meta = await pdfsQuery.countTotal();

    return {
      meta,
      pdfs,
    };
  } catch (error: any) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Error all psfs filtering issues ',
      error,
    );
  }
};

const getAllDocumentsIntoDb = async (userId: string) => {
  try {
    const docQuery = new QueryBuilder(
      createfiles.find({
        $and: [
          { userId },
          { folderlock: FILE_LOCK.NO },
          { isDeleted: false },
          { mimetype: { $in: documentMimetypes } },
        ],
      }),

      {},
    )
      .filter()
      .sort()
      .paginate()
      .fields();

    const files = (await docQuery.modelQuery) as any;
    const meta = await docQuery.countTotal();

    return { meta, files };
  } catch (error: any) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Error all psfs filtering issues ',
      error,
    );
  }
};

const specific_Folder_Ways_AllFiles_IntoDb = async (
  folderId: string,
  userId: string,
) => {
  try {
    const specificFolderQuery = new QueryBuilder(
      createfiles.find({
        $and: [
          { userId },
          { folderId },
          { isDeleted: false },
          { folderlock: FILE_LOCK.NO },
        ],
      }),
      {},
    )
      .filter()
      .sort()
      .paginate()
      .fields();

    const files = (await specificFolderQuery.modelQuery) as any;
    const meta = await specificFolderQuery.countTotal();

    return { meta, files };
  } catch (error: any) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Error all psfs filtering issues ',
      error,
    );
  }
};

const getAllLogFileIntoDb = async (userId: string) => {
  try {
    const result = createfiles
      .find({
        userId,
        folderlock: FILE_LOCK.YES,
        isDeleted: false,
      })
      .select({
        _id: 1,
        folderId: 1,
        folderlock: 1,
        mimetype: 1,
        isFavourit: 1,
        createdAt: 1,
        updatedAt: 1,
      });
    return result;
  } catch (error: any) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Error retrieving log files',
      error,
    );
  }
};

const getAllFolderAndFilesByDateIntoDb = async (
  userId: string,
  date?: string,
) => {
  try {
    let startDate: Date, endDate: Date;

    if (date) {
      const [day, month, year] = date
        .split('/')
        .map((num) => parseInt(num, 10));
      startDate = new Date(year, month - 1, day, 0, 0, 0);
      endDate = new Date(year, month - 1, day, 23, 59, 59);
    } else {
      endDate = new Date();
      startDate = new Date();
      startDate.setHours(startDate.getHours() - 24);
    }
    const baseQuery = {
      $and: [
        { userId },
        { isDeleted: false },
        { folderlock: FILE_LOCK.NO },
        {
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      ],
    };

    const fileFolderQuery = new QueryBuilder(
      createfiles.find(baseQuery).populate('folderId'),
      {},
    )
      .filter()
      .sort()
      .paginate()
      .fields();

    const files = await fileFolderQuery.modelQuery;
    const meta = await fileFolderQuery.countTotal();

    if (files.length === 0) {
      return {
        meta,
        result: [],
        message: `No files found for date ${date || 'in the last 24 hours'}`,
      };
    }

    const folderMap = new Map();
    const filesWithNoFolder = [];

    for (const file of files as any[]) {
      const fileObj: FileData = file.toObject
        ? file.toObject()
        : (file as FileData);

      if (fileObj.folderId && typeof fileObj.folderId === 'object') {
        const folderId = fileObj.folderId._id.toString();

        if (!folderMap.has(folderId)) {
          folderMap.set(folderId, {
            folderId: folderId,
            folderInfo: {
              _id: folderId,
              foldername: fileObj.folderId.foldername,
              userId: fileObj.folderId.userId,
              folderlock: fileObj.folderId.folderlock,
              mimetype: fileObj.mimetype,
              originalname: fileObj.originalname,
              isDeleted: fileObj.folderId.isDeleted,
              createdAt: fileObj.folderId.createdAt,
              updatedAt: fileObj.folderId.updatedAt,
            },
            files: [],
          });
        }

        folderMap.get(folderId).files.push({
          _id: fileObj._id,
          filepath: fileObj.filepath,
          filesize: fileObj.filesize,
          mimetype: fileObj.mimetype,
          originalname: fileObj.originalname,
          isFavourit: fileObj.isFavourit || false,
          isDeleted: fileObj.isDeleted,
          createdAt: fileObj.createdAt,
          updatedAt: fileObj.updatedAt,
        });
      } else {
        filesWithNoFolder.push({
          _id: fileObj._id,
          filepath: fileObj.filepath,
          filesize: fileObj.filesize,
          mimetype: fileObj.mimetype,
          isFavourit: fileObj.isFavourit || false,
          isDeleted: fileObj.isDeleted,
          createdAt: fileObj.createdAt,
          updatedAt: fileObj.updatedAt,
        });
      }
    }

    const result = Array.from(folderMap.values());
    if (filesWithNoFolder.length > 0) {
      result.push({
        folderId: null,
        folderInfo: null,
        files: filesWithNoFolder,
      });
    }

    return {
      meta,
      result,
      message:
        result.length > 0
          ? `Files found for date ${date || 'in the last 24 hours'}`
          : `No files found for date ${date || 'in the last 24 hours'}`,
    };
  } catch (error: any) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      `Error fetching folders and files for date ${date || 'in the last 24 hours'}`,
      error,
    );
  }
};
// listed my  favorite files

const isMyFavoriteFileAndFolderIntoDb = async (
  id: string,
  userId: string,
  isFavourit: boolean,
) => {

     

  try {
    const isExistFile = await createfiles.findOne(
      {
        $and: [
          { userId },
          { _id: id },
          { isDeleted: false },
          { folderlock: FILE_LOCK.NO },
        ],
      },
      { _id: 1 },
    );

    if (!isExistFile) {
      throw new AppError(httpStatus.NOT_FOUND, 'file is not founded', '');
    }
    const result = await createfiles.findByIdAndUpdate(
      isExistFile.id,
      { isFavourit },
      { new: true, upsert: true },
    );
    return result && { message: 'Successfully Listed Your Favourit File' };
  } catch (error: any) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      `Error my favorite folders and files for date `,
      error,
    );
  }
};

const getAllFavorite_FolderAndFileIntoDb = async (
  query: Record<string, unknown>,
  userId: string,
) => {
  try {
    const fileFolderQuery = new QueryBuilder(
      createfiles
        .find({
          $and: [
            { userId },
            { isDeleted: false },
            { folderlock: FILE_LOCK.NO },
            { isFavourit: true },
          ],
        })
        .populate('folderId'),
      query,
    )
      .filter()
      .sort()
      .paginate()
      .fields();

    const files = await fileFolderQuery.modelQuery;
    const meta = await fileFolderQuery.countTotal();

    const folderMap = new Map();
    const filesWithNoFolder = [];
    for (const file of files as any[]) {
      const fileObj: FileData = file.toObject
        ? file.toObject()
        : (file as FileData);

      if (fileObj.folderId && typeof fileObj.folderId === 'object') {
        const folderId = fileObj.folderId._id.toString();

        if (!folderMap.has(folderId)) {
          folderMap.set(folderId, {
            folderId: folderId,
            folderInfo: {
              _id: folderId,
              foldername: fileObj.folderId.foldername,
              userId: fileObj.folderId.userId,
              folderlock: fileObj.folderId.folderlock,
              mimetype: fileObj.mimetype,
              originalname: fileObj.originalname,
              isDeleted: fileObj.folderId.isDeleted,
              createdAt: fileObj.folderId.createdAt,
              updatedAt: fileObj.folderId.updatedAt,
            },
            files: [],
          });
        }

        folderMap.get(folderId).files.push({
          _id: fileObj._id,
          filepath: fileObj.filepath,
          filesize: fileObj.filesize,
          mimetype: fileObj.mimetype,
          originalname: fileObj.originalname,
          isFavourit: fileObj.isFavourit || false,
          isDeleted: fileObj.isDeleted,
          createdAt: fileObj.createdAt,
          updatedAt: fileObj.updatedAt,
        });
      } else {
        filesWithNoFolder.push({
          _id: fileObj._id,
          filesize: fileObj.filesize,
          mimetype: fileObj.mimetype,
          isFavourit: fileObj.isFavourit || false,
          isDeleted: fileObj.isDeleted,
          createdAt: fileObj.createdAt,
          updatedAt: fileObj.updatedAt,
        });
      }
    }
    const result = Array.from(folderMap.values());
    if (filesWithNoFolder.length > 0) {
      result.push({
        folderId: null,
        folderInfo: null,
        files: filesWithNoFolder,
      });
    }

    return {
      meta,
      result,
    };
  } catch (error: any) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Error fetching  favorite folders and files',
      error,
    );
  }
};

// duplicate file and folder

const duplicateFileAndFolderIntoDb = async (userId: string, id: string) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const source = await createfiles
      .findOne(
        { userId, _id: id, isDeleted: false },
        {
          userId: 1,
          folderlock: 1,
          mimetype: 1,
          filepath: 1,
          filesize: 1,
          folderId: 1,
          originalname:1
        },
      )
      .session(session);

    if (!source) {
      throw new AppError(httpStatus.NOT_FOUND, 'File not found', '');
    }

    if (source.folderId) {
      const parentFolder = await createfolders
        .findOne(
          { _id: source.folderId, isDeleted: false },
          { userId: 1, folderlock: 1, foldername: 1 },
        )
        .session(session);

      if (!parentFolder) {
        throw new AppError(httpStatus.NOT_FOUND, 'Parent folder not found', '');
      }
      const duplicateFolder = await createfolders.create(
        [
          {
            foldername: parentFolder.foldername,
            userId: parentFolder.userId,
          },
        ],
        { session },
      );

      if (!duplicateFolder || duplicateFolder.length === 0) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'Failed to create duplicate folder',
          '',
        );
      }

      const filesInFolder = await createfiles
        .find({ folderId: source.folderId, isDeleted: false })
        .session(session);

      const duplicateFilesData = filesInFolder.map((file) => ({
        userId: file.userId,
        folderId: duplicateFolder[0]._id,
        folderlock: file.folderlock,
        mimetype: file.mimetype,
        originalname: file.originalname,
        filepath: file.filepath,
        filesize: file.filesize,
      }));

      if (duplicateFilesData.length > 0) {
        await createfiles.insertMany(duplicateFilesData, { session });
      }

      await session.commitTransaction();
      return { message: 'Successfully created duplicate folder with files' };
    }

    const duplicateFile = await createfiles.create(
      [
        {
          userId,
          folderlock: source.folderlock,
          mimetype: source.mimetype,
          filepath: source.filepath,
          filesize: source.filesize,
          originalname:source.originalname
        },
      ],
      { session },
    );

    if (!duplicateFile || duplicateFile.length === 0) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Failed to create duplicate file',
        '',
      );
    }

    await session.commitTransaction();
    return { message: 'Successfully created duplicate file' };
  } catch (error: any) {
    await session.abortTransaction();
    throw error instanceof AppError
      ? error
      : new AppError(
          httpStatus.INTERNAL_SERVER_ERROR,
          'An error occurred during duplication',
          error.message,
        );
  } finally {
    session.endSession();
  }
};

// copy file

const copyFileIntoDb = async (
  userId: string,
  fileId: string,
  folderId: string,
) => {
  try {
    const isExistFile = await createfiles.findOne(
      { $and: [{ userId }, { _id: fileId }, { isDeleted: false }] },
      { userId: 1, folderlock: 1, mimetype: 1, filepath: 1, filesize: 1,originalname:1 },
    );

    if (!isExistFile) {
      throw new AppError(httpStatus.NOT_FOUND, 'file is not founded', '');
    }

    const isExistFolder = await createfolders.findOne(
      { $and: [{ userId }, { _id: folderId }, { isDeleted: false }] },
      { _id: 1 },
    );

    if (!isExistFolder) {
      throw new AppError(httpStatus.NOT_FOUND, 'folder is not founded', '');
    }

    const copyFileBuilder = new createfiles({
      userId,
      folderId,
      mimetype: isExistFile.mimetype,
      filepath: isExistFile.filepath,
      filesize: isExistFile.filesize,
      originalname:isExistFile.originalname
    });

    const copyfile = await copyFileBuilder.save();

    return copyfile && { message: 'Successfully Copy File ' };
  } catch (error: any) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Error copy file server issues ',
      error,
    );
  }
};

const deleteFilesIntoDb = async (userId: string, id: string) => {
  try {
    const isFilesyours = await createfiles.findOne(
      { $and: [{ userId }, { _id: id }, { isDeleted: false }] },
      { _id: 1 },
    );
    if (!isFilesyours) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'That file is not yours', '');
    }
    const result = await createfiles.findByIdAndDelete(id);
    return result && { message: 'delete file successfully' };
  } catch (error: any) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Error delete  file server issues ',
      error,
    );
  }
};

const renameFileIntoDb = async (
  userId: string,
  id: string,
  originalname: string,
) => {
  try {
    const result = await createfiles.findOneAndUpdate(
      { _id: id, userId, isDeleted: false },
      { originalname },
      { new: true },
    );

    if (!result) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'File not found or rename failed',
        '',
      );
    }

    return { message: 'Successfully Renamed File' };
  } catch (error: any) {
    throw new AppError(httpStatus.NOT_FOUND, 'Error renaming file', error);
  }
};

const FileServices = {
  uplodeFileIntoDb,
  getAllFolderAndFileIntoDb,
  fileDashboardIntoDb,
  getAllImagesIntoDb,
  getAllFolderIntoDb,
  getAllPdfsIntoDb,
  getAllDocumentsIntoDb,
  specific_Folder_Ways_AllFiles_IntoDb,
  getAllLogFileIntoDb,
  getAllFolderAndFilesByDateIntoDb,
  getAllFavorite_FolderAndFileIntoDb,
  isMyFavoriteFileAndFolderIntoDb,
  duplicateFileAndFolderIntoDb,
  copyFileIntoDb,
  deleteFilesIntoDb,
  renameFileIntoDb,
};

export default FileServices;
