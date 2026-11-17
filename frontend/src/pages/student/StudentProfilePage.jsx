import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Camera, KeyRound, Save, User } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services/studentService';
import { getErrorMessage } from '../../services/api';
import { ACADEMIC_YEARS, COURSES } from '../../utils/constants';
import { formatDate, getBackendOrigin } from '../../utils/formatters';

export default function StudentProfilePage() {
  const { user, updateUserState } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    college: user?.college || '',
    university: user?.university || '',
    course: user?.course || 'B.Tech',
    branch: user?.branch || '',
    academicYear: user?.academicYear || '2026-27',
  });
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await studentService.updateProfile(form);
      updateUserState(res.user);
      toast.success(res.message || 'Profile updated successfully!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      toast.error('Please select a JPG or PNG image.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Profile photo must be under 2 MB.');
      return;
    }

    setUploadingPhoto(true);
    try {
      const res = await studentService.uploadProfilePhoto(file);
      updateUserState(res.user);
      toast.success('Profile photo updated!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploadingPhoto(false);
    }
  };

  const avatarSrc = user?.profilePhoto
    ? `${getBackendOrigin()}${user.profilePhoto}`
    : null;

  return (
    <DashboardLayout role="student" title="My Profile">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Avatar & Immutable Info */}
        <div className="bg-white rounded-lg border border-[#D4E2F1] p-6 shadow-xs space-y-5 h-fit">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt={user?.name}
                  className="h-28 w-28 rounded-full object-cover border-4 border-[#E8F3FC] shadow"
                />
              ) : (
                <div className="h-28 w-28 rounded-full bg-[#0B2C6F] text-white flex items-center justify-center text-3xl font-extrabold border-4 border-[#E8F3FC]">
                  {(user?.name || 'S').charAt(0).toUpperCase()}
                </div>
              )}

              <label
                className="absolute bottom-0 right-0 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#F37021] text-white shadow hover:bg-[#D85B0F] transition"
                title="Upload Profile Photo"
              >
                <Camera className="h-4 w-4" />
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  className="hidden"
                  onChange={handlePhotoChange}
                  disabled={uploadingPhoto}
                />
              </label>
            </div>

            <h2 className="mt-4 text-lg font-extrabold text-[#0B2C6F]">{user?.name}</h2>
            <p className="text-xs font-mono font-bold text-[#F37021]">
              {user?.enrollmentNumber}
            </p>
            <p className="text-xs text-slate-500 mt-1">{user?.email}</p>
            {uploadingPhoto && (
              <p className="text-xs text-blue-600 mt-2 font-semibold">Uploading photo...</p>
            )}
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Account Status</span>
              <span className="font-bold text-emerald-700">
                {user?.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Registered On</span>
              <span className="font-semibold text-slate-700">{formatDate(user?.createdAt)}</span>
            </div>
          </div>

          <Link
            to="/student/change-password"
            className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-[#0B2C6F] px-4 py-2 text-xs font-bold text-[#0B2C6F] hover:bg-blue-50 transition"
          >
            <KeyRound className="h-3.5 w-3.5" />
            <span>Change Account Password</span>
          </Link>
        </div>

        {/* Right Editable Profile Form */}
        <form
          onSubmit={handleSave}
          className="lg:col-span-2 bg-white rounded-lg border border-[#D4E2F1] p-6 shadow-xs space-y-5"
        >
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <User className="h-5 w-5 text-[#F37021]" />
            <div>
              <h3 className="text-base font-bold text-[#0B2C6F]">Edit Permitted Profile Details</h3>
              <p className="text-xs text-slate-500">
                Email address and enrollment number are locked for verification integrity.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-[#0B2C6F] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mobile Number
              </label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-[#0B2C6F] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Email Address (Read-only)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full rounded border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Enrollment Number (Read-only)
              </label>
              <input
                type="text"
                disabled
                value={user?.enrollmentNumber || ''}
                className="w-full rounded border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-mono text-slate-500 cursor-not-allowed"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                College / Institution Name
              </label>
              <input
                type="text"
                required
                value={form.college}
                onChange={(e) => setForm({ ...form, college: e.target.value })}
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-[#0B2C6F] focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                University Name
              </label>
              <input
                type="text"
                required
                value={form.university}
                onChange={(e) => setForm({ ...form, university: e.target.value })}
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-[#0B2C6F] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Course</label>
              <select
                value={form.course}
                onChange={(e) => setForm({ ...form, course: e.target.value })}
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-[#0B2C6F] focus:outline-none"
              >
                {COURSES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Branch / Specialization
              </label>
              <input
                type="text"
                required
                value={form.branch}
                onChange={(e) => setForm({ ...form, branch: e.target.value })}
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-[#0B2C6F] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Current Academic Year
              </label>
              <select
                value={form.academicYear}
                onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-[#0B2C6F] focus:outline-none"
              >
                {ACADEMIC_YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button type="submit" disabled={saving} className="aicte-btn-orange px-6">
              <Save className="h-4 w-4" />
              <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
