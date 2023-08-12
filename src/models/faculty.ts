import mongoose, { Model, Schema } from 'mongoose';
import { encryptPassword, comparePassword } from '../utils/bcrypt.utils';
import { createAccessToken } from '../utils/jwt.utils';
import { IFaculty } from '../@types/model';

const FacultySchema: Schema<IFaculty> = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isHod: {
      type: Boolean,
      default: false,
    },
    isClassIncharge: {
      type: Boolean,
      default: false,
    },
    isValid: {
      type: Boolean,
      default: true,
    },
    department: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

FacultySchema.pre('save', async function (next) {
  const mentor = this as IFaculty;
  if (!mentor.isModified('password')) return next();
  const hash = await encryptPassword(mentor.password);
  mentor.password = hash;
  return next();
});

FacultySchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  const user = this as IFaculty;
  const isMatch = await comparePassword(password, user.password);
  return isMatch;
};

FacultySchema.methods.generateAuthToken = function (): {
  token: string;
  role: string;
} {
  const faculty = this as IFaculty;
  const token = createAccessToken(faculty);
  return {
    token,
    role: faculty.isHod
      ? 'hod'
      : faculty.isClassIncharge
      ? 'classIncharge'
      : 'faculty',
  };
};

const Faculty: Model<IFaculty> = mongoose.model<IFaculty>(
  'faculty',
  FacultySchema
);

export default Faculty;
