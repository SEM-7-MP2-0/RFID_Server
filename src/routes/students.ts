import express, { Request, Response } from 'express';
import deserializeUser from '../middleware/deserializeUser';
import { isStudents } from '../middleware/roles';
import Students from '../models/students';
import log from '../log';
const router = express.Router();

/**
 * @swagger
 * /students/myprofile:
 *  get:
 *    description: get students myprofile
 *    parameters:
 *    - name: Authorization
 *      in: header
 *      description: Bearer token
 *      required: true
 *      type: string
 *    responses:
 *      200:
 *       description: profile retrieved successfully
 *      500:
 *        description: Error retrieving profile
 *      401:
 *        description: Unauthorized
 *      404:
 *        description: profile not found
 */

router.get(
  '/myprofile',
  deserializeUser,
  isStudents,
  async (req: Request & { user?: any }, res: Response): Promise<Response> => {
    log.info('GET /students/myprofile');
    try {
      const student = await Students.findById(req.user._id).select('-password');
      if (!student) {
        return res.status(404).json({
          message: 'Student not found',
        });
      }
      return res.status(200).json({
        message: 'Student profile',
        student,
      });
    } catch (err) {
      log.error(err);
      return res.status(500).json({
        message: 'Error getting student profile',
      });
    }
  }
);

/**
 * @swagger
 * /students/myattendance/{monthyear}:
 *  get:
 *    description: get students attendance for a month and year day wise with attended and absent subjects
 *    parameters:
 *    - name: Authorization
 *      in: header
 *      description: Bearer token
 *      required: true
 *      type: string
 *    - name: monthyear
 *      in: path
 *      description: month and year in format mm/yyyy
 *      required: true
 *      type: string
 *    responses:
 *      200:
 *        description: attendance retrieved successfully
 *      500:
 *        description: Error retrieving attendance
 *      401:
 *        description: Unauthorized
 *      404:
 *        description: attendance not found
 *      400:
 *        description: Invalid date
 */

router.get(
  '/myattendance/:monthyear',
  deserializeUser,
  isStudents,
  async (
    req: Request<{ monthyear: string }, any, any> & { user?: any },
    res: Response
  ) => {
    log.info('GET /students/myattendance');
    try {
      const student = await Students.findById(req.user._id)
        .select('-password')
        .lean();
      if (!student) {
        return res.status(404).json({
          message: 'Student not found',
        });
      }
      const monthYear = req.params.monthyear.split('/');
      if (monthYear.length !== 2) {
        return res.status(400).json({
          message: 'Invalid date',
        });
      }
      const month = parseInt(monthYear[0]!);
      const year = parseInt(monthYear[1]!);
      if (isNaN(month) || isNaN(year)) {
        return res.status(400).json({
          message: 'Invalid date',
        });
      }
      const attendance: Array<{
        subject: string;
        attended: boolean;
        semester: number;
        createdAt: Date;
        day?: number;
      }> = student.attendance.filter((attendances) => {
        const attendanceDate = new Date(attendances.createdAt);
        return (
          attendanceDate.getMonth() + 1 === month &&
          attendanceDate.getFullYear() === year
        );
      });
      if (!attendance || attendance.length === 0) {
        return res.status(404).json({
          message: 'Attendance not found',
        });
      }
      // converting mongoose to javascript plain object
      // attendance.map((attend) => attend.toObject());
      // convert created at to dd/mm/yyyy format and sort by date
      attendance.forEach((attend) => {
        const date = new Date(attend.createdAt);
        attend.day = date.getDate();
        attend.createdAt = new Date(
          `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
        );
      });
      // sort by day
      attendance.sort((a, b) => a.day! - b.day!);

      // group by day
      const groupedAttendanceByDay: {
        [key: string]: Array<{
          subject: string;
          attended: boolean;
          semester: number;
          createdAt: Date;
          day?: number;
          attendance?: {
            subject: string;
            attended: boolean;
            semester: number;
            createdAt: Date;
            day: number;
          };
        }>;
      } = attendance.reduce(
        (
          acc: {
            [key: string]: Array<{
              subject: string;
              attended: boolean;
              semester: number;
              createdAt: Date;
              day?: number;
            }>;
          },
          curr
        ) => {
          if (!acc[curr.day!]) {
            acc[curr.day!] = [];
          }
          acc[curr.day!]!.push(curr);
          return acc;
        },
        {}
      );
      const ans: {
        [key: string]: {
          attended: string[];
          absent: string[];
        };
      } = {};
      for (const at in groupedAttendanceByDay) {
        const attended: string[] = [];
        const absent: string[] = [];
        groupedAttendanceByDay[at]!.forEach((attend) => {
          if (attend.attended) {
            attended.push(attend.subject);
          } else {
            absent.push(attend.subject);
          }
        });
        ans[at] = {
          attended,
          absent,
        };

        if (groupedAttendanceByDay[at]!.length > 0) {
          delete groupedAttendanceByDay[at]?.[0]?.attendance;
        }
      }

      return res.status(200).json({
        message: 'Student attendance',
        Attendance: ans,
        month,
        year,
      });
    } catch (err) {
      log.error(err);
      return res.status(500).json({
        message: 'Error getting student attendance',
      });
    }
  }
);

export default router;
