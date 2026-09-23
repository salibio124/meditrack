import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import {
  Settings as SettingsIcon,
  User,
  Building2,
  Shield,
  Bell,
  Sliders,
  Database,
  Lock,
  Mail,
  Phone,
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Download,
  Upload,
  RefreshCw,
  Save,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';

export default function Settings() {
  const { user: currentUser, showToast } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const isAdmin = currentUser?.role === 'Administrator';

  // 1. Profile State
  const [profile, setProfile] = useState({
    fullName: '',
    username: '',
    email: '',
    contactNumber: '',
    roleName: ''
  });

  // Password State + Show/Hide Toggles
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 2. Health Station State
  const [clinic, setClinic] = useState({
    clinicName: 'Barangay San Jose Health Station',
    barangay: 'Brgy. San Jose',
    city: 'Quezon City',
    province: 'Metro Manila',
    address: 'Purok 1, Riverside St., Brgy. San Jose',
    contactNumber: '0917-123-4567',
    email: 'station@meditrack.ph',
    openingTime: '08:00',
    closingTime: '17:00',
    daysOpen: 'Monday – Friday'
  });

  // 3. Security Settings State
  const [security, setSecurity] = useState({
    autoLogoutEnabled: true,
    inactivityTimeout: 15,
    twoFactorAuth: true,
    loginActivity: true,
    activeSessions: true
  });

  // 4. Notification Toggles State
  const [notifications, setNotifications] = useState({
    smsEnabled: true,
    appointmentReminders: true,
    lowStockAlerts: true,
    expiryAlerts: true,
    immunizationReminders: true,
    systemNotifications: true
  });

  // 5. System Preferences State
  const [preferences, setPreferences] = useState({
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12-hour',
    timezone: 'Asia/Manila',
    language: 'English',
    defaultDashboardView: 'Standard'
  });

  // 6. Data & Backup State
  const [lastBackup, setLastBackup] = useState(null);
  const [restoreSql, setRestoreSql] = useState('');
  const [isRestoring, setIsRestoring] = useState(false);

  // Load Settings from Backend
  const loadSettings = () => {
    setLoading(true);
    api.get('/settings')
      .then((res) => {
        const { settings, profile: userProfile } = res.data.data;
        if (userProfile) {
          setProfile({
            fullName: userProfile.full_name || '',
            username: userProfile.username || '',
            email: userProfile.email || '',
            contactNumber: userProfile.contact_number || '',
            roleName: userProfile.role_name || ''
          });
        }
        if (settings) {
          setClinic({
            clinicName: settings.clinic_name || '',
            barangay: settings.barangay || '',
            city: settings.city || '',
            province: settings.province || '',
            address: settings.address || '',
            contactNumber: settings.contact_number || '',
            email: settings.email || '',
            openingTime: settings.opening_time || '08:00',
            closingTime: settings.closing_time || '17:00',
            daysOpen: settings.days_open || 'Monday – Friday'
          });
          setSecurity({
            autoLogoutEnabled: Boolean(settings.auto_logout_enabled),
            inactivityTimeout: settings.inactivity_timeout || 15,
            twoFactorAuth: Boolean(settings.two_factor_auth),
            loginActivity: true,
            activeSessions: true
          });
          setNotifications({
            smsEnabled: Boolean(settings.sms_enabled),
            appointmentReminders: Boolean(settings.appointment_reminders),
            lowStockAlerts: Boolean(settings.low_stock_alerts),
            expiryAlerts: Boolean(settings.expiry_alerts),
            immunizationReminders: Boolean(settings.immunization_reminders),
            systemNotifications: Boolean(settings.system_notifications)
          });
          setPreferences({
            dateFormat: settings.date_format || 'MM/DD/YYYY',
            timeFormat: settings.time_format || '12-hour',
            timezone: settings.timezone || 'Asia/Manila',
            language: settings.language || 'English',
            defaultDashboardView: settings.default_dashboard_view || 'Standard'
          });
          setLastBackup(settings.last_backup_date ? new Date(settings.last_backup_date).toLocaleString() : 'No recent backup');
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSettings();
  }, []);

  // 1. SAVE PROFILE
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profile.fullName || !profile.email) {
      if (showToast) showToast('Full name and email cannot be empty.', 'error');
      return;
    }
    try {
      await api.put('/settings/profile', {
        fullName: profile.fullName,
        email: profile.email,
        contactNumber: profile.contactNumber
      });
      if (showToast) showToast('Settings saved successfully.', 'success');
      loadSettings();
    } catch (err) {
      if (showToast) showToast(err.response?.data?.message || 'Error updating profile.', 'error');
    }
  };

  // 1B. CHANGE PASSWORD
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      if (showToast) showToast('New password and confirmation do not match.', 'error');
      return;
    }
    try {
      await api.put('/settings/change-password', passwordForm);
      if (showToast) showToast('Password changed successfully.', 'success');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (err) {
      if (showToast) showToast(err.response?.data?.message || 'Password change failed.', 'error');
    }
  };

  // 2. SAVE HEALTH STATION INFO
  const handleSaveClinic = async (e) => {
    e.preventDefault();
    try {
      await api.put('/settings', {
        ...clinic,
        ...security,
        ...notifications,
        ...preferences
      });
      if (showToast) showToast('Settings saved successfully.', 'success');
      loadSettings();
    } catch (err) {
      if (showToast) showToast('Failed to save health station info.', 'error');
    }
  };

  // 3. SAVE SECURITY SETTINGS
  const handleSaveSecurity = async (e) => {
    e.preventDefault();
    try {
      await api.put('/settings', {
        ...clinic,
        ...security,
        ...notifications,
        ...preferences
      });
      if (showToast) showToast('Settings saved successfully.', 'success');
      loadSettings();
    } catch (err) {
      if (showToast) showToast('Failed to save security settings.', 'error');
    }
  };

  // 4. SAVE NOTIFICATIONS
  const handleSaveNotifications = async (e) => {
    e.preventDefault();
    try {
      await api.put('/settings', {
        ...clinic,
        ...security,
        ...notifications,
        ...preferences
      });
      if (showToast) showToast('Settings saved successfully.', 'success');
      loadSettings();
    } catch (err) {
      if (showToast) showToast('Failed to save notification toggles.', 'error');
    }
  };

  // 5. SAVE PREFERENCES
  const handleSavePreferences = async (e) => {
    e.preventDefault();
    try {
      await api.put('/settings', {
        ...clinic,
        ...security,
        ...notifications,
        ...preferences
      });
      if (showToast) showToast('Settings saved successfully.', 'success');
      loadSettings();
    } catch (err) {
      if (showToast) showToast('Failed to save preferences.', 'error');
    }
  };

  // 6. BACKUP DATABASE (DOWNLOAD SQL)
  const handleBackupDownload = async () => {
    try {
      const response = await api.get('/settings/backup', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `meditrack_backup_${new Date().toISOString().slice(0, 10)}.sql`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      if (showToast) showToast('Database backup downloaded successfully.', 'success');
      loadSettings();
    } catch (err) {
      if (showToast) showToast('Failed to download database backup.', 'error');
    }
  };

  // RESTORE DATABASE
  const handleRestoreDatabase = async () => {
    const confirmation = window.confirm(
      '⚠️ Restoring a backup may replace current system data. Make sure you have a recent backup before continuing. Proceed with restoration?'
    );
    if (!confirmation) return;

    if (!restoreSql.trim()) {
      if (showToast) showToast('Please select or paste SQL backup content first.', 'error');
      return;
    }

    setIsRestoring(true);
    try {
      await api.post('/settings/restore', { sqlContent: restoreSql });
      if (showToast) showToast('Database restored successfully from backup.', 'success');
      setRestoreSql('');
      loadSettings();
    } catch (err) {
      if (showToast) showToast(err.response?.data?.message || 'Restore failed.', 'error');
    } finally {
      setIsRestoring(false);
    }
  };

  // EXPORT SYSTEM DATA (JSON)
  const handleExportData = async () => {
    try {
      const response = await api.get('/settings/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'meditrack_data_export.json');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      if (showToast) showToast('System data exported successfully.', 'success');
    } catch (err) {
      if (showToast) showToast('Export failed.', 'error');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setRestoreSql(event.target.result);
      if (showToast) showToast(`Backup file loaded: ${file.name}`, 'info');
    };
    reader.readAsText(file);
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 font-medium text-xs">
        Loading system settings and preferences...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* PAGE HEADER */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Settings</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#064e3b] text-white">
              System Control
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage your account, health station information, security, notifications, and system preferences.
          </p>
        </div>
      </div>

      {/* TWO-COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ================= 1. PROFILE SETTINGS ================= */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#064e3b] flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Profile</h2>
              <p className="text-[11px] text-slate-400">Personal staff credentials and authenticated role</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            
            {/* AVATAR + SUMMARY */}
            <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-[#064e3b] text-white flex items-center justify-center font-black text-lg shadow-sm">
                {profile.fullName?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">{profile.fullName}</p>
                <span className="inline-block mt-0.5 px-2 py-0.5 bg-emerald-100 text-[#064e3b] rounded-md font-bold text-[10px]">
                  Role: {profile.roleName} (Non-Editable)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  required
                  type="text"
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#064e3b] font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Username (Display Only)</label>
                <input
                  disabled
                  type="text"
                  value={profile.username}
                  className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl font-mono font-bold text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                <input
                  required
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#064e3b] font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Contact Number</label>
                <input
                  type="text"
                  placeholder="0917-123-4567"
                  value={profile.contactNumber}
                  onChange={(e) => setProfile({ ...profile, contactNumber: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#064e3b] font-medium"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={loadSettings}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#064e3b] hover:bg-[#04382a] text-white font-bold rounded-xl shadow-md transition cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>

          {/* CHANGE PASSWORD SUB-SECTION WITH SHOW/HIDE TOGGLES */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-emerald-700" />
              <span>Change Password</span>
            </h3>

            <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
              
              {/* Current Password Field */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Current Password *</label>
                <div className="relative">
                  <input
                    required
                    type={showCurrentPassword ? 'text' : 'password'}
                    placeholder="Enter current password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="w-full p-2.5 pr-10 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#064e3b]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 transition cursor-pointer p-0.5"
                    title={showCurrentPassword ? 'Hide password' : 'Show password'}
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* New Password Field */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">New Password *</label>
                  <div className="relative">
                    <input
                      required
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="Min 8 chars, uppercase & symbol"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full p-2.5 pr-10 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#064e3b]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 transition cursor-pointer p-0.5"
                      title={showNewPassword ? 'Hide password' : 'Show password'}
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password Field */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Confirm New Password *</label>
                  <div className="relative">
                    <input
                      required
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Repeat new password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="w-full p-2.5 pr-10 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#064e3b]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 transition cursor-pointer p-0.5"
                      title={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition cursor-pointer"
              >
                Update Password
              </button>
            </form>
          </div>
        </div>

        {/* ================= 2. HEALTH STATION INFORMATION ================= */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Health Station Information</h2>
              <p className="text-[11px] text-slate-400">Official local barangay health clinic details</p>
            </div>
          </div>

          <form onSubmit={handleSaveClinic} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Health Station Name *</label>
              <input
                required
                disabled={!isAdmin}
                type="text"
                value={clinic.clinicName}
                onChange={(e) => setClinic({ ...clinic, clinicName: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-xl font-bold text-slate-900 disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Barangay</label>
                <input
                  disabled={!isAdmin}
                  type="text"
                  value={clinic.barangay}
                  onChange={(e) => setClinic({ ...clinic, barangay: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-xl disabled:bg-slate-100"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Municipality / City</label>
                <input
                  disabled={!isAdmin}
                  type="text"
                  value={clinic.city}
                  onChange={(e) => setClinic({ ...clinic, city: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-xl disabled:bg-slate-100"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Province</label>
                <input
                  disabled={!isAdmin}
                  type="text"
                  value={clinic.province}
                  onChange={(e) => setClinic({ ...clinic, province: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-xl disabled:bg-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Complete Address</label>
              <input
                disabled={!isAdmin}
                type="text"
                value={clinic.address}
                onChange={(e) => setClinic({ ...clinic, address: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-xl disabled:bg-slate-100"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Contact Number</label>
                <input
                  disabled={!isAdmin}
                  type="text"
                  value={clinic.contactNumber}
                  onChange={(e) => setClinic({ ...clinic, contactNumber: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-xl disabled:bg-slate-100"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  disabled={!isAdmin}
                  type="email"
                  value={clinic.email}
                  onChange={(e) => setClinic({ ...clinic, email: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-xl disabled:bg-slate-100"
                />
              </div>
            </div>

            {/* OPERATING HOURS */}
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
              <label className="block font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                Operating Schedule
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold mb-0.5">Days Open</span>
                  <input
                    disabled={!isAdmin}
                    type="text"
                    value={clinic.daysOpen}
                    onChange={(e) => setClinic({ ...clinic, daysOpen: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl font-medium disabled:bg-slate-100"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold mb-0.5">Opening Time</span>
                  <input
                    disabled={!isAdmin}
                    type="time"
                    value={clinic.openingTime}
                    onChange={(e) => setClinic({ ...clinic, openingTime: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold disabled:bg-slate-100"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold mb-0.5">Closing Time</span>
                  <input
                    disabled={!isAdmin}
                    type="time"
                    value={clinic.closingTime}
                    onChange={(e) => setClinic({ ...clinic, closingTime: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold disabled:bg-slate-100"
                  />
                </div>
              </div>
              <p className="text-[10px] text-slate-500 italic">Example: Monday – Friday, 8:00 AM – 5:00 PM</p>
            </div>

            {isAdmin && (
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#064e3b] hover:bg-[#04382a] text-white font-bold rounded-xl shadow-md transition cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            )}
          </form>
        </div>

        {/* ================= 3. SECURITY SETTINGS ================= */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Security</h2>
              <p className="text-[11px] text-slate-400">Data privacy, session protection, and two-factor controls</p>
            </div>
          </div>

          <form onSubmit={handleSaveSecurity} className="space-y-4 text-xs">
            
            {/* AUTOMATIC LOGOUT CONFIGURATION */}
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">Automatic Logout</p>
                  <p className="text-[11px] text-slate-500">
                    Automatically signs out the account after the selected period of inactivity.
                  </p>
                </div>
                <input
                  disabled={!isAdmin}
                  type="checkbox"
                  checked={security.autoLogoutEnabled}
                  onChange={(e) => setSecurity({ ...security, autoLogoutEnabled: e.target.checked })}
                  className="w-4 h-4 rounded text-[#064e3b] focus:ring-[#064e3b] cursor-pointer"
                />
              </div>

              {security.autoLogoutEnabled && (
                <div className="pt-2 border-t border-slate-200/60">
                  <label className="block font-bold text-slate-700 mb-1">Inactivity Timeout Duration</label>
                  <select
                    disabled={!isAdmin}
                    value={security.inactivityTimeout}
                    onChange={(e) => setSecurity({ ...security, inactivityTimeout: parseInt(e.target.value, 10) })}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800"
                  >
                    <option value="5">5 minutes</option>
                    <option value="10">10 minutes</option>
                    <option value="15">15 minutes (Standard Healthcare Default)</option>
                    <option value="30">30 minutes</option>
                    <option value="60">60 minutes</option>
                  </select>
                </div>
              )}
            </div>

            {/* SECURITY TOGGLE SWITCHES */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between border-b border-slate-50 pb-2.5">
                <div>
                  <p className="font-bold text-slate-800">Two-Factor Authentication (2FA)</p>
                  <p className="text-[11px] text-slate-400">Require Email OTP verification when provisioning new staff</p>
                </div>
                <input
                  disabled={!isAdmin}
                  type="checkbox"
                  checked={security.twoFactorAuth}
                  onChange={(e) => setSecurity({ ...security, twoFactorAuth: e.target.checked })}
                  className="w-4 h-4 rounded text-[#064e3b] focus:ring-[#064e3b] cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between border-b border-slate-50 pb-2.5">
                <div>
                  <p className="font-bold text-slate-800">Login Activity Auditing</p>
                  <p className="text-[11px] text-slate-400">Track and timestamp all successful and failed login attempts</p>
                </div>
                <input
                  disabled={!isAdmin}
                  type="checkbox"
                  checked={security.loginActivity}
                  onChange={(e) => setSecurity({ ...security, loginActivity: e.target.checked })}
                  className="w-4 h-4 rounded text-[#064e3b] focus:ring-[#064e3b] cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">Active Single Sessions</p>
                  <p className="text-[11px] text-slate-400">Terminate sessions immediately upon closing the browser tab</p>
                </div>
                <input
                  disabled
                  type="checkbox"
                  checked={security.activeSessions}
                  className="w-4 h-4 rounded text-[#064e3b] cursor-not-allowed"
                />
              </div>
            </div>

            {isAdmin && (
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#064e3b] hover:bg-[#04382a] text-white font-bold rounded-xl shadow-md transition cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            )}
          </form>
        </div>

        {/* ================= 4. NOTIFICATION SETTINGS ================= */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Notifications</h2>
              <p className="text-[11px] text-slate-400">Configure cellular SMS triggers and clinical alert thresholds</p>
            </div>
          </div>

          <form onSubmit={handleSaveNotifications} className="space-y-3.5 text-xs">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div>
                <p className="font-bold text-slate-800">SMS Notifications</p>
                <p className="text-[11px] text-slate-400">Enable global SMS transmission via Semaphore cellular gateway</p>
              </div>
              <input
                disabled={!isAdmin}
                type="checkbox"
                checked={notifications.smsEnabled}
                onChange={(e) => setNotifications({ ...notifications, smsEnabled: e.target.checked })}
                className="w-4 h-4 rounded text-[#064e3b] focus:ring-[#064e3b] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div>
                <p className="font-bold text-slate-800">Appointment Reminders</p>
                <p className="text-[11px] text-slate-400">Send SMS reminders for upcoming patient consultations</p>
              </div>
              <input
                disabled={!isAdmin}
                type="checkbox"
                checked={notifications.appointmentReminders}
                onChange={(e) => setNotifications({ ...notifications, appointmentReminders: e.target.checked })}
                className="w-4 h-4 rounded text-[#064e3b] focus:ring-[#064e3b] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div>
                <p className="font-bold text-slate-800">Medicine Low-Stock Alerts</p>
                <p className="text-[11px] text-slate-400">Notify staff when medicine stock reaches the minimum threshold</p>
              </div>
              <input
                disabled={!isAdmin}
                type="checkbox"
                checked={notifications.lowStockAlerts}
                onChange={(e) => setNotifications({ ...notifications, lowStockAlerts: e.target.checked })}
                className="w-4 h-4 rounded text-[#064e3b] focus:ring-[#064e3b] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div>
                <p className="font-bold text-slate-800">Medicine Expiry Alerts</p>
                <p className="text-[11px] text-slate-400">Notify staff when medicine batches are approaching expiration (≤ 60 days)</p>
              </div>
              <input
                disabled={!isAdmin}
                type="checkbox"
                checked={notifications.expiryAlerts}
                onChange={(e) => setNotifications({ ...notifications, expiryAlerts: e.target.checked })}
                className="w-4 h-4 rounded text-[#064e3b] focus:ring-[#064e3b] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div>
                <p className="font-bold text-slate-800">Immunization Reminders</p>
                <p className="text-[11px] text-slate-400">Send reminders for scheduled child and maternal immunizations</p>
              </div>
              <input
                disabled={!isAdmin}
                type="checkbox"
                checked={notifications.immunizationReminders}
                onChange={(e) => setNotifications({ ...notifications, immunizationReminders: e.target.checked })}
                className="w-4 h-4 rounded text-[#064e3b] focus:ring-[#064e3b] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800">System Notifications</p>
                <p className="text-[11px] text-slate-400">Receive important system notifications and security alerts</p>
              </div>
              <input
                disabled={!isAdmin}
                type="checkbox"
                checked={notifications.systemNotifications}
                onChange={(e) => setNotifications({ ...notifications, systemNotifications: e.target.checked })}
                className="w-4 h-4 rounded text-[#064e3b] focus:ring-[#064e3b] cursor-pointer"
              />
            </div>

            {isAdmin && (
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#064e3b] hover:bg-[#04382a] text-white font-bold rounded-xl shadow-md transition cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            )}
          </form>
        </div>

        {/* ================= 5. SYSTEM PREFERENCES ================= */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">System Preferences</h2>
              <p className="text-[11px] text-slate-400">Formatting standards for Philippine Barangay Health Centers</p>
            </div>
          </div>

          <form onSubmit={handleSavePreferences} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Date Format</label>
                <select
                  disabled={!isAdmin}
                  value={preferences.dateFormat}
                  onChange={(e) => setPreferences({ ...preferences, dateFormat: e.target.value })}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-semibold"
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 09/15/2026)</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 15/09/2026)</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-09-15)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Time Format</label>
                <select
                  disabled={!isAdmin}
                  value={preferences.timeFormat}
                  onChange={(e) => setPreferences({ ...preferences, timeFormat: e.target.value })}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-semibold"
                >
                  <option value="12-hour">12-hour (e.g. 09:30 AM)</option>
                  <option value="24-hour">24-hour (e.g. 09:30)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Time Zone</label>
                <select
                  disabled
                  value={preferences.timezone}
                  className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl font-semibold text-slate-500 cursor-not-allowed"
                >
                  <option value="Asia/Manila">Asia/Manila (PHT GMT+8)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">System Language</label>
                <select
                  disabled
                  value={preferences.language}
                  className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl font-semibold text-slate-500 cursor-not-allowed"
                >
                  <option value="English">English</option>
                  <option value="Filipino">Filipino / Tagalog</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Default Dashboard View</label>
              <select
                disabled={!isAdmin}
                value={preferences.defaultDashboardView}
                onChange={(e) => setPreferences({ ...preferences, defaultDashboardView: e.target.value })}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-semibold"
              >
                <option value="Standard">Standard Clinical Overview</option>
                <option value="InventoryFocused">Inventory & Batch Focused</option>
                <option value="MorbidityFocused">Public Health Morbidity Focused</option>
              </select>
            </div>

            {isAdmin && (
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#064e3b] hover:bg-[#04382a] text-white font-bold rounded-xl shadow-md transition cursor-pointer"
                >
                  Save Preferences
                </button>
              </div>
            )}
          </form>
        </div>

        {/* ================= 6. DATA & BACKUP (ADMINISTRATORS ONLY) ================= */}
        {isAdmin && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-900">Data & Backup</h2>
                  <span className="text-[10px] font-extrabold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                    Admin Only
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Database backup snapshots, restoration, and raw data export</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              
              {/* BACKUP DOWNLOAD CARD */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-slate-900">Database Backup</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Last Backup: <span className="font-semibold text-emerald-800">{lastBackup}</span>
                  </p>
                </div>
                <button
                  onClick={handleBackupDownload}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#064e3b] hover:bg-[#04382a] text-white font-bold rounded-xl shadow-sm transition cursor-pointer self-start sm:self-auto"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Backup Database (.SQL)</span>
                </button>
              </div>

              {/* RESTORE CARD WITH SAFETY WARNING */}
              <div className="p-4 bg-rose-50/70 border border-rose-200/80 rounded-2xl space-y-3">
                <div className="flex items-start gap-2 text-rose-900">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-xs">Restore Database</p>
                    <p className="text-[11px] text-rose-700 leading-relaxed mt-0.5">
                      <strong>Warning:</strong> Restoring a backup may replace current system data. Make sure you have a recent backup before continuing.
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <input
                    type="file"
                    accept=".sql"
                    onChange={handleFileUpload}
                    className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-white file:text-slate-700 hover:file:bg-slate-100 cursor-pointer"
                  />

                  {restoreSql && (
                    <button
                      type="button"
                      disabled={isRestoring}
                      onClick={handleRestoreDatabase}
                      className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow transition cursor-pointer disabled:opacity-50"
                    >
                      {isRestoring ? 'Restoring Data...' : 'Confirm & Execute Database Restore'}
                    </button>
                  )}
                </div>
              </div>

              {/* RAW DATA EXPORT */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">Export System Data</p>
                  <p className="text-[11px] text-slate-500">Download complete patient and inventory records in JSON format</p>
                </div>
                <button
                  onClick={handleExportData}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export JSON</span>
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}