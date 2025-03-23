import { z } from 'zod';

const createFolderSchema = z.object({
  body: z.object({
    foldername: z
      .string({ required_error: 'folder name is required' })
      .min(1, { message: 'min 1 character aceepted ' })
      .max(20, { message: 'max 20 character aceepted' }),
  }),
  password: z
    .string({ required_error: 'password is not required' })
    .min(4, { message: 'min 4 character password accepted' })
    .optional(),
});

const updateFolderSchema = z.object({
  body: z
    .object({
      foldername: z
        .string({ required_error: 'folder name is required' })
        .min(1, { message: 'min 1 character aceepted ' })
        .max(20, { message: 'max 20 character aceepted' })
        .optional(),
    })
    .optional(),
});

const findSecureFolderSchema = z.object({
  body: z.object({
    password: z
      .string({ required_error: 'password is not required' })
      .min(4, { message: 'min 4 character password accepted' })
      
  }),
});

const CreateFolderValidationSchema = {
  createFolderSchema,
  updateFolderSchema,
  findSecureFolderSchema 
};

export default CreateFolderValidationSchema;
