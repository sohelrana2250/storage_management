import { Model, Types } from 'mongoose';

export type TCreateFile = {
 
  userId: Types.ObjectId;
  folderId?:Types.ObjectId;
  folderlock: 'YES' | 'NO';
  password?:string;
  filepath:string;
  originalname:string;
  filesize:number;
  mimetype:string;
  isFavourit:boolean;
  isDeleted?: boolean;
};

// Define the types for your documents
export interface FileDocument {
     toObject?: () => FileData;
     _id: string;
     filepath: string;
     filesize: number;
     isFavourit?: boolean;
     isDeleted: boolean;
     folderId?: FolderData | string | null;
     createdAt: Date;
     updatedAt: Date;
   }
   
   export interface FileData {
     _id: string;
     filepath: string;
     filesize: number;
     isFavourit?: boolean;
     mimetype:string,
     originalname:string;
     isDeleted: boolean;
     folderId?: FolderData | string | null;
     createdAt: Date;
     updatedAt: Date;
   }
   
  export  interface FolderData {
     _id: string;
     foldername: string;
     userId: string;
     folderlock: boolean;
     isDeleted: boolean;
     createdAt: Date;
     updatedAt: Date;
   }
   
   export interface FileStats {
     count: number;
     size: number;
 }

export interface CreateFileModel extends Model<TCreateFile > {
  // eslint-disable-next-line no-unused-vars
  isFileExist(id: string): Promise<TCreateFile >;
}
