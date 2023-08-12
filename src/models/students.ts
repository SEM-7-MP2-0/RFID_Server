import mongoose, { Model, Schema } from 'mongoose';
import { comparePassword } from '../utils/bcrypt.utils';
import { createAccessToken } from '../utils/jwt.utils';
import { IStudent } from '../@types/model';
import { StudentToken } from 'src/@types/utils';

const StudentsSchema: Schema<IStudent> = new Schema(
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
    prn: {
      type: String,
      required: true,
      unique: true,
    },
    dateofjoining: {
      type: String,
      required: true,
    },
    dateofleaving: {
      type: String,
    },
    department: {
      type: String,
      required: true,
    },
    attendance: [
      {
        subject: String,
        attended: Boolean,
        semester: Number,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

StudentsSchema.methods.generateAuthToken = function (): {
  token: string;
  role: string;
} {
  const student: StudentToken = {
    _id: this._id,
    name: this.name,
    email: this.email,
    prn: this.prn,
  };
  const token = createAccessToken(student);
  return { token, role: 'student' };
};

StudentsSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  const user = this as IStudent;
  const isMatch = await comparePassword(password, user.password);
  return isMatch;
};

const Students: Model<IStudent> = mongoose.model('Students', StudentsSchema);
export default Students;
