import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Eye, EyeOff, LogIn, ShieldCheck } from 'lucide-react';
import PublicLayout from '../layouts/PublicLayout';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';

export default function StudentLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { persistAuth } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const prefillEmail = location.state?.registeredEmail || '';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      identifier: prefillEmail,
      password: '',
    },
  });

  const onSubmit = async (values) => {
    try {
      const res = await authService.login({
        identifier: values.identifier,
        password: values.password,
        portalType: 'student',
      });
      persistAuth(res.token, res.user, rememberMe);
      toast.success(`Welcome back, ${res.user.name}!`);
      navigate('/student/dashboard', { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <PublicLayout>
      <div className="aicte-sky-hero border-b border-sky-200 py-8 px-4">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B2C6F]">
            Student Portal Login
          </h2>
          <p className="text-sm text-slate-700 mt-1">
            Sign in using your registered Email Address or Enrollment Number.
          </p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-10">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-lg border border-[#D4E2F1] shadow-sm p-6 sm:p-7 space-y-5"
        >
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email or Enrollment Number *
            </label>
            <input
              type="text"
              {...register('identifier', {
                required: 'Email or Enrollment Number is required',
              })}
              placeholder="student@aicte-demo.edu or AICTE2026CS1042"
              className="w-full rounded border border-slate-300 px-3 py-2.5 text-sm focus:border-[#0B2C6F] focus:outline-none"
            />
            {errors.identifier && (
              <p className="mt-1 text-xs text-red-600">{errors.identifier.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password', { required: 'Password is required' })}
                placeholder="Enter your password"
                className="w-full rounded border border-slate-300 px-3 py-2.5 pr-10 text-sm focus:border-[#0B2C6F] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="inline-flex items-center gap-2 text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-300 text-[#0B2C6F] focus:ring-[#0B2C6F]"
              />
              <span>Remember me</span>
            </label>
            <Link
              to="/forgot-password"
              className="font-semibold text-[#0B2C6F] hover:text-[#F37021] hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="aicte-btn-orange w-full py-2.5 disabled:opacity-60"
          >
            <LogIn className="h-4 w-4" />
            <span>{isSubmitting ? 'Signing In...' : 'Sign In to Student Dashboard'}</span>
          </button>

          <div className="border-t border-slate-200 pt-4 space-y-2 text-center text-xs text-slate-600">
            <p>
              New to the portal?{' '}
              <Link to="/register" className="font-bold text-[#0B2C6F] hover:underline">
                Create Student Account
              </Link>
            </p>
            <p>
              <Link
                to="/admin/login"
                className="inline-flex items-center gap-1 font-semibold text-slate-500 hover:text-[#0B2C6F]"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Administrator Login Portal →</span>
              </Link>
            </p>
          </div>
        </form>
      </div>
    </PublicLayout>
  );
}
