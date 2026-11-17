import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  Eye,
  FilePlus2,
  FileText,
  GraduationCap,
  XCircle,
  GitCommitVertical,
  Pencil,
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { studentService } from '../../services/studentService';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { formatDate } from '../../utils/formatters';

export default function StudentOverviewPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentService
      .getDashboard()
      .then((res) => setData(res))
      .finally(() => setLoading(false));
  }, []);

  const stats = data?.stats || {};
  const student = data?.student || {};
  const recent = data?.recentApplications || [];

  const cards = [
    {
      label: 'Total Applications',
      value: stats.totalApplications ?? 0,
      icon: FileText,
      accent: 'border-l-[#0B2C6F] text-[#0B2C6F]',
      bg: 'bg-blue-50',
    },
    {
      label: 'Pending Applications',
      value: stats.pendingApplications ?? 0,
      icon: Clock,
      accent: 'border-l-amber-500 text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Approved Applications',
      value: stats.approvedApplications ?? 0,
      icon: CheckCircle2,
      accent: 'border-l-emerald-600 text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Rejected Applications',
      value: stats.rejectedApplications ?? 0,
      icon: XCircle,
      accent: 'border-l-red-600 text-red-600',
      bg: 'bg-red-50',
    },
  ];

  return (
    <DashboardLayout role="student" title={student.name ? `Welcome back, ${student.name}` : 'Student Dashboard'}>
      {loading ? (
        <LoadingSpinner label="Loading your dashboard..." />
      ) : (
        <div className="space-y-6">
          {/* Welcome Banner */}
          <div className="bg-white rounded-lg border border-[#D4E2F1] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div>
              <h2 className="text-xl font-extrabold text-[#0B2C6F]">
                Welcome back, {student.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                Manage your AICTE applications, upload documents, and track real-time verification
                updates.
              </p>
            </div>
            <Link to="/student/new-application" className="aicte-btn-orange shrink-0">
              <FilePlus2 className="h-4 w-4" />
              <span>New Application</span>
            </Link>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((c) => {
              const Icon = c.icon;
              return (
                <div
                  key={c.label}
                  className={`bg-white rounded-lg border border-slate-200 border-l-4 ${c.accent} p-4 shadow-xs flex items-center justify-between`}
                >
                  <div>
                    <p className="text-xs font-semibold text-slate-500">{c.label}</p>
                    <p className="text-2xl font-extrabold text-slate-900 mt-1">{c.value}</p>
                  </div>
                  <div className={`h-10 w-10 rounded-full ${c.bg} flex items-center justify-center`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Student Profile Snapshot */}
          <div className="bg-white rounded-lg border border-[#D4E2F1] p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-[#0B2C6F] flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-[#F37021]" />
                <span>Registered Academic Details</span>
              </h3>
              <Link
                to="/student/profile"
                className="text-xs font-bold text-[#0B2C6F] hover:text-[#F37021] hover:underline"
              >
                Edit Profile →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs sm:text-sm">
              <div>
                <p className="text-slate-400 font-medium text-xs">Full Name</p>
                <p className="font-bold text-slate-800">{student.name}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium text-xs">Enrollment Number</p>
                <p className="font-mono font-bold text-[#0B2C6F]">{student.enrollmentNumber}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-slate-400 font-medium text-xs">College / Institution</p>
                <p className="font-semibold text-slate-800">{student.college || '—'}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium text-xs">Course</p>
                <p className="font-semibold text-slate-800">{student.course || '—'}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium text-xs">Branch / Specialization</p>
                <p className="font-semibold text-slate-800">{student.branch || '—'}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium text-xs">Academic Year</p>
                <p className="font-semibold text-slate-800">{student.academicYear || '2026-27'}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium text-xs">Registration Date</p>
                <p className="font-semibold text-slate-800">{formatDate(student.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Recent Applications Table */}
          <div className="bg-white rounded-lg border border-[#D4E2F1] shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-[#0B2C6F]">Recent Applications</h3>
              <Link
                to="/student/applications"
                className="text-xs font-bold text-[#F37021] hover:underline"
              >
                View All Applications →
              </Link>
            </div>

            {recent.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  title="No applications yet"
                  description="Start your first application for scholarships, verification NOC, or credit equivalence."
                  action={
                    <Link to="/student/new-application" className="aicte-btn-orange text-xs">
                      Create New Application
                    </Link>
                  }
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b">
                    <tr>
                      <th className="p-3.5 text-left">Application ID</th>
                      <th className="p-3.5 text-left">Application Title</th>
                      <th className="p-3.5 text-left">Submission Date</th>
                      <th className="p-3.5 text-left">Status</th>
                      <th className="p-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                    {recent.map((app) => (
                      <tr key={app._id} className="hover:bg-slate-50/70">
                        <td className="p-3.5 font-mono font-bold text-[#0B2C6F]">
                          {app.applicationId}
                        </td>
                        <td className="p-3.5">
                          <p className="font-semibold text-slate-800">{app.title}</p>
                          <p className="text-xs text-slate-500">{app.applicationType}</p>
                        </td>
                        <td className="p-3.5 text-slate-600">
                          {app.submittedAt ? formatDate(app.submittedAt) : 'Not submitted (Draft)'}
                        </td>
                        <td className="p-3.5">
                          <StatusBadge status={app.status} />
                        </td>
                        <td className="p-3.5 text-right space-x-2 whitespace-nowrap">
                          {app.status === 'Draft' && (
                            <Link
                              to={`/student/new-application?edit=${app._id}`}
                              className="inline-flex items-center gap-1 rounded border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 hover:bg-amber-100"
                            >
                              <Pencil className="h-3 w-3" />
                              <span>Edit Draft</span>
                            </Link>
                          )}
                          <Link
                            to={`/student/status?id=${app.applicationId}`}
                            className="inline-flex items-center gap-1 rounded border border-[#0B2C6F]/30 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-[#0B2C6F] hover:bg-blue-100"
                          >
                            <GitCommitVertical className="h-3 w-3" />
                            <span>Track</span>
                          </Link>
                          <Link
                            to={`/student/applications?view=${app._id}`}
                            className="inline-flex items-center gap-1 rounded border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                          >
                            <Eye className="h-3 w-3" />
                            <span>Details</span>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
