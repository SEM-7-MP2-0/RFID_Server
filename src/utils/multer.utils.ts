import multer from 'multer';
import { Request } from 'express';

const storage = multer.diskStorage({
  destination(req: Request, file: Express.Multer.File, cb) {
    cb(null, './uploads');
  },
  filename(req: Request, file: Express.Multer.File, cb) {
    cb(null, file.originalname);
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (
    file.mimetype ===
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/jpg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 1024,
  },
  fileFilter: fileFilter,
});

export default upload;
