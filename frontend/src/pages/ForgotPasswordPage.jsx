import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { KeyRound, ArrowRight } from 'lucide-react';
import PublicLayout from '../layouts/PublicLayout';
import { authService } from '../services/authService';
import { getErrorMessage } from '../services/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [demoLink, setDemoLink] = useState('');
  const [submittedMsg, setSubmittedMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await authService.forgotPassword(email);
      setSubmittedMsg(res.message);
      if (res.demoResetUrl) {
        setDemoLink(res.demoResetUrl);
      }
      toast.success('Reset request processed.');
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
          <h2 className="text-2xl font-extrabold text-[#0B2C6F]">Forgot Password</h2>
          <p className="text-xs sm:text-sm text-slate-700 mt-1">
            Enter your registered email address to generate a secure password reset token.
          </p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-10">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-4"
        >
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Registered Email Address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@aicte-demo.edu"
              className="w-full rounded border border-slate-300 px-3 py-2.5 text-sm focus:border-[#0B2C6F] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="aicte-btn-orange w-full py-2.5 disabled:opacity-60"
          >
            <KeyRound className="h-4 w-4" />
            <span>{submitting ? 'Generating Reset Link...' : 'Send Reset Instructions'}</span>
          </button>

          {submittedMsg && (
            <div className="rounded-md border border-blue-200 bg-blue-50 p-3.5 text-xs text-blue-900 space-y-2">
              <p className="font-medium">{submittedMsg}</p>
              {demoLink && (
                <div className="pt-1 border-t border-blue-200">
                  <p className="font-bold text-[#0B2C6F] mb-1">
                    Academic Demo Development Reset Link:
                  </p>
                  <Link
                    to={demoLink}
                    className="inline-flex items-center gap-1 font-bold text-[#F37021] hover:underline"
                  >
                    <span>Proceed to Reset Password</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}
            </div>
          )}

          <div className="text-center text-xs pt-2">
            <Link to="/login" className="font-semibold text-[#0B2C6F] hover:underline">
              ← Back to Login
            </Link>
          </div>
        </form>
      </div>
    </PublicLayout>
  );
}
