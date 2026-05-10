const express = require('express');
const router  = express.Router({ mergeParams: true });
const query   = require('../Database/adminFirstPage');

// GET /api/admin — dashboard stats
router.get('/', async (req, res) => {
  const data  = await query.totalStudentDepartMent();
  const data2 = await query.totalStudentCourse();
  res.json({ departments: data, courses: data2 });
});

router.use('/add-student',             require('./Admin/add-student'));
router.use('/add-teacher',             require('./Admin/add-teacher'));
router.use('/students',                require('./Admin/studentList'));
router.use('/teachers',                require('./Admin/teacherList'));
router.use('/update-student',          require('./Admin/updateStudent'));
router.use('/update-teacher',          require('./Admin/updateTeacher'));
router.use('/notification',            require('./Admin/notification'));
router.use('/assign-course-teacher',   require('./Admin/assign-course-teacher'));
router.use('/registration',            require('./Admin/registration-promoteStudents'));
router.use('/promote',                 require('./Admin/promote-students'));
router.use('/courses',                 require('./Admin/add-course'));
router.use('/scholarships',            require('./Admin/add-scholarship'));
router.use('/dues/add',                require('./Admin/addDues'));
router.use('/dues/clear',              require('./Admin/clearDues'));
router.use('/dues/new',                require('./Admin/newDues'));

module.exports = router;