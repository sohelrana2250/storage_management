import express from 'express';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../../utility/userrole.constant';
import validationRequest from '../../middleware/validationRequest';
import CreateFolderValidationSchema from './create_folder.validation';
import CreateFolderController from './create_folder.controller';

const router = express.Router();

router.post(
  '/create_folder',
  auth(USER_ROLE.USER),
  validationRequest(CreateFolderValidationSchema.createFolderSchema),
  CreateFolderController.createFolder,
);

router.get(
  '/find_all_folder',
  auth(USER_ROLE.USER),
  CreateFolderController.findAllFolder,
);
router.get(
  '/find_specific_folder/:id',
  auth(USER_ROLE.USER),
  CreateFolderController.findBySpecificFolder,
);

router.patch(
  '/update_folder_name/:id',
  auth(USER_ROLE.USER),
  validationRequest(CreateFolderValidationSchema.updateFolderSchema),
  CreateFolderController.updateFolderName,
);

router.post(
  '/secure_folder/:folderId',
  auth(USER_ROLE.USER),
  validationRequest(CreateFolderValidationSchema.findSecureFolderSchema),
  CreateFolderController.getSecureFolder,
);

router.post(
  '/secure_file/:fileId',
  auth(USER_ROLE.USER),
  validationRequest(CreateFolderValidationSchema.findSecureFolderSchema),
  CreateFolderController.getSecureFile,
);

router.delete(
  '/delete_folder/:folderId',
  auth(USER_ROLE.USER),
  CreateFolderController.deleteFolder,
);

const CreateFolderRouter = router;

export default CreateFolderRouter;
