import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { CheckCircle2, Clock, FileText, Users, XCircle } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { adminService } from '../../services/adminService';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDate } from '../../utils/formatters';

export default function AdminOverviewPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService
      .getDashboard()
      .then((res) => setData(res))
      .finally(() => setLoading(false));
  }, []);

  const stats = data?.stats || {};
  const cards = [
    {
      label: 'Total Registered Students',
      value: stats.totalStudents ?? 0,
      icon: Users,
      border: 'border-l-[#0B2C6F]',
      iconBg: 'bg-blue-50 text-[#0B2C6F]',
    },
    {
      label: 'Total Applications',
      value: stats.totalApplications ?? 0,
      icon: FileText,
      border: 'border-l-indigo-600',
      iconBg: 'bg-indigo-50 text-indigo-600',
    },
    {
      label: 'Pending Applications',
      value: stats.pendingApplications ?? 0,
      icon: Clock,
      border: 'border-l-amber-500',
      iconBg: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'Approved Applications',
      value: stats.approvedApplications ?? 0,
      icon: CheckCircle2,
      border: 'border-l-emerald-600',
      iconBg: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Rejected Applications',
      value: stats.rejectedApplications ?? 0,
      icon: XCircle,
      border: 'border-l-red-600',
      iconBg: 'bg-red-50 text-red-600',
    },
  ];

  return (
    <DashboardLayout role="admin" title="Admin Dashboard Overview">
      {loading ? (
        <LoadingSpinner label="Loading administrative analytics..." />
      ) : (
        <div className="space-y-6">
          {/* 5 Summary Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {cards.map((c) => {
              const Icon = c.icon;
              return (
                <div
                  key={c.label}
                  className={`bg-white rounded-lg border border-slate-200 border-l-4 ${c.border} p-4 shadow-xs flex items-center justify-between`}
                >
                  <div>
                    <p className="text-xs font-semibold text-slate-500">{c.label}</p>
                    <p className="text-2xl font-extrabold text-slate-900 mt-1">{c.value}</p>
                  </div>
                  <div
                    className={`h-10 w-10 rounded-full ${c.iconBg} flex items-center justify-center shrink-0`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recharts Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-white rounded-lg border border-[#D4E2F1] p-5 shadow-xs">
              <h3 className="text-base font-bold text-[#0B2C6F] mb-4">
                Monthly Application Statistics
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.monthlyStats || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="approved" name="Approved" fill="#16A34A" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="pending" name="Pending" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="rejected" name="Rejected" fill="#DC2626" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white rounded-lg border border-[#D4E2F1] p-5 shadow-xs">
              <h3 className="text-base font-bold text-[#0B2C6F] mb-4">
                Applications by Status
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={(data?.statusBreakdown || []).filter((s) => s.value > 0)}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={88}
                      paddingAngle={3}
                    >
                      {(data?.statusBreakdown || [])
                        .filter((s) => s.value > 0)
                        .map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recent Applications */}
          <div className="bg-white rounded-lg border border-[#D4E2F1] shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-[#0B2C6F]">
                Recent Student Applications
              </h3>
              <Link
                to="/admin/applications"
                className="text-xs font-bold text-[#F37021] hover:underline"
              >
                Manage All Applications →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b">
                  <tr>
                    <th className="p-3.5 text-left">Application ID</th>
                    <th className="p-3.5 text-left">Student</th>
                    <th className="p-3.5 text-left">Title</th>
                    <th className="p-3.5 text-left">Updated</th>
                    <th className="p-3.5 text-left">Status</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                  {(data?.recentApplications || []).map((app) => (
                    <tr key={app._id} className="hover:bg-slate-50">
                      <td className="p-3.5 font-mono font-bold text-[#0B2C6F]">
                        {app.applicationId}
                      </td>
                      <td className="p-3.5">
                        <p className="font-semibold text-slate-800">
                          {app.student?.name || app.personalDetails?.fullName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {app.student?.enrollmentNumber ||
                            app.personalDetails?.enrollmentNumber}
                        </p>
                      </td>
                      <td className="p-3.5 font-medium text-slate-700">{app.title}</td>
                      <td className="p-3.5 text-slate-500">{formatDate(app.updatedAt)}</td>
                      <td className="p-3.5">
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="p-3.5 text-right">
                        <Link
                          to={`/admin/applications?search=${app.applicationId}`}
                          className="rounded border border-[#0B2C6F]/30 bg-blue-50 px-3 py-1 text-xs font-semibold text-[#0B2C6F] hover:bg-blue-100"
                        >
                          Review
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

