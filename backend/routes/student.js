const express = require('express');
const router  = express.Router({ mergeParams: true });
const query   = require('../Database/STUDENT/studentInfo');

// GET /api/student — student dashboard data
router.get('/', async (req, res) => {
  const stInfo = await query.getStudentInfo(req.user.STUDENT_ID);
  let dateOfBirth = '';
  if (req.user.DATE_OF_BIRTH) {
    try { dateOfBirth = new Date(req.user.DATE_OF_BIRTH).toISOString().split('T')[0]; } catch (_) {}
  }
  const studentInfo = {
    studentID:   req.user.STUDENT_ID,
    firstName:   req.user.FIRST_NAME,
    lastName:    req.user.LAST_NAME,
    phoneNo:     req.user.PHONE_NO,
    phoneNo2:    req.user.PHONE_NO2,
    email:       req.user.EMAIL,
    bankNo:      req.user.BANK_ACCOUNT,
    address:     req.user.ADDRESS,
    dateOfBirth,
    hall:        req.user.HALL,
    nid:         req.user.NID,
    deptID:      req.user.DEPT_ID,
  };
  res.json({ studentInfo, stInfo });
});

router.use('/update-info',        require('./Student/update-info'));
router.use('/courses',            require('./Student/courses'));
router.use('/enroll',             require('./Student/updateCourse'));
router.use('/results',            require('./Student/viewResult'));
router.use('/results/detail',     require('./Student/updateResult'));
router.use('/scholarship',        require('./Student/applyForScholarship'));
router.use('/dues',               require('./Student/dues'));
router.use('/advisor',            require('./Student/advisor'));
router.use('/notification',       require('./Student/notification'));

module.exports = router;
