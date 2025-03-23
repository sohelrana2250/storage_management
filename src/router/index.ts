import express from 'express';
import { ContructRouter } from '../module/contract/contract.routes';
import UserRouter from '../module/user/user.routes';
import AuthRouter from '../module/auth/auth.routes';
import CreateFolderRouter from '../module/create_folder/create_folder.routes';
import FileRoutes from '../module/file/file.routes';

const router = express.Router();
const moduleRouth = [
  { path: '/user', route: UserRouter },
  { path: '/auth', route: AuthRouter },
  { path: '/folder', route: CreateFolderRouter },
  { path: '/file', route: FileRoutes },
  { path: '/contract', route: ContructRouter },
];

moduleRouth.forEach((v) => router.use(v.path, v.route));

export default router;
