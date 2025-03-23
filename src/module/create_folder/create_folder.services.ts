import httpStatus from 'http-status';
import AppError from '../../app/error/AppError';
import { TCreateFolder } from './create_folder.interface';
import createfolders from './create_folder.modal';
import QueryBuilder from '../../app/builder/QueryBuilder';
import { FILE_LOCK } from '../../utility/userrole.constant';
import createfiles from '../file/file.model';
import mongoose from 'mongoose';

const createFolderIntoDb = async (
  payload: Partial<TCreateFolder>,
  userId: string,
) => {
  try {
    if (payload.password) {
      payload.folderlock = FILE_LOCK.YES;
      const createFolderBuilder = new createfolders({ ...payload, userId });
      const result = await createFolderBuilder.save();
      if (!result) {
        throw new AppError(
          httpStatus.NOT_ACCEPTABLE,
          'create folder issues ',
          '',
        );
      }
      return result && { messsage: 'successfully create folder' };
    }
    const createFolderBuilder = new createfolders({ ...payload, userId });
    const result = await createFolderBuilder.save();
    if (!result) {
      throw new AppError(
        httpStatus.NOT_ACCEPTABLE,
        'create folder issues ',
        '',
      );
    }
    return result && { messsage: 'successfully create folder' };
  } catch (error: any) {
    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      'create folder section server issues',
      error,
    );
  }
};

const findAllFolderIntoDb = async (
  query: Record<string, unknown>,
  userId: string,
) => {
  try {
    const folderQuery = new QueryBuilder(createfolders.find({ userId }), query)
      .search(['foldername'])
      .filter()
      .sort()
      .paginate()
      .fields();

    const result = await folderQuery.modelQuery;
    const meta = await folderQuery.countTotal();

    return {
      meta,
      result,
    };
  } catch (error: any) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Error  create folder filtering ',
      error,
    );
  }
};

const findBySpecificFolderIntoDb = async (id: string, userId: string) => {
  try {
    return await createfolders.findOne({ $and: [{ _id: id }, { userId }] });
  } catch (error: any) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Error specific folder filtering  ',
      error,
    );
  }
};

const updateFolderNameIntoDb = async (
  id: string,
  userId: string,
  payload: Partial<TCreateFolder>,
) => {
  try {
    const result = await createfolders.findOneAndUpdate(
      { $and: [{ _id: id, userId }] },
      payload,
      { new: true, upsert: true },
    );
    if (!result) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        'thist folder not exist in the database',
        '',
      );
    }
    return result && { message: 'Successfully Rename Folder' };
  } catch (error: any) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Error  update folder name issues   ',
      error,
    );
  }
};

const getSecureFolderIntoDb = async (
  userId: string,
  folderId: string,
  password: string,
) => {
  try {
    const folder = await createfolders.findOne(
      {
        userId,
        _id: folderId,
        isDeleted: false,
        folderlock: FILE_LOCK.YES,
      },
      { _id: 1, password: 1 },
    );

    if (!folder) {
      throw new AppError(httpStatus.NOT_FOUND, 'Folder not found', '');
    }

    if (
      !(await createfolders.isPasswordMatched(
        password,
        folder.password as string,
      ))
    ) {
      throw new AppError(httpStatus.FORBIDDEN, 'Password does not match', '');
    }
    const queryBuilder = new QueryBuilder(
      createfiles.find({ folderId: folder._id }),
      {},
    )
      .filter()
      .sort()
      .paginate()
      .fields();

    const [result, meta] = await Promise.all([
      queryBuilder.modelQuery,
      queryBuilder.countTotal(),
    ]);

    return { meta, result };
  } catch (error: any) {
    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      'Error  secure folder data filtering issues   ',
      error,
    );
  }
};

const getSecureFileIntoDb = async (
  userId: string,
  fileId: string,
  password: string,
) => {
  try {
    const secureFile = await createfiles.findOne(
      {
        userId,
        _id: fileId,
        isDeleted: false,
        folderlock: FILE_LOCK.YES,
      },
      { _id: 1, password: 1 },
    );
    if (!secureFile) {
      throw new AppError(httpStatus.NOT_FOUND, 'File not found', '');
    }

    if (
      !(await createfolders.isPasswordMatched(
        password,
        secureFile.password as string,
      ))
    ) {
      throw new AppError(httpStatus.FORBIDDEN, 'Password does not match', '');
    }
    return await createfiles.findById(secureFile._id);
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      'Error retrieving secure file',
      error,
    );
  }
};

const deleteFolderIntoDb = async (id: string, userId: string) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const deleteFiles = await createfiles.deleteMany(
      {
        userId,
        folderId: id,
        isDeleted: false,
      },
      { session },
    );
    if (!deleteFiles) {
      throw new AppError(httpStatus.FORBIDDEN, 'Files deletion issues', '');
    }

    const deleteFolder = await createfolders.findByIdAndDelete(id, { session });

    if (!deleteFolder) {
      throw new AppError(httpStatus.FORBIDDEN, 'Folder deletion issues', '');
    }

    await session.commitTransaction();
    session.endSession();

    return { message: 'Successfully Deleted Folder' };
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();

    throw new AppError(httpStatus.NOT_FOUND, 'Error deleting folder', error);
  }
};

const CreateFolderServerice = {
  createFolderIntoDb,
  findAllFolderIntoDb,
  findBySpecificFolderIntoDb,
  updateFolderNameIntoDb,
  deleteFolderIntoDb,
  getSecureFolderIntoDb,
  getSecureFileIntoDb,
};

export default CreateFolderServerice;
