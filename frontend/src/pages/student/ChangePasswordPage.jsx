import { useState } from 'react';
import toast from 'react-hot-toast';
import { Eye, EyeOff, KeyRound } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { authService } from '../../services/authService';
import { getErrorMessage } from '../../services/api';

export default function ChangePasswordPage({ role = 'student' }) {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long.');
      return;
    }
    if (form.newPassword !== form.confirmNewPassword) {
      toast.error('New password and confirmation do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await authService.changePassword(form);
      toast.success(res.message);
      setForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout role={role} title="Change Password">
      <div className="max-w-lg mx-auto">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg border border-[#D4E2F1] p-6 shadow-xs space-y-4"
        >
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <KeyRound className="h-5 w-5 text-[#F37021]" />
            <h3 className="text-base font-bold text-[#0B2C6F]">Update Account Password</h3>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Current Password *
            </label>
            <input
              type={show ? 'text' : 'password'}
              required
              value={form.currentPassword}
              onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              New Password *
            </label>
            <input
              type={show ? 'text' : 'password'}
              required
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Confirm New Password *
            </label>
            <input
              type={show ? 'text' : 'password'}
              required
              value={form.confirmNewPassword}
              onChange={(e) => setForm({ ...form, confirmNewPassword: e.target.value })}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setShow((p) => !p)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-[#0B2C6F]"
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span>{show ? 'Hide Passwords' : 'Show Passwords'}</span>
            </button>
            <button type="submit" disabled={submitting} className="aicte-btn-orange px-6">
              {submitting ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
