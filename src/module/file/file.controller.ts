import { RequestHandler } from 'express';
import catchAsync from '../../utility/catchAsync';
import FileServices from './file.services';
import sendRespone from '../../utility/sendRespone';
import httpStatus from 'http-status';

const uplodeFile: RequestHandler = catchAsync(async (req, res) => {
  const result = await FileServices.uplodeFileIntoDb(req, req.user.id);
  sendRespone(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Successfully Uplode File',
    data: result,
  });
});

const getAllFolderAndFile: RequestHandler = catchAsync(async (req, res) => {
  const result = await FileServices.getAllFolderAndFileIntoDb(
    req.query,
    req.user.id,
  );
  sendRespone(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Successfully file all files',
    data: result,
  });
});

const fileDashboard: RequestHandler = catchAsync(async (req, res) => {
  const result = await FileServices.fileDashboardIntoDb(req.user.id);
  sendRespone(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Successfully  find dashboard',
    data: result,
  });
});

const getAllImges: RequestHandler = catchAsync(async (req, res) => {
  const result = await FileServices.getAllImagesIntoDb(req.user.id);
  sendRespone(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Successfully Find All Images',
    data: result,
  });
});

const getAllFolder: RequestHandler = catchAsync(async (req, res) => {
  const result = await FileServices.getAllFolderIntoDb(req.user.id);
  sendRespone(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Successfully Find All Folders',
    data: result,
  });
});

const getAllPdfs: RequestHandler = catchAsync(async (req, res) => {

     

  const result = await FileServices.getAllPdfsIntoDb(req.user.id);
  sendRespone(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Successfully Find All Pdfs',
    data: result,
  });
});

const getAllDocuments: RequestHandler = catchAsync(async (req, res) => {
  const result = await FileServices.getAllDocumentsIntoDb(req.user.id);
  sendRespone(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Successfully Find All Docs',
    data: result,
  });
});

const specific_Folder_Ways_AllFiles: RequestHandler = catchAsync(
  async (req, res) => {
    const result = await FileServices.specific_Folder_Ways_AllFiles_IntoDb(
      req.params.folderId,
      req.user.id,
    );
    sendRespone(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Successfully Find Specific Folder ways All files',
      data: result,
    });
  },
);

const getAllLogFile: RequestHandler = catchAsync(async (req, res) => {
  const result = await FileServices.getAllLogFileIntoDb(req.user.id);
  sendRespone(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Successfully Find All Log Files',
    data: result,
  });
});

const getAllFolderAndFilesByDate: RequestHandler = catchAsync(
  async (req, res) => {
    const { date } = req.query as any;
    const result = await FileServices.getAllFolderAndFilesByDateIntoDb(
      req.user.id,
      date,
    );
    sendRespone(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Successfully Find Calender Ways File/Folders',
      data: result,
    });
  },
);

const getAllFavorite_FolderAndFile: RequestHandler = catchAsync(
  async (req, res) => {
    const result = await FileServices.getAllFavorite_FolderAndFileIntoDb(
      req.params,
      req.user.id,
    );
    sendRespone(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Successfully Find  My Favorite File/Folders',
      data: result,
    });
  },
);

const isMyFavoriteFileAndFolder: RequestHandler = catchAsync(
  async (req, res) => {
    const result = await FileServices.isMyFavoriteFileAndFolderIntoDb(
      req.params.fileId,
      req.user.id,
      req.body.isFavourit,
    );
    sendRespone(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Successfully Listed Favorite',
      data: result,
    });
  },
);

const duplicateFileAndFolder: RequestHandler = catchAsync(async (req, res) => {
  const result = await FileServices.duplicateFileAndFolderIntoDb(
    req.user.id,
    req.params.fileId,
  );
  sendRespone(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Successfully Duplicate',
    data: result,
  });
});

const copyFile: RequestHandler = catchAsync(async (req, res) => {
  const result = await FileServices.copyFileIntoDb(
    req.user.id,
    req.params.fileId,
    req.body.folderId,
  );
  sendRespone(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Successfully Copy File',
    data: result,
  });
});

const deleteFiles: RequestHandler = catchAsync(async (req, res) => {
  const result = await FileServices.deleteFilesIntoDb(
    req.user.id,
    req.params.fileId,
  );
  sendRespone(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Successfully Delete File',
    data: result,
  });
});

const renameFile: RequestHandler = catchAsync(async (req, res) => {
  const result = await FileServices.renameFileIntoDb(
    req.user.id,
    req.params.fileId,
    req.body.originalname
  );
  sendRespone(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Successfully rename File',
    data: result,
  });
});

const FileController = {
  uplodeFile,
  getAllFolderAndFile,
  fileDashboard,
  getAllImges,
  getAllFolder,
  getAllPdfs,
  getAllDocuments,
  specific_Folder_Ways_AllFiles,
  getAllLogFile,
  getAllFolderAndFilesByDate,
  getAllFavorite_FolderAndFile,
  isMyFavoriteFileAndFolder,
  duplicateFileAndFolder,
  copyFile,
  deleteFiles,
  renameFile,
};

export default FileController;
