import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

// Registration TypeScript Interface
export interface IRegistration {
  registrationId: string;
  name: string;
  email: string;
  phone: string;
  college: string;
  department: string;
  year: string;
  eventCategory: string;
  message?: string;
  registrationDate: Date | string;
}

// Event Configuration
export interface IEventConfig {
  eventName: string;
  eventTagline: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  organizer: string;
  deadline: string;
  entryRequirements: string;
}

export const defaultEventConfig: IEventConfig = {
  eventName: process.env.EVENT_NAME || "Smart AI Hackathons",
  eventTagline: "AI Hackathon 2026 — Roundwise Details & Class Activities",
  eventDate: process.env.EVENT_DATE || "SEPTEMBER 10–11, 2026",
  eventTime: process.env.EVENT_TIME || "10:00 AM - 03:00 PM IST",
  eventLocation: process.env.EVENT_LOCATION || "KLE Society's College of BCA Gokak",
  organizer: "KLE Society's College of BCA Gokak - AI Innovation Council",
  deadline: "September 09, 2026 (11:59 PM IST)",
  entryRequirements: "BCA 1st, 3rd, and 5th SEM Students ID Card & Registration QR"
};

// Fallback local storage directory
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'registrations.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch {
      // ignore
    }
  }
  if (!fs.existsSync(DATA_FILE)) {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
    } catch {
      // ignore
    }
  }
}

// In-memory cache + file storage
let localRegistrations: IRegistration[] = [];

try {
  ensureDataDir();
  if (fs.existsSync(DATA_FILE)) {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    localRegistrations = JSON.parse(raw);
  }
} catch {
  localRegistrations = [];
}

// Mongoose Schema Definition
const registrationSchema = new mongoose.Schema<IRegistration>({
  registrationId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, required: true, trim: true },
  college: { type: String, required: true, trim: true },
  department: { type: String, required: true, trim: true },
  year: { type: String, required: true, trim: true },
  eventCategory: { type: String, required: true, trim: true },
  message: { type: String, trim: true, default: '' },
  registrationDate: { type: Date, default: Date.now }
});

let RegistrationModel: mongoose.Model<IRegistration> | null = null;
let isMongoConnected = false;
let isConnectingMongo = false;

// Lazy MongoDB initialization
export async function getMongoModel(): Promise<mongoose.Model<IRegistration> | null> {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    return null;
  }

  if (RegistrationModel && isMongoConnected) {
    return RegistrationModel;
  }

  if (isConnectingMongo) {
    return RegistrationModel;
  }

  try {
    isConnectingMongo = true;
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 2500,
        connectTimeoutMS: 2500
      });
      isMongoConnected = true;
      console.log('Successfully connected to MongoDB');
    }
    RegistrationModel = mongoose.models.Registration || mongoose.model<IRegistration>('Registration', registrationSchema);
    return RegistrationModel;
  } catch (err) {
    console.warn('MongoDB connection unavailable, using reliable persistent local storage:', (err as Error).message);
    isMongoConnected = false;
    return null;
  } finally {
    isConnectingMongo = false;
  }
}

// Generate unique registration ID: e.g. NX26-8A3F-99B2
export function generateRegistrationId(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let p1 = '';
  let p2 = '';
  for (let i = 0; i < 4; i++) {
    p1 += chars.charAt(Math.floor(Math.random() * chars.length));
    p2 += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `NX26-${p1}-${p2}`;
}

// Validation logic
export function validateRegistrationPayload(data: Partial<IRegistration>): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!data.name || data.name.trim().length < 2) {
    errors.name = 'Full name is required (at least 2 characters).';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email.trim())) {
    errors.email = 'Please provide a valid email address.';
  }

  const cleanPhone = (data.phone || '').replace(/[\s\-()+]/g, '');
  if (!data.phone || cleanPhone.length < 7 || cleanPhone.length > 15 || !/^\d+$/.test(cleanPhone)) {
    errors.phone = 'Please provide a valid phone number (7 to 15 digits).';
  }

  if (!data.college || data.college.trim().length < 2) {
    errors.college = 'College or Organization name is required.';
  }

  if (!data.department || data.department.trim().length < 2) {
    errors.department = 'Department name is required.';
  }

  if (!data.year || data.year.trim().length < 1) {
    errors.year = 'Year or Semester is required.';
  }

  if (!data.eventCategory || data.eventCategory.trim().length < 2) {
    errors.eventCategory = 'Please select an event category.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

// Save Registration
export async function saveRegistration(input: Omit<IRegistration, 'registrationId' | 'registrationDate'>): Promise<IRegistration> {
  const validation = validateRegistrationPayload(input);
  if (!validation.valid) {
    const err = new Error('Validation failed');
    (err as unknown as { validationErrors: Record<string, string> }).validationErrors = validation.errors;
    throw err;
  }

  const registrationId = generateRegistrationId();
  const registration: IRegistration = {
    registrationId,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    college: input.college.trim(),
    department: input.department.trim(),
    year: input.year.trim(),
    eventCategory: input.eventCategory.trim(),
    message: (input.message || '').trim(),
    registrationDate: new Date().toISOString()
  };

  // Always save to local durable list/file
  localRegistrations.unshift(registration);
  try {
    ensureDataDir();
    fs.writeFileSync(DATA_FILE, JSON.stringify(localRegistrations, null, 2), 'utf-8');
  } catch (fsErr) {
    console.warn('Could not write local data file:', fsErr);
  }

  // Attempt MongoDB storage if available
  try {
    const Model = await getMongoModel();
    if (Model) {
      const doc = new Model(registration);
      await doc.save();
    }
  } catch (mErr) {
    console.warn('MongoDB insert skipped/failed, local persistent copy preserved:', (mErr as Error).message);
  }

  return registration;
}

// Retrieve registrations
export async function getRegistrations(): Promise<IRegistration[]> {
  try {
    const Model = await getMongoModel();
    if (Model) {
      const docs = await Model.find().sort({ registrationDate: -1 }).lean();
      if (docs && docs.length > 0) {
        return docs.map(d => ({
          registrationId: d.registrationId,
          name: d.name,
          email: d.email,
          phone: d.phone,
          college: d.college,
          department: d.department,
          year: d.year,
          eventCategory: d.eventCategory,
          message: d.message,
          registrationDate: d.registrationDate
        }));
      }
    }
  } catch {
    // Fallback to local
  }
  return localRegistrations;
}
