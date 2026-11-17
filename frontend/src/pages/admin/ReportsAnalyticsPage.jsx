import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Download, BarChart3 } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { adminService } from '../../services/adminService';
import { getErrorMessage } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function ReportsAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exportStatus, setExportStatus] = useState('All');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    adminService
      .getDashboard()
      .then((res) => setData(res))
      .finally(() => setLoading(false));
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      await adminService.exportCsv(exportStatus);
      toast.success('CSV report downloaded!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setExporting(false);
    }
  };

  const stats = data?.stats || {};

  return (
    <DashboardLayout role="admin" title="Reports and Analytics">
      {loading ? (
        <LoadingSpinner label="Generating portal analytics..." />
      ) : (
        <div className="space-y-6">
          {/* Export Toolbar */}
          <div className="bg-white rounded-lg border border-[#D4E2F1] p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-[#0B2C6F] flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-[#F37021]" />
                <span>Application & Student Statistical Report</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Export live MongoDB/Database records to CSV for faculty or administrative review.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={exportStatus}
                onChange={(e) => setExportStatus(e.target.value)}
                className="rounded border border-slate-300 px-3 py-2 text-xs font-semibold"
              >
                <option value="All">All Applications</option>
                <option value="Submitted">Submitted Only</option>
                <option value="Under Review">Under Review Only</option>
                <option value="Approved">Approved Only</option>
                <option value="Rejected">Rejected Only</option>
              </select>
              <button
                type="button"
                disabled={exporting}
                onClick={handleExport}
                className="aicte-btn-orange text-xs"
              >
                <Download className="h-4 w-4" />
                <span>{exporting ? 'Exporting...' : 'Export CSV Report'}</span>
              </button>
            </div>
          </div>

          {/* Summary Table */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="bg-white rounded-lg border border-slate-200 p-4 text-center">
              <p className="text-xs text-slate-500">Total Students</p>
              <p className="text-2xl font-extrabold text-[#0B2C6F] mt-1">
                {stats.totalStudents ?? 0}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-4 text-center">
              <p className="text-xs text-slate-500">Total Applications</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">
                {stats.totalApplications ?? 0}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-4 text-center">
              <p className="text-xs text-slate-500">Approved</p>
              <p className="text-2xl font-extrabold text-emerald-600 mt-1">
                {stats.approvedApplications ?? 0}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-4 text-center">
              <p className="text-xs text-slate-500">Rejected</p>
              <p className="text-2xl font-extrabold text-red-600 mt-1">
                {stats.rejectedApplications ?? 0}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-4 text-center">
              <p className="text-xs text-slate-500">Pending Review</p>
              <p className="text-2xl font-extrabold text-amber-600 mt-1">
                {stats.pendingApplications ?? 0}
              </p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-[#D4E2F1] p-5 shadow-xs">
              <h3 className="text-sm font-bold text-[#0B2C6F] mb-4">
                Applications Submitted by Month
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.monthlyStats || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total" name="Total" fill="#0B2C6F" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="approved" name="Approved" fill="#16A34A" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="rejected" name="Rejected" fill="#DC2626" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-[#D4E2F1] p-5 shadow-xs">
              <h3 className="text-sm font-bold text-[#0B2C6F] mb-4">
                Applications by Category / Type
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.typeBreakdown || []} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                    <YAxis
                      type="category"
                      dataKey="type"
                      width={150}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip />
                    <Bar dataKey="count" name="Applications" fill="#F37021" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

