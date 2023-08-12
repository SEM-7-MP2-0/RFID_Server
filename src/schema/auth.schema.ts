import * as yup from 'yup';

const SignupSchema = yup.object({
  body: yup.object({
    email: yup.string().email().required('Email is required'),
    password: yup
      .string()
      .required('Password is required')
      .min(6, 'Password must be at least 6 characters')
      .max(20, 'Password must be at most 20 characters')
      .matches(/(?=.*[0-9])/, 'Password must contain a number'),
    name: yup.string().required('Name is required'),
    phone: yup.string().required('Phone is required'),
    isHod: yup.boolean().required('isHod is required'),
    isClassIncharge: yup.boolean().required('isClassIncharge is required'),
    department: yup.string().required('Department is required'),
  }),
});

const LoginSchema = yup.object({
  body: yup.object({
    email: yup.string().email().required('Email is required'),
    password: yup
      .string()
      .required('Password is required')
      .min(6, 'Password must be at least 6 characters')
      .max(20, 'Password must be at most 20 characters')
      .matches(/(?=.*[0-9])/, 'Password must contain a number'),
  }),
});

export { SignupSchema, LoginSchema };

export type SignupSchemaInput = yup.InferType<typeof SignupSchema>;
export type LoginSchemaInput = yup.InferType<typeof LoginSchema>;
