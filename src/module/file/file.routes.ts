import express, { NextFunction, Request, Response } from 'express';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../../utility/userrole.constant';
import { upload } from '../../utility/sendImageToCloudinary';
import validationRequest from '../../middleware/validationRequest';
import FileValidationSchema from './file.validation';
import FileController from './file.controller';

const routes = express.Router();

routes.post(
  '/uplodeing_file',
  auth(USER_ROLE.USER),
  upload.array('file'),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body && req.body.data) {
      try {
        req.body = JSON.parse(req.body.data);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid JSON data provided',
          errorSources: [
            {
              path: '',
              message: 'Invalid JSON data provided',
            },
          ],
        });
      }
    } else {
      req.body = {};
    }
    next();
  },
  validationRequest(FileValidationSchema.fileUplodingSchema),
  FileController.uplodeFile,
);

routes.get(
  '/find_all_filefolder',
  auth(USER_ROLE.USER),
  FileController.getAllFolderAndFile,
);
routes.get(
  '/file_dashboard',
  auth(USER_ROLE.USER),
  FileController.fileDashboard,
);
routes.get(
  '/find_all_images',
  auth(USER_ROLE.USER),
  FileController.getAllImges,
);
routes.get(
  '/find_all_folders',
  auth(USER_ROLE.USER),
  FileController.getAllFolder,
);
routes.get('/find_all_pdfs', auth(USER_ROLE.USER), FileController.getAllPdfs);

routes.get(
  '/find_all_docs',
  auth(USER_ROLE.USER),
  FileController.getAllDocuments,
);
routes.get(
  '/specific_folder/:folderId',
  auth(USER_ROLE.USER),
  FileController.specific_Folder_Ways_AllFiles,
);

routes.get(
  '/find_all_log_files',
  auth(USER_ROLE.USER),
  FileController.getAllLogFile,
);
routes.get(
  '/get_all_file_folder_by_date',
  auth(USER_ROLE.USER),
  FileController.getAllFolderAndFilesByDate,
);

routes.get(
  '/my_favorite_file_folder',
  auth(USER_ROLE.USER),
  FileController.getAllFavorite_FolderAndFile,
);

routes.patch(
  '/my_favorite/:fileId',
  auth(USER_ROLE.USER),
  validationRequest(FileValidationSchema.fileAndFolderFavouritSchema),
  FileController.isMyFavoriteFileAndFolder,
);
routes.get(
  '/duplicate_file_and_folder/:fileId',
  auth(USER_ROLE.USER),
  FileController.duplicateFileAndFolder,
);
routes.post(
  '/copy_file/:fileId',
  auth(USER_ROLE.USER),
  validationRequest(FileValidationSchema.copyFileSchema),
  FileController.copyFile,
);
routes.patch(
  '/rename_file/:fileId',
  auth(USER_ROLE.USER),
  validationRequest(FileValidationSchema.renameFileSchema),
  FileController.renameFile,
);

routes.delete(
  '/delete_file/:fileId',
  auth(USER_ROLE.USER),
  FileController.deleteFiles,
);

const FileRoutes = routes;
export default FileRoutes;
