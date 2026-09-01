import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { saveRegistration, getRegistrations, defaultEventConfig } from './src/api/registrationService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// API endpoints
app.post('/api/register', async (req, res) => {
  try {
    const registration = await saveRegistration(req.body);
    return res.status(201).json({ success: true, registration });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message || 'Registration failed',
      errors: err.validationErrors || {},
    });
  }
});

app.get('/api/registrations', async (req, res) => {
  try {
    const list = await getRegistrations();
    return res.json({ success: true, count: list.length, registrations: list });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/event-config', (req, res) => {
  return res.json({ success: true, config: defaultEventConfig });
});

// Serve static build from dist or public
app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  res.sendFile(indexPath);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Event Registration Server running on http://0.0.0.0:${PORT}`);
});
