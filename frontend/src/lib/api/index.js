const BASE = '';  // Vite proxy handles /api → backend

async function apiFetch(url, opts = {}) {
  const isFormData = opts.body instanceof FormData;
  const res = await fetch(`${BASE}${url}`, {
    credentials: 'include',
    headers: isFormData ? {} : { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.message || data.error || 'Request failed'), { status: res.status, data });
  return data;
}

// ── Auth ──────────────────────────────────────────────────────
export const auth = {
  login:  (username, password) => apiFetch('/api/auth/login',  { method: 'POST', body: JSON.stringify({ username, password }) }),
  me:     ()                   => apiFetch('/api/auth/me'),
  logout: ()                   => apiFetch('/api/logout',       { method: 'POST' }),
};

// ── Admin ─────────────────────────────────────────────────────
export const admin = {
  dashboard:         ()         => apiFetch('/api/admin'),
  // Students
  students:          ()         => apiFetch('/api/admin/students'),
  student:           (id)       => apiFetch(`/api/admin/students/${id}`),
  updateStudent:     (id, body) => apiFetch(`/api/admin/students/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteStudent:     (id)       => apiFetch(`/api/admin/students/${id}`, { method: 'DELETE' }),
  addStudent:        (body)     => apiFetch('/api/admin/add-student',   { method: 'POST', body: JSON.stringify(body) }),
  // Teachers
  teachers:          ()         => apiFetch('/api/admin/teachers'),
  teacher:           (id)       => apiFetch(`/api/admin/teachers/${id}`),
  updateTeacher:     (id, body) => apiFetch(`/api/admin/teachers/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteTeacher:     (id)       => apiFetch(`/api/admin/teachers/${id}`, { method: 'DELETE' }),
  addTeacher:        (body)     => apiFetch('/api/admin/add-teacher',   { method: 'POST', body: JSON.stringify(body) }),
  // Courses
  addCourse:         (body)     => apiFetch('/api/admin/courses',       { method: 'POST', body: JSON.stringify(body) }),
  // Course-teacher assignment
  assignTeacher:     (body)     => apiFetch('/api/admin/assign-course-teacher', { method: 'POST', body: JSON.stringify(body) }),
  // Registration
  registration:      ()         => apiFetch('/api/admin/registration'),
  setRegistration:   (action)   => apiFetch('/api/admin/registration',  { method: 'POST', body: JSON.stringify({ action }) }),
  // Promote
  promoteData:       ()         => apiFetch('/api/admin/promote'),
  runPromotion:      ()         => apiFetch('/api/admin/promote',       { method: 'POST' }),
  // Dues
  dueTypes:          ()         => apiFetch('/api/admin/dues/new'),
  addDueType:        (body)     => apiFetch('/api/admin/dues/new',      { method: 'POST', body: JSON.stringify(body) }),
  assignDuesCSV:     (fd)       => apiFetch('/api/admin/dues/add',      { method: 'POST', body: fd }),
  clearDuesCSV:      (fd)       => apiFetch('/api/admin/dues/clear',    { method: 'POST', body: fd }),
  // Scholarships
  addScholarship:    (body)     => apiFetch('/api/admin/scholarships',  { method: 'POST', body: JSON.stringify(body) }),
};

// ── Student ───────────────────────────────────────────────────
export const student = {
  dashboard:        ()           => apiFetch('/api/student'),
  courses:          ()           => apiFetch('/api/student/courses'),
  enroll:           (items)      => apiFetch('/api/student/enroll',     { method: 'POST', body: JSON.stringify({ 'selectedItems[]': items }) }),
  results:          (level,term) => apiFetch(`/api/student/results/detail?level=${level}&term=${term}`),
  dues:             ()           => apiFetch('/api/student/dues'),
  advisor:          ()           => apiFetch('/api/student/advisor'),
  scholarship:      ()           => apiFetch('/api/student/scholarship'),
  applyScholarship: (option)     => apiFetch('/api/student/scholarship', { method: 'POST', body: JSON.stringify({ option }) }),
  // update-info: GET pre-populate, POST save (multipart — pass FormData)
  getUpdateInfo:    ()           => apiFetch('/api/student/update-info'),
  updateInfo:       (fd)         => apiFetch('/api/student/update-info', { method: 'POST', body: fd }),
};

// ── Teacher ───────────────────────────────────────────────────
export const teacher = {
  dashboard:           ()        => apiFetch('/api/teacher'),
  // update-info: GET for fresh data from DB, POST to save (multipart)
  getUpdateInfo:       ()        => apiFetch('/api/teacher/update-info'),
  updateInfo:          (fd)      => apiFetch('/api/teacher/update-info', { method: 'POST', body: fd }),
  grades:              ()        => apiFetch('/api/teacher/grades'),
  gradeStudents:       (courseId)=> apiFetch('/api/teacher/grades/students', { method: 'POST', body: JSON.stringify({ courseId }) }),
  submitGrades:        (body)    => apiFetch('/api/teacher/grades/submit',    { method: 'POST', body: JSON.stringify(body) }),
  approvableCourses:   ()        => apiFetch('/api/teacher/approve-courses'),
  approveCourses:      (items)   => apiFetch('/api/teacher/approve-courses',  { method: 'POST', body: JSON.stringify({ 'selectedItems[]': items }) }),
  scholarships:        ()        => apiFetch('/api/teacher/approve-scholarship'),
  approveScholarship:  (items)   => apiFetch('/api/teacher/approve-scholarship', { method: 'POST', body: JSON.stringify({ 'selectedItems[]': items }) }),
};
