import {z} from 'zod';


const fileUplodingSchema=z.object({
     body:z.object({
          folderId:z.string({required_error:"folder id is required"}).optional(),
          password: z
          .string({ required_error: 'password is not required' })
          .min(4, { message: 'min 4 character password accepted' })
          .optional()
     })

});

const fileAndFolderFavouritSchema=z.object({
     body:z.object({
          isFavourit:z.boolean({required_error:"is favourit is required"})
     })
});

const copyFileSchema=z.object({
     body:z.object({
          folderId:z.string({required_error:"folderId is Required"})
     })
});

const renameFileSchema=z.object({
     body:z.object({
          originalname:z.string({required_error:"original name required"})
     })
})
 
const FileValidationSchema={
     fileUplodingSchema,
     fileAndFolderFavouritSchema,
     copyFileSchema,
     renameFileSchema
};



export default FileValidationSchema;