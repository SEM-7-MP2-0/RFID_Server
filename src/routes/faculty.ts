import express, { Request, Response } from 'express';
import log from '../log';
import Faculty from '../models/faculty';
import deserializeUser from '../middleware/deserializeUser';
import { isFaculty } from '../middleware/roles';
import Students from '../models/students';
import upload from '../utils/multer.utils';
import excel from 'exceljs';
import axios from 'axios';
import { encryptPassword } from '../utils/bcrypt.utils';
import { getEnv } from '../utils/dotenv.utils';
import { IStudent } from '../@types/model';
import { uploadFileToDestination } from '../utils/firebase.utils';

const router = express.Router();

/**
 * @swagger
 * /faculty/insertrolllist:
 *  post:
 *    description: Insert roll list of a class wich contains roll number name and email and date of joining
 *    parameters:
 *    - name: authorization
 *      description: authorization token
 *      required: true
 *      in: header
 *      type: string
 *    - name: Rollfile
 *      description: file containing roll list of a class
 *      required: true
 *      in: formData
 *      type: file
 *    - name: joinyear
 *      description: year of joining
 *      required: true
 *      in: formData
 *      type: string
 *    - name: department
 *      description: department of the class
 *      required: true
 *      in: formData
 *      type: string
 *    responses:
 *      200:
 *        description: Roll list inserted successfully
 *      400:
 *        description: Error inserting roll list
 *      500:
 *        description: Error inserting roll list
 */

router.post(
  '/insertrolllist',
  upload.single('Rollfile'),
  deserializeUser,
  isFaculty,
  async (req: Request & { user?: any }, res: Response): Promise<Response> => {
    log.info('POST /classincharge/insertrolllist');
    try {
      const faculty = await Faculty.findById(req.user._id);
      if (!faculty) {
        return res.status(400).json({
          message: 'Faculty not found',
        });
      }
      const { joinyear, department } = req.body;
      const file = req.file!;
      // // insert excel data to db
      const workbook = new excel.Workbook();
      const worksheet = await workbook.xlsx.readFile(
        'uploads/' + file.originalname
      );
      const sheet = worksheet.getWorksheet(1);
      const rollList: Array<{
        name: string;
        prn: string;
        email: string;
        dateofjoining: number;
        dateofleaving: number;
        department: string;
        password: string;
      }> = [];
      for (let i = 3; i <= sheet.rowCount; i++) {
        const row = sheet.getRow(i);
        if (
          !row.getCell(3).value ||
          !row.getCell(2).value ||
          !row.getCell(5).value
        ) {
          console.log('Invalid row', row.getCell(3).value || '');
          continue;
        }
        const student: {
          name: string;
          prn: string;
          email: string;
          dateofjoining: number;
          dateofleaving: number;
          department: string;
          password: string;
        } = {
          name: row.getCell(3).value?.toString() || '',
          prn: row.getCell(2).value?.toString() || '',
          // @ts-ignore
          email: row.getCell(5).value?.['text'] || row.getCell(5).value || '',
          dateofjoining: parseInt(joinyear),
          dateofleaving: parseInt(joinyear) + 4,
          department: department,
          password: await encryptPassword('Pass@123'),
        };
        rollList.push(student);
      }
      await Students.insertMany(rollList);
      return res.status(200).json({
        message: 'Roll list uploaded successfully',
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: 'Error inserting roll list',
      });
    }
  }
);

/**
 * @swagger
 * /faculty/myprofile:
 *  get:
 *    description: Get faculty profile
 *    parameters:
 *    - name: authorization
 *      description: authorization token
 *      required: true
 *      in: header
 *      type: string
 *    responses:
 *      200:
 *        description: Faculty profile
 *      400:
 *        description: Error getting faculty profile
 *      500:
 *        description: Error getting faculty profile
 *
 */

