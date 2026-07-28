const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
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

app.use('/api/auth', authRoutes);
app.use('/api/org', orgRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/super-admin', superAdminRoutes);

module.exports = app;
