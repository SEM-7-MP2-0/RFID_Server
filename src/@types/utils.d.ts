import { IFaculty, IStudent } from './model';

export type AccessTokenUser = IFaculty | IStudent | StudentToken;

export interface StudentToken {
  _id: string;
  name: string;
  email: string;
  prn: string;
}
