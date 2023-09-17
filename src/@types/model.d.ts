import { Document } from 'mongoose';

export interface IFaculty extends Document {
  name: string;
  email: string;
  password: string;
  isHod: boolean;
  isClassIncharge: boolean;
  isValid: boolean;
  department: string;
  phone: string;
  comparePassword(password: string): Promise<boolean>;
  generateAuthToken(): { token: string; role: string };
  batch: [
    {
      batchname: string;
      students: Array<{
        student_id: string;
      }>;
    }
  ];
}

export interface IStudent extends Document {
  name: string;
  email: string;
  password: string;
  prn: string;
  dateofjoining: string;
  dateofleaving: string;
  department: string;
  attendance: [
    {
      subject: string;
      attended: boolean;
      semester: number;
      createdAt: Date;
    }
  ];
  generateAuthToken(): { token: string; role: string };
  comparePassword(password: string): Promise<boolean>;
}