router.get(
  '/myprofile',
  deserializeUser,
  isFaculty,
  async (req: Request & { user?: any }, res: Response): Promise<Response> => {
    log.info('GET /faculty/myprofile');
    try {
      const faculty = await Faculty.findById(req.user._id).select('-password');
      if (!faculty) {
        return res.status(400).json({
          message: 'Faculty not found',
        });
      }
      return res.status(200).json({
        message: 'Faculty profile',
        faculty,
      });
    } catch (err) {
      log.error(err);
      return res.status(500).json({
        message: 'Error getting faculty profile',
      });
    }
  }
);

/**
 * @swagger
 * /faculty/profile/student/{id}:
 *  get:
 *    description: Get student profile
 *    parameters:
 *    - name: authorization
 *      description: authorization token
 *      required: true
 *      in: header
 *      type: string
 *    - name: id
 *      description: student id
 *      required: true
 *      in: path
 *      type: string
 *    responses:
 *      200:
 *        description: Student profile
 *      400:
 *        description: Error getting student profile
 *      500:
 *        description: Error getting student profile
 *      404:
 *        description: Student not found
 *      401:
 *        description: Unauthorized
 *      403:
 *        description: Forbidden
 */

router.get(
  '/profile/student/:id',
  deserializeUser,
  isFaculty,
  async (
    req: Request<{ id: string }, any, any>,
    res: Response
  ): Promise<Response> => {
    log.info('GET /faculty/profile/student/:id');
    try {
      const student = await Students.findById(req.params.id).select(
        '-password'
      );
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
 * /faculty/takeattendance:
 *  post:
 *    description: take attendance of a class
 *    parameters:
 *    - name: authorization
 *      description: authorization token
 *      required: true
 *      in: header
 *      type: string
 *    - name: dateofleaving
 *      description: date of leaving
 *      required: true
 *      in: formData
 *      type: string
 *    - name: department
 *      description: department
 *      required: true
 *      in: formData
 *      type: string
 *    - name: dateofattendancetake
 *      description: date of attendance take
 *      required: true
 *      in: formData
 *      type: string
 *    responses:
 *      200:
 *        description: Attendance taked successfully
 *      400:
 *        description: Error taking attendance
 *      500:
 *        description: Error taking attendance
 *      404:
 *        description: Student not found
 *      401:
 *        description: Unauthorized
 *      403:
 *        description: Forbidden
 */

router.post(
  '/takeattendance',
  deserializeUser,
  isFaculty,
  async (req: Request & { user?: any }, res: Response): Promise<Response> => {
    log.info('POST /faculty/takeattendance');
    try {
      const faculty = await Faculty.findById(req.user._id);
      if (!faculty) {
        return res.status(400).json({
          message: 'Faculty not found',
        });
      }
      const { dateofleaving, department, dateofattendancetake } = req.body;
      let PRESENT_STUDENT_PRNS = [
        '120A3043',
        '120A3038',
        '120A3027',
        '120A3046',
      ];
      console.log('Taking RFID');
      try {
        const request = await axios.get(
          getEnv('process.env.RFID_SERVER_NGROK')!
        );
        PRESENT_STUDENT_PRNS = request.data.data;
      } catch (err) {
        log.error('NOT REq');
        log.error(err);
      }
      const students = await Students.find({
        dateofleaving: dateofleaving,
        department: department,
      }).sort({ prn: 1 });
      if (students.length === 0) {
        return res.status(404).json({
          message: 'Students not found',
        });
      }
      const attendance: Array<{
        student: string;
        date: Date;
        isPresent: boolean;
        prn: string;
        name: string;
      }> = [];

      for (let i = 0; i < students.length; i++) {
        const student = students[i] as IStudent;
        const isPresent = PRESENT_STUDENT_PRNS.includes(student.prn);
        const attendanceObj: {
          student: string;
          date: Date;
          isPresent: boolean;
          prn: string;
          name: string;
        } = {
          student: student._id,
          date: dateofattendancetake || new Date(),
          isPresent: isPresent,
          prn: student.prn,
          name: student.name,
        };
        attendance.push(attendanceObj);
      }
      // console.log(attendance);
      return res.status(200).json({
        message: 'Attendance taked successfully',
        attendance,
      });
    } catch (err) {
      log.error(err);
      return res.status(500).json({
        message: 'Error taking attendance',
      });
    }
  }
);

/**
 * @swagger
 * /faculty/saveattendance:
 *  post:
 *    description: Save attendance of a class
 *    parameters:
 *    - name: authorization
 *      description: authorization token
 *      required: true
 *      in: header
 *      type: string
 *    - name: attendance
 *      description: attendance
 *      required: true
 *      in: formData
 *      type: string
 *    - name: subject
 *      description: subject
 *      required: true
 *      in: formData
 *      type: string
 *    - name: semester
 *      description: semester
 *      required: true
 *      in: formData
 *      type: string
 *    responses:
 *      200:
 *        description: Attendance saved successfully
 *      400:
 *        description: Error saving attendance
 *      500:
 *        description: Error saving attendance
 *      404:
 *        description: Student not found
 *      401:
 *        description: Unauthorized
 *      403:
 *        description: Forbidden
 */

router.post(
  '/saveattendance',
  deserializeUser,
  isFaculty,
  async (req: Request & { user?: any }, res: Response): Promise<Response> => {
    log.info('POST /faculty/saveattendance');
    try {
      const faculty = await Faculty.findById(req.user._id);
      if (!faculty) {
        return res.status(400).json({
          message: 'Faculty not found',
        });
      }
      const { attendance, subject, semester } = req.body;
      const attendanceObj = JSON.parse(attendance);
      const attendanceArr: Array<{
        student: string;
        attended: boolean;
        subject: string;
        semester: number;
        prn: string;
        createdAt: Date;
      }> = [];
      for (let i = 0; i < attendanceObj.length; i++) {
        const attendance = attendanceObj[i];
        const newattendanceObj: {
          student: string;
          attended: boolean;
          subject: string;
          semester: number;
          prn: string;
          createdAt: Date;
        } = {
          student: attendance.student,
          attended: attendance.isPresent,
          subject: subject,
          semester: semester,
          prn: attendance.prn,
          createdAt: attendance.date,
        };
        attendanceArr.push(newattendanceObj);
      }
      console.log(attendanceArr);
      // push into student attendance
      for (const stud of attendanceArr) {
        const student = await Students.findById(stud.student);
        if (!student) {
          return res.status(404).json({
            message: 'Student not found',
          });
        }
        student.attendance.push(stud);
        await student.save();
      }

      return res.status(200).json({
        message: 'Attendance saved successfully',
      });
    } catch (err) {
      log.error(err);
      return res.status(500).json({
        message: 'Error saving attendance',
      });
    }
  }
);

/**
 * @swagger
 * /faculty/getattendancesubjectname:
 *  post:
 *    description: Get attendance subject name of a class
 *    parameters:
 *    - name: authorization
 *      description: authorization token
 *      required: true
 *      in: header
 *      type: string
 *    - name: department
 *      description: department
 *      required: true
 *      in: formData
 *      type: string
 *    - name: dateofleaving
 *      description: date of leaving
 *      required: true
 *      in: formData
 *      type: string
 *    - name: datefrom
 *      description: date from
 *      required: true
 *      type: string
 *      in: formData
 *    - name: dateto
 *      description: date to
 *      required: true
 *      in: formData
 *      type: string
 *
 *    responses:
 *      200:
 *        description: Report generated successfully
 *      400:
 *        description: Error generating report
 *      500:
 *        description: Error generating report
 *      404:
 *        description: Student not found
 *      401:
 *        description: Unauthorized
 *      403:
 *        description: Forbidden
 */

router.post(
  '/getattendancesubjectname',
  deserializeUser,
  isFaculty,
  async (req: Request & { user?: any }, res: Response): Promise<Response> => {
    log.info('POST /faculty/getattendancesubjectname');
    try {
      const faculty = await Faculty.findById(req.user._id);
      if (!faculty) {
        return res.status(400).json({
          message: 'Faculty not found',
        });
      }
      const { department, dateofleaving, datefrom, dateto } = req.body;
      const students = await Students.aggregate([
        {
          $match: {
            department: department,
            dateofleaving: dateofleaving,
          },
        },
        {
          $unwind: '$attendance',
        },
        {
          $match: {
            'attendance.createdAt': {
              $gte: new Date(datefrom),
              $lte: new Date(dateto),
            },
          },
        },
        {
          $group: {
            _id: '$attendance.subject',
          },
        },
      ]);
      if (students.length === 0) {
        return res.status(404).json({
          message: 'Students not found',
        });
      }
      const subjectName = [] as Array<string>;
      for (const stud of students) {
        subjectName.push(stud._id);
      }
      return res.status(200).json({
        message: 'Subject get successfully',
        data: subjectName,
      });
    } catch (err) {
      log.error(err);
      return res.status(500).json({
        message: 'Error generating report',
      });
    }
  }
);

/**
 * @swagger
 * /faculty/genereatedefaultersreport:
 *  post:
 *    description: Will send the file of the student attendance report and defaulters will be highlighted
 *    parameters:
 *    - name: authorization
 *      description: authorization token
 *      required: true
 *      in: header
 *      type: string
 *    - name: department
 *      description: department
 *      required: true
 *      in: formData
 *      type: string
 *    - name: dateofleaving
 *      description: date of leaving
 *      required: true
 *      in: formData
 *      type: string
 *    - name: datefrom
 *      description: date from
 *      required: true
 *      type: string
 *      in: formData
 *    - name: dateto
 *      description: date to
 *      required: true
 *      in: formData
 *      type: string
 *    - name: subjectandtotallectures
 *      description: subject and total lectures
 *      required: true
 *      in: formData
 *      type: string
 *    responses:
 *      200:
 *        description: Report generated successfully
 *      400:
 *        description: Error generating report
 *      500:
 *        description: Error generating report
 *      404:
 *        description: Student not found
 *      401:
 *        description: Unauthorized
 *      403:
 *        description: Forbidden
 */

router.post(
  '/genereatedefaultersreport',
  deserializeUser,
  isFaculty,
  async (req: Request & { user?: any }, res: Response): Promise<Response> => {
    log.info('POST /faculty/genereatedefaultersreport');
    try {
      const faculty = await Faculty.findById(req.user._id);
      if (!faculty) {
        return res.status(400).json({
          message: 'Faculty not found',
        });
      }
      type subjectandtotallectures = {
        subject: string;
        totallectures: number;
      };
      const {
        department,
        dateofleaving,
        datefrom,
        dateto,
        subjectandtotallectures,
      } = req.body;

      const subjectandtotallecturesJson = JSON.parse(
        subjectandtotallectures
      ) as Array<subjectandtotallectures>;
      const allSubjects = subjectandtotallecturesJson.map(
        (subject) => subject.subject
      );
      const students = await Students.aggregate([
        {
          $match: {
            department: department,
            dateofleaving: dateofleaving,
          },
        },
        {
          $unwind: '$attendance',
        },
        {
          $match: {
            'attendance.createdAt': {
              $gte: new Date(datefrom),
              $lte: new Date(dateto),
            },
          },
        },
        {
          $match: {
            'attendance.subject': {
              $in: allSubjects,
            },
          },
        },
        {
          $group: {
            _id: {
              student: '$prn',
              email: '$email',
              subject: '$attendance.subject',
            },
            attendedLectures: {
              $sum: {
                $cond: ['$attendance.attended', 1, 0],
              },
            },
            name: {
              $first: '$name',
            },
          },
        },
        {
          $project: {
            _id: 0,
            student: '$_id.student',
            email: '$_id.email',
            name: '$name',
            prn: '$_id.student',
            attendedLectures: '$attendedLectures',
            subject: '$_id.subject',
          },
        },
      ]);

      if (students.length === 0) {
        return res.status(404).json({
          message: 'Students not found',
        });
      }

      const workbook = new excel.Workbook();
      const worksheet = workbook.addWorksheet('My Sheet');
      const studentSubjectWiseAttendance: {
        [prn: string]: {
          info: Array<{
            subject: string;
            attendedLectures: number;
            totalLectures: number;
            percentage: number;
          }>;
          name: string;
          email: string;
        };
      } = {};
      for (const stud of students) {
        for (const subject of subjectandtotallecturesJson) {
          if (stud.subject === subject.subject) {
            if (studentSubjectWiseAttendance[stud.prn] === undefined) {
              studentSubjectWiseAttendance[stud.prn] = {
                info: [
                  {
                    subject: stud.subject,
                    attendedLectures: stud.attendedLectures,
                    totalLectures: subject.totallectures,
                    percentage:
                      (stud.attendedLectures / subject.totallectures) * 100,
                  },
                ],
                name: stud.name,
                email: stud.email,
              };
            } else {
              studentSubjectWiseAttendance[stud.prn]!.info.push({
                subject: stud.subject,
                attendedLectures: stud.attendedLectures,
                totalLectures: subject.totallectures,
                percentage:
                  (stud.attendedLectures / subject.totallectures) * 100,
              });
            }
          }
        }
      }
      // sort the studentSubjectWiseAttendance by prn
      const studentSubjectWiseAttendanceSorted = Object.keys(
        studentSubjectWiseAttendance
      ).sort((a, b) => {
        return a.localeCompare(b);
      });

      // // addinng the data to the excel sheet
      worksheet.addRow([
        'Name',
        'PRN',
        'Email',
        ...subjectandtotallecturesJson
          .map((subject) => {
            return [subject.subject, ''];
          })
          .flat(),
      ]);

      // merge subject cells
      for (let i = 0; i < subjectandtotallecturesJson.length; i++) {
        worksheet.mergeCells(1, i * 2 + 4, 1, i * 2 + 5);
      }

      worksheet.addRow([
        '',
        '',
        '',
        ...subjectandtotallecturesJson
          .map((subject) => {
            return [subject.totallectures, 100];
          })
          .flat(),
      ]);

      // add student data
      for (const stud of studentSubjectWiseAttendanceSorted) {
        const student = studentSubjectWiseAttendance[stud]!;
        const studentData = [
          student.name,
          stud,
          student.email,
          ...subjectandtotallecturesJson
            .map((subject) => {
              const subjectData = student.info.find(
                (info) => info.subject === subject.subject
              );
              if (subjectData) {
                return [subjectData.attendedLectures, subjectData.percentage];
              } else {
                return [0, 0];
              }
            })
            .flat(),
        ];
        worksheet.addRow(studentData);
      }
      // highlight defaulters
      for (let i = 3; i <= worksheet.rowCount; i++) {
        const row = worksheet.getRow(i);
        for (let j = 4; j <= row.cellCount; j += 2) {
          const percentage = (row.getCell(j + 1).value as number) || 0;
          if (percentage < 50) {
            row.getCell(j + 1).fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFF0000' },
            };
          } else if (percentage < 75) {
            row.getCell(j + 1).fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFFA500' },
            };
          }
        }
      }

      const fileName = 'uploads/' + faculty.name + '.xlsx';
      await workbook.xlsx.writeFile(fileName);
      const filePath = await uploadFileToDestination(
        fileName,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        `attendanceReport/${dateofleaving}-${department}-${datefrom}-${dateto}.xlsx`
      );
      return res.status(200).json({
        message: 'Report generated successfully',
        filePath: filePath,
      });
    } catch (err) {
      log.error(err);
      return res.status(500).json({
        message: 'Error generating report',
      });
    }
  }
);

export default router;
