import { Model, Types } from 'mongoose';

export type TCreateFolder = {
  foldername: string;
  userId: Types.ObjectId;
  folderlock: 'YES' | 'NO';
  password?:string;
  isDeleted?: boolean;
};

export interface CreateFolderModel extends Model<TCreateFolder> {
  // eslint-disable-next-line no-unused-vars
  isFolderExist(id: string): Promise<TCreateFolder>;
  isPasswordMatched(
     userSendingPassword: string,
     existingPassword: string,
   ): Promise<boolean>;
  
}
