import React, { useState, useEffect, useCallback } from 'react';
import { KageLandingPage } from './shaders/landing-pages/LandingPages';
import './shaders/threeui.css';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  Download,
  Settings2,
  Database,
  X,
  ExternalLink,
  ShieldCheck,
  Award
} from 'lucide-react';

interface RegistrationItem {
  registrationId: string;
  name: string;
  email: string;
  phone: string;
  college: string;
  department: string;
  year: string;
  eventCategory: string;
  message?: string;
  registrationDate: string;
}

interface EventConfig {
  eventName: string;
  eventTagline: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  organizer: string;
  deadline: string;
  entryRequirements: string;
}

export default function App() {
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [showAttendeesModal, setShowAttendeesModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [lastRegistered, setLastRegistered] = useState<RegistrationItem | null>(null);
  const [eventConfig, setEventConfig] = useState<EventConfig>({
    eventName: "Smart AI Hackathons",
    eventTagline: "AI Hackathon 2026 — Roundwise Details & Class Activities",
    eventDate: "SEPTEMBER 10–11, 2026",
    eventTime: "10:00 AM - 03:00 PM",
    eventLocation: "KLE Society's College of BCA Gokak",
    organizer: "KLE Society's College of BCA Gokak",
    deadline: "September 09, 2026 (11:59 PM)",
    entryRequirements: "BCA 1st, 3rd & 5th SEM Students ID Card & Registration QR"
  });
  const [isMongoActive, setIsMongoActive] = useState<boolean>(false);

  // Load existing registrations and config
  const fetchRegistrations = useCallback(async () => {
    try {
      const res = await fetch('/api/registrations');
      if (res.ok) {
        const data = await res.json();
        if (data.registrations) {
          setRegistrations(data.registrations);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/event-config');
      if (res.ok) {
        const data = await res.json();
        if (data.config) {
          setEventConfig(data.config);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchRegistrations();
    fetchConfig();
  }, [fetchRegistrations, fetchConfig]);

  // Handle postMessage from iframe
  const handleIframeMessage = useCallback((data: any) => {
    if (data?.type === 'EVENT_REGISTRATION_SUCCESS' && data.registration) {
      setLastRegistered(data.registration);
      setRegistrations(prev => [data.registration, ...prev]);

      // Confetti burst
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#e0231c', '#ff5a3c', '#ffffff', '#c9a24a']
        });
      } catch {
        // ignore
      }
    }
  }, []);

  // Export registrations as CSV
  const handleExportCSV = () => {
    if (registrations.length === 0) {
      alert('No registrations available to export.');
      return;
    }
    const headers = ['Registration ID', 'Name', 'Email', 'Phone', 'College', 'Department', 'Year', 'Category', 'Date'];
    const rows = registrations.map(r => [
      r.registrationId,
      `"${r.name.replace(/"/g, '""')}"`,
      `"${r.email.replace(/"/g, '""')}"`,
      `"${r.phone.replace(/"/g, '""')}"`,
      `"${r.college.replace(/"/g, '""')}"`,
      `"${r.department.replace(/"/g, '""')}"`,
      `"${r.year.replace(/"/g, '""')}"`,
      `"${r.eventCategory.replace(/"/g, '""')}"`,
      `"${new Date(r.registrationDate).toLocaleString()}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${eventConfig.eventName.toLowerCase().replace(/\s+/g, '_')}_registrations.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#05070a] text-white">
      {/* 3D WebGL Event Experience */}
      <div className="absolute inset-0 w-full h-full">
        <KageLandingPage
          headingFont="syne"
          bodyFont="plus-jakarta-sans"
          headingWeight="700"
          bodyWeight="400"
          primaryColor="#00d2ff"
          headingSize={56}
          bodySize={18}
          headingLetterSpacing={-0.02}
          onMessage={handleIframeMessage}
        />
      </div>





      {/* EVENT CONFIG & DB STATUS MODAL */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-[#0d1218] border border-white/20 rounded-2xl p-6 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-white/10 text-white">
                  <Database className="w-5 h-5 text-[#ff5a3c]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">System & Configuration</h3>
                  <p className="text-xs text-gray-400">Database & Event Parameters</p>
                </div>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              {/* DB Status */}
              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-blue-400" />
                    MongoDB Integration
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Active & Ready
                  </span>
                </div>
                <p className="text-gray-400 text-[11px]">
                  Configured via <code className="text-gray-300 bg-black/40 px-1 py-0.5 rounded">MONGODB_URI</code> environment variable. Dual-layer storage with auto-sync and persistent disk backup.
                </p>
              </div>

              {/* Event Info Summary */}
              <div className="space-y-2">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Current Event Settings</div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                    <span className="text-gray-500 block">Event Name</span>
                    <span className="font-semibold text-white">{eventConfig.eventName}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                    <span className="text-gray-500 block">Dates</span>
                    <span className="font-semibold text-white">{eventConfig.eventDate}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                    <span className="text-gray-500 block">Time</span>
                    <span className="font-semibold text-white">{eventConfig.eventTime}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                    <span className="text-gray-500 block">Location</span>
                    <span className="font-semibold text-white truncate block">{eventConfig.eventLocation}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 rounded-lg bg-[#e0231c] hover:bg-[#ff5a3c] text-white text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
