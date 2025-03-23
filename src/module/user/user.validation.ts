import { z } from 'zod';

import { USER_ROLE, USER_STATUS } from '../../utility/userrole.constant';

const UserAuthSchema = z.object({
  body: z.object({
    username: z
      .string({ required_error: 'user name is required' })
      .min(3, { message: 'min 3 character accepted' })
      .max(15, { message: 'max 15 character accepted' }),
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters long').optional(),
    role: z.enum([USER_ROLE.ADMIN, USER_ROLE.USER]).default(USER_ROLE.USER),
    photo:z.string({required_error:"optional photot"}).url().optional(),
    status: z
      .enum([USER_STATUS.blocked, USER_STATUS.isProgress])
      .default(USER_STATUS.isProgress),
    isVerify: z.boolean().default(false),
  }),
});

const UserVerification = z.object({
  body: z.object({
    verificationCode: z
      .number({ required_error: 'varification code is required' })
      .min(6, { message: 'min 6 character accepted' }),
  }),
});

const ChnagePasswordSchema = z.object({
  body: z.object({
    newpassword: z
      .string({ required_error: 'new password is required' })
      .min(6, { message: 'min 6 character accepted' }),
    oldpassword: z
      .string({ required_error: 'old password is  required' })
      .min(6, { message: 'min 6 character accepted' }),
  }),
});


const UpdateUserProfileSchema=z.object({
     body:z.object({
          username: z
          .string({ required_error: 'user name is required' })
          .min(3, { message: 'min 3 character accepted' })
          .max(15, { message: 'max 15 character accepted' }).optional(),
          photo:z.string({required_error:"optional photot"}).url().optional(),
     }),

})

const UserValidationSchema = {
  UserAuthSchema,
  UserVerification,
  ChnagePasswordSchema,
  UpdateUserProfileSchema
};
export default UserValidationSchema;
