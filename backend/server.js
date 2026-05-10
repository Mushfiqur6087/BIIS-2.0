require('dotenv').config();

const express     = require('express');
const cors        = require('cors');
const cookieParser= require('cookie-parser');
const bodyParser  = require('body-parser');
const path        = require('path');
const socketio    = require('socket.io');
const jwt         = require('jsonwebtoken');

const database    = require('./Database/database');
const query       = require('./Database/notificationUpdate');
const { logger }  = require('./middleware/logEvents');
const errorHandler= require('./middleware/errorHandler');
const verifyJWT   = require('./middleware/verifyJWT');

// needed for oracledb thread pool
process.env.UV_THREADPOOL_SIZE = 10;

const PORT = process.env.PORT || 3000;
const app  = express();

// ── Logging ──────────────────────────────────────────────────────────────────
app.use(logger);

// ── CORS — allow SvelteKit dev server and production frontend (nginx) ────────
const allowedOrigins = [
  'http://localhost',           // nginx reverse-proxy (docker compose up)
  'http://localhost:80',
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5173',      // Vite dev server
  'http://localhost:4173',      // SvelteKit preview
];
app.use(cors({
  origin: (origin, cb) => {
    // allow requests with no origin (curl, Postman, server-side) or matching list
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,   // allow cookies (JWT)
}));

// ── Body parsers ──────────────────────────────────────────────────────────────
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// ── Serve uploaded student/teacher photos ─────────────────────────────────────
// SvelteKit fetches them via /img/<filename>
app.use('/img', express.static(path.join(__dirname, 'public/img')));

// ── Public routes (no auth) ───────────────────────────────────────────────────
app.use('/api/auth', require('./routes/authorization'));

// ── Protected routes (JWT required) ──────────────────────────────────────────
app.use(verifyJWT);
app.use('/api/student', require('./routes/student'));
app.use('/api/admin',   require('./routes/admin'));
app.use('/api/teacher', require('./routes/teacher'));
app.use('/api/logout',  require('./routes/logout'));

// ── 404 fallback ──────────────────────────────────────────────────────────────
app.all('*', (_req, res) => res.status(404).json({ error: '404 Not Found' }));

// ── Global error handler ──────────────────────────────────────────────────────
app.use(errorHandler);

// ── Start server ──────────────────────────────────────────────────────────────
const server = app.listen(PORT, async () => {
  try {
    await database.startup();
    console.log(`HTTP Server listening on http://localhost:${PORT}`);
  } catch (err) {
    console.error('Error starting up database:', err);
    process.exit(1);
  }
});

// ── Socket.IO — real-time notifications ──────────────────────────────────────
const io = socketio(server, {
  cors: { origin: allowedOrigins, credentials: true },
});

let connectedClients  = new Set();
let connectedTeachers = new Set();
let connectedStudents = new Set();

io.on('connection', (socket) => {
  console.log('A user connected');
  try {
    const cookie  = socket.request.headers.cookie || '';
    const token   = cookie.replace('accesstoken=', '');
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const { role } = payload;
    if (role === 'admin')   connectedClients.add(socket);
    if (role === 'teacher') connectedTeachers.add(socket);
    if (role === 'student') connectedStudents.add(socket);
  } catch (e) {
    console.warn('Socket auth failed:', e.message);
  }

  socket.on('disconnect', () => {
    connectedClients.delete(socket);
    connectedStudents.delete(socket);
    connectedTeachers.delete(socket);
  });
});

// Poll and broadcast admin notifications every 5 s
setInterval(async () => {
  const result = await query.notificationUpdate();
  if (!result.length) return;
  const withDate = result.map(obj => ({ ...obj, DATE: new Date().toLocaleString() }));
  for (const socket of connectedClients) socket.emit('message', withDate);
}, 5000);

// Poll and broadcast student/teacher notifications every 5 s
setInterval(async () => {
  const result = await query.notificationUpdateStudentTeacher();
  if (!result.length) return;
  for (const notification of result) {
    const { NOTIFICATION_DETAILS, STUDENT_ID, TEACHER_ID } = notification;
    if (NOTIFICATION_DETAILS.includes('approved')) {
      for (const socket of connectedStudents) {
        try {
          const cookie  = socket.request.headers.cookie || '';
          const payload = jwt.verify(cookie.replace('accesstoken=',''), process.env.JWT_SECRET);
          if (payload.userID == STUDENT_ID) socket.emit('message', [notification]);
        } catch (_) {}
      }
    }
    if (NOTIFICATION_DETAILS.includes('applied')) {
      for (const socket of connectedTeachers) {
        try {
          const cookie  = socket.request.headers.cookie || '';
          const payload = jwt.verify(cookie.replace('accesstoken=',''), process.env.JWT_SECRET);
          if (payload.userID == TEACHER_ID) socket.emit('message', [notification]);
        } catch (_) {}
      }
    }
  }
}, 5000);

process.once('SIGTERM', database.shutdown).once('SIGINT', database.shutdown);