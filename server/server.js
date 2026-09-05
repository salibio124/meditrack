const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route Mounts
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/patients', require('./routes/patientRoutes'));
app.use('/api/medical-records', require('./routes/medicalRoutes'));
app.use('/api/medicines', require('./routes/medicineRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/immunizations', require('./routes/immunizationRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/research', require('./routes/researchRoutes'));
app.use('/api/sms', require('./routes/smsRoutes'));
app.use('/api/audit-logs', require('./routes/auditRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', system: 'MediTrack Backend API', timestamp: new Date().toISOString() });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found on this server.` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Global Error:', err);
  res.status(500).json({
    success: false,
    message: 'An unexpected internal server error occurred.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`🚀 MediTrack API Server running on port ${PORT}`);
});