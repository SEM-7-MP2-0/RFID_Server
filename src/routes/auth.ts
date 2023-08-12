import express, { Request, Response } from 'express';
import log from '../log';
import Faculty from '../models/faculty';
import validate from '../middleware/validateRequest';
import { SignupSchema, LoginSchema } from '../schema/auth.schema';
import Students from '../models/students';
import deserializeUser from '../middleware/deserializeUser';
const router = express.Router();

/**
 * @swagger
 * /auth/faculty/signup:
 *  post:
 *    description: Use to request a new faculty
 *    parameters:
 *    - name: name
 *      description: Faculty name
 *      in: formData
 *      required: true
 *      type: string
 *    - name: email
 *      description: Faculty email
 *      in: formData
 *      required: true
 *      type: string
 *    - name: password
 *      description: Faculty password
 *      in: formData
 *      required: true
 *      type: string
 *    - name: department
 *      description: Faculty department
 *      in: formData
 *      required: true
 *      type: string
 *    - name: isHod
 *      description: Faculty isHod
 *      in: formData
 *      required: true
 *      type: boolean
 *    - name: isClassIncharge
 *      description: Faculty isClassIncharge
 *      in: formData
 *      required: true
 *      type: boolean
 *    - name: phone
 *      description: Faculty phone
 *      in: formData
 *      required: true
 *      type: string
 *    responses:
 *      200:
 *        description: Faculty successfully signed up
 *      400:
 *        description: Faculty already exists
 *      500:
 *        description: Internal server error
 */
router.post(
  '/faculty/signup',
  validate(SignupSchema),
  async (req: Request, res: Response): Promise<Response> => {
    try {
      log.info('POST /auth/faculty/signup');
      const faculty = new Faculty(req.body);
      await faculty.save();
      return res
        .status(200)
        .send({ message: 'Faculty successfully signed up' });
    } catch (e: any) {
      log.error(e);
      if (e.code === 11000) {
        return res.status(400).send({ message: 'Faculty already exists' });
      }
      return res.status(500).send({ message: 'Internal server error' });
    }
  }
);

/**
 * @swagger
 * /auth/login:
 *  post:
 *    description: Use to login student or faculty
 *    parameters:
 *    - name: email
 *      description: Student or faculty email
 *      in: formData
 *      required: true
 *      type: string
 *    - name: password
 *      description: Student or faculty password
 *      in: formData
 *      required: true
 *      type: string
 *    responses:
 *      200:
 *        description: Student or faculty successfully logged in
 *      400:
 *        description: Invalid credentials
 *      500:
 *        description: Internal server error
 */

router.post(
  '/login',
  validate(LoginSchema),
  async (req: Request, res: Response): Promise<Response> => {
    try {
      log.info('POST /auth/login');

      const { email, password } = req.body;
      const checkIfExsist = await Faculty.findOne({
        $and: [{ email: email }, { isValid: true }],
      });
      if (checkIfExsist) {
        const isMatch = await checkIfExsist.comparePassword(password);
        if (isMatch) {
          const token = await checkIfExsist.generateAuthToken();
          return res.status(200).json({
            message: 'Login Successful',
            status: true,
            token: token,
          });
        } else {
          return res.status(401).json({
            message: 'Password not match',
            status: false,
          });
        }
      } else {
        const isStudentsExsist = await Students.findOne({
          $and: [{ email: email }],
        });
        if (isStudentsExsist) {
          const isMatch = await isStudentsExsist.comparePassword(password);
          if (isMatch) {
            const token = await isStudentsExsist.generateAuthToken();
            return res.status(200).json({
              message: 'Login Successful',
              status: true,
              token: token,
            });
          }
          return res.status(401).json({
            message: 'Password not match',
            status: false,
          });
        } else {
          return res.status(401).json({
            message: 'Email not registered',
            status: false,
          });
        }
      }
    } catch (err) {
      console.log('-->> User Error ', err);
      return res.status(500).json({
        message: 'Error retrieving User',
      });
    }
  }
);

/**
 * @swagger
 * /auth/valid:
 *  get:
 *    description: Use to check if the token is valid
 *    parameters:
 *    - name: authorization
 *      description: authorization token
 *      required: true
 *      in: header
 *      type: string
 *    responses:
 *      200:
 *        description: Token is valid
 *      401:
 *        description: Token is invalid
 *      500:
 *        description: Internal server error
 */
router.get(
  '/valid',
  deserializeUser,
  async (req: Request, res: Response): Promise<Response> => {
    try {
      log.info('GET /auth/valid');
      return res.status(200).send({ message: 'Token is valid' });
    } catch (e) {
      log.error(e);
      return res.status(500).send({ message: 'Internal server error' });
    }
  }
);

export default router;
