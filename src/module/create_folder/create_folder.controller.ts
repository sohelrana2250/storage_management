import { RequestHandler } from 'express';
import catchAsync from '../../utility/catchAsync';
import CreateFolderServerice from './create_folder.services';
import sendRespone from '../../utility/sendRespone';
import httpStatus from 'http-status';

const createFolder: RequestHandler = catchAsync(async (req, res) => {
  const result = await CreateFolderServerice.createFolderIntoDb(
    req.body,
    req.user.id,
  );
  sendRespone(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Successfully create folder',
    data: result,
  });
});

const findAllFolder: RequestHandler = catchAsync(async (req, res) => {
  const result = await CreateFolderServerice.findAllFolderIntoDb(
    req.query,
    req.user.id,
  );
  sendRespone(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Successfully get all folder',
    data: result,
  });
});

const findBySpecificFolder: RequestHandler = catchAsync(async (req, res) => {
  const result = await CreateFolderServerice.findBySpecificFolderIntoDb(
    req.params.id,
    req.user.id,
  );
  sendRespone(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Successfully find specific folder',
    data: result,
  });
});

const updateFolderName: RequestHandler = catchAsync(async (req, res) => {
  const result = await CreateFolderServerice.updateFolderNameIntoDb(
    req.params.id,
    req.user.id,
    req.body,
  );
  sendRespone(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Successfully Update Folder Name ',
    data: result,
  });
});

const deleteFolder: RequestHandler = catchAsync(async (req, res) => {
  const result = await CreateFolderServerice.deleteFolderIntoDb(
    req.params.folderId,
    req.user.id,
  );
  sendRespone(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Successfully Folder Delete ',
    data: result,
  });
});

const getSecureFolder: RequestHandler = catchAsync(async (req, res) => {
  const result = await CreateFolderServerice.getSecureFolderIntoDb(
    req.user.id,
    req.params.folderId,
    req.body.password,
  );
  sendRespone(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Successfully Find Secure Folder Data ',
    data: result,
  });
});

const getSecureFile: RequestHandler = catchAsync(async (req, res) => {
  const result = await CreateFolderServerice.getSecureFileIntoDb(
    req.user.id,
    req.params.fileId,
    req.body.password,
  );
  sendRespone(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Successfully Find Secure File Data ',
    data: result,
  });
});

const CreateFolderController = {
  createFolder,
  findAllFolder,
  findBySpecificFolder,
  updateFolderName,
  deleteFolder,
  getSecureFolder,
  getSecureFile,
};

export default CreateFolderController;
