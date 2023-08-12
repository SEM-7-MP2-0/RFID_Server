import { NextFunction, Request, Response } from 'express';
import Faculty from '../models/faculty';
import Students from '../models/students';

const isHod = (
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
): Response | void => {
  if (req.user.isHod === true) {
    next();
  } else {
    return res.status(401).json({
      message: 'Unauthorized',
    });
  }
};

const isFaculty = async (
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const isFaculty = await Faculty.findById(req.user._id);
  if (isFaculty) {
    next();
  } else {
    return res.status(401).json({
      message: 'Unauthorized',
    });
  }
};
const isClassTeacher = (
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
): Response | void => {
  if (req.user.isClassIncharge === true) {
    next();
  } else {
    return res.status(401).json({
      message: 'Unauthorized',
    });
  }
};
const isStudents = async (
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const isStudents = await Students.findById(req.user._id);
  if (isStudents) {
    next();
  } else {
    return res.status(401).json({
      message: 'Unauthorized',
    });
  }
};

export { isHod, isFaculty, isClassTeacher, isStudents };
