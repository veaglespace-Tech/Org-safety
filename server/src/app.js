const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://195.35.21.96',
      'http://195.35.21.96:3000',
      'http://195.35.21.96:3001',
      'https://195.35.21.96',
      'https://tichisuraksha.veaglespace.com'
    ];
    // Allow any subdomain, local dev IPs, and generic mobile app origins (null, exp://)
    if (
      !origin ||
      allowedOrigins.indexOf(origin) !== -1 ||
      origin.endsWith('.veaglespace.com') ||
      origin.startsWith('exp://') ||
      origin.startsWith('http://192.168.') ||
      origin.startsWith('http://10.') ||
      origin.startsWith('http://172.') ||
      origin === 'null'
    ) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: 52428800 }));
app.use(express.urlencoded({ limit: 52428800, extended: true }));
app.use(cookieParser());

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Organization Safety API' });
});

// Routes
const authRoutes = require('./routes/auth');
const orgRoutes = require('./routes/org');
const sosRoutes = require('./routes/sos');
const superAdminRoutes = require('./routes/super_admin.routes');
const emergencyEmailsRoutes = require('./routes/emergencyEmails.routes');
const contactRoutes = require('./routes/contact.routes');

app.use('/api/auth', authRoutes);
app.use('/api/org', orgRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/admin', superAdminRoutes);
app.use('/api/emergency-emails', emergencyEmailsRoutes);
app.use('/api/contact', contactRoutes);

module.exports = app;
