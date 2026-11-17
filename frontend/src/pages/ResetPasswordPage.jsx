import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CheckCircle2, Eye, EyeOff } from 'lucide-react';
import PublicLayout from '../layouts/PublicLayout';
import { authService } from '../services/authService';
import { getErrorMessage } from '../services/api';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await authService.resetPassword({ token, password, confirmPassword });
      toast.success(res.message);
      navigate('/login');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PublicLayout>
      <div className="aicte-sky-hero border-b border-sky-200 py-8 px-4">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-2xl font-extrabold text-[#0B2C6F]">Reset Account Password</h2>
          <p className="text-xs sm:text-sm text-slate-700 mt-1">
            Choose a strong new password for your AICTE Portal account.
          </p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-10">
        {!token ? (
          <div className="bg-white rounded-lg border border-red-200 p-6 text-center space-y-3">
            <p className="text-sm font-semibold text-red-700">
              Reset token is missing or invalid.
            </p>
            <Link to="/forgot-password" className="aicte-btn-orange inline-flex">
              Request New Reset Link
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-4"
          >
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                New Password *
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full rounded border border-slate-300 px-3 py-2.5 pr-10 text-sm focus:border-[#0B2C6F] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirm New Password *
              </label>
              <input
                type={showPw ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="w-full rounded border border-slate-300 px-3 py-2.5 text-sm focus:border-[#0B2C6F] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="aicte-btn-orange w-full py-2.5 disabled:opacity-60"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{submitting ? 'Resetting...' : 'Reset Password'}</span>
            </button>
          </form>
        )}
      </div>
    </PublicLayout>
  );
}
