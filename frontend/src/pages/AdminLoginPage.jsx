import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react';
import PublicLayout from '../layouts/PublicLayout';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { persistAuth } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (values) => {
    try {
      const res = await authService.login({
        identifier: values.identifier,
        password: values.password,
        portalType: 'admin',
      });
      persistAuth(res.token, res.user, true);
      toast.success(`Authenticated as ${res.user.name}`);
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <PublicLayout>
      <div className="bg-[#0B2C6F] text-white py-8 px-4 border-b-4 border-[#F37021]">
        <div className="max-w-md mx-auto text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 border border-white/20">
            <ShieldCheck className="h-6 w-6 text-[#F37021]" />
          </div>
          <h2 className="text-2xl font-extrabold">Administrator Control Panel</h2>
          <p className="text-xs sm:text-sm text-blue-200 mt-1">
            Restricted access for authorized AICTE Approval Bureau Officers & Admins.
          </p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-10">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 sm:p-7 space-y-5"
        >
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Administrator Email / ID *
            </label>
            <input
              type="text"
              {...register('identifier', { required: 'Administrator email is required' })}
              placeholder="Enter admin email"
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
                placeholder="Enter admin password"
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

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#0B2C6F] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#071F52] transition disabled:opacity-60"
          >
            <Lock className="h-4 w-4" />
            <span>{isSubmitting ? 'Verifying Credentials...' : 'Sign In to Admin Dashboard'}</span>
          </button>

          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
            <Link to="/login" className="font-semibold text-[#0B2C6F] hover:underline">
              ← Return to Student Login
            </Link>
          </div>
        </form>
      </div>
    </PublicLayout>
  );
}
