import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Eye, EyeOff, UserPlus, ArrowLeft } from 'lucide-react';
import PublicLayout from '../layouts/PublicLayout';
import { authService } from '../services/authService';
import { getErrorMessage } from '../services/api';
import { ACADEMIC_YEARS, COURSES } from '../utils/constants';

export default function StudentSignupPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      academicYear: '2026-27',
      course: 'B.Tech',
    },
  });

  const passwordVal = watch('password');

  const onSubmit = async (values) => {
    try {
      const res = await authService.registerStudent(values);
      toast.success(res.message || 'Registration successful! Please log in.');
      navigate('/login', { state: { registeredEmail: values.email } });
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <PublicLayout>
      <div className="aicte-sky-hero border-b border-sky-200 py-7 px-4">
        <div className="max-w-3xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#0B2C6F] hover:underline mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to AICTE Homepage
          </Link>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B2C6F]">
            Student Portal Registration
          </h2>
          <p className="text-sm text-slate-700 mt-1">
            Create your student account for Academic Year 2026–27 to submit applications, upload
            documents, and track approval status.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-lg border border-[#D4E2F1] shadow-sm p-6 sm:p-8 space-y-5"
        >
          <div className="border-b border-slate-200 pb-3">
            <h3 className="text-base font-bold text-[#0B2C6F]">Student Academic & Account Details</h3>
            <p className="text-xs text-slate-500">All fields marked with * are mandatory.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                {...register('name', {
                  required: 'Full Name is required',
                  minLength: { value: 2, message: 'Enter at least 2 characters' },
                })}
                placeholder="e.g. Aarav Sharma"
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-[#0B2C6F] focus:outline-none"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                {...register('email', {
                  required: 'Email address is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Enter a valid email address',
                  },
                })}
                placeholder="student@college.edu"
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-[#0B2C6F] focus:outline-none"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mobile Number *
              </label>
              <input
                type="tel"
                {...register('phone', {
                  required: 'Mobile number is required',
                  pattern: {
                    value: /^[6-9]\d{9}$/,
                    message: 'Enter a valid 10-digit Indian mobile number',
                  },
                })}
                placeholder="9876543210"
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-[#0B2C6F] focus:outline-none"
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>
              )}
            </div>

            {/* Enrollment Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Enrollment Number *
              </label>
              <input
                type="text"
                {...register('enrollmentNumber', {
                  required: 'Enrollment number is required',
                  minLength: { value: 4, message: 'Enrollment number too short' },
                })}
                placeholder="e.g. AICTE2026CS1042"
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm uppercase focus:border-[#0B2C6F] focus:outline-none"
              />
              {errors.enrollmentNumber && (
                <p className="mt-1 text-xs text-red-600">{errors.enrollmentNumber.message}</p>
              )}
            </div>

            {/* College Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                College / Institution Name *
              </label>
              <input
                type="text"
                {...register('college', { required: 'College/Institution name is required' })}
                placeholder="e.g. Delhi Technological Institute of Engineering"
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-[#0B2C6F] focus:outline-none"
              />
              {errors.college && (
                <p className="mt-1 text-xs text-red-600">{errors.college.message}</p>
              )}
            </div>

            {/* University Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                University Name *
              </label>
              <input
                type="text"
                {...register('university', { required: 'University name is required' })}
                placeholder="e.g. Guru Gobind Singh Indraprastha University"
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-[#0B2C6F] focus:outline-none"
              />
              {errors.university && (
                <p className="mt-1 text-xs text-red-600">{errors.university.message}</p>
              )}
            </div>

            {/* Course */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Course *</label>
              <select
                {...register('course', { required: 'Course is required' })}
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-[#0B2C6F] focus:outline-none"
              >
                {COURSES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Branch */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Branch / Specialization *
              </label>
              <input
                type="text"
                {...register('branch', { required: 'Branch/Specialization is required' })}
                placeholder="e.g. Computer Science & Engineering"
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-[#0B2C6F] focus:outline-none"
              />
              {errors.branch && (
                <p className="mt-1 text-xs text-red-600">{errors.branch.message}</p>
              )}
            </div>

            {/* Academic Year */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Current Academic Year *
              </label>
              <select
                {...register('academicYear', { required: 'Academic year is required' })}
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-[#0B2C6F] focus:outline-none"
              >
                {ACADEMIC_YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div className="hidden sm:block" />

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Minimum 6 characters required' },
                  })}
                  placeholder="Min. 6 characters"
                  className="w-full rounded border border-slate-300 px-3 py-2 pr-10 text-sm focus:border-[#0B2C6F] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (val) => val === passwordVal || 'Passwords do not match',
                  })}
                  placeholder="Re-enter password"
                  className="w-full rounded border border-slate-300 px-3 py-2 pr-10 text-sm focus:border-[#0B2C6F] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((p) => !p)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs text-slate-600">
              Already registered?{' '}
              <Link to="/login" className="font-bold text-[#0B2C6F] hover:underline">
                Student Login here
              </Link>
            </p>
            <button
              type="submit"
              disabled={isSubmitting}
              className="aicte-btn-orange py-2.5 px-7 disabled:opacity-60"
            >
              <UserPlus className="h-4 w-4" />
              <span>{isSubmitting ? 'Creating Account...' : 'Register Student Account'}</span>
            </button>
          </div>
        </form>
      </div>
    </PublicLayout>
  );
}
