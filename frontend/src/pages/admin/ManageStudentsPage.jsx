import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Eye, Search, UserCheck, UserX, X } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { adminService } from '../../services/adminService';
import { getErrorMessage } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';
import StatusBadge from '../../components/StatusBadge';
import { formatDate } from '../../utils/formatters';

export default function ManageStudentsPage() {
  const [students, setStudents] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [search, setSearch] = useState('');
  const [college, setCollege] = useState('All');
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentApps, setStudentApps] = useState([]);
  const [toggleTarget, setToggleTarget] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const res = await adminService.getStudents({ search, college });
      setStudents(res.students || []);
      setColleges(res.colleges || []);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [college]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadStudents();
  };

  const openProfile = async (student) => {
    try {
      const res = await adminService.getStudentDetails(student._id);
      setSelectedStudent(res.student);
      setStudentApps(res.applications || []);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const confirmToggleStatus = async () => {
    if (!toggleTarget) return;
    setUpdatingStatus(true);
    try {
      const res = await adminService.toggleStudentStatus(
        toggleTarget._id,
        !toggleTarget.isActive
      );
      toast.success(res.message);
      setToggleTarget(null);
      loadStudents();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <DashboardLayout role="admin" title="Manage Students">
      <div className="space-y-5">
        <form
          onSubmit={handleSearch}
          className="bg-white rounded-lg border border-[#D4E2F1] p-4 flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Student Name, Enrollment Number, or Email..."
              className="w-full rounded border border-slate-300 pl-9 pr-3 py-2 text-sm focus:border-[#0B2C6F] focus:outline-none"
            />
          </div>
          <select
            value={college}
            onChange={(e) => setCollege(e.target.value)}
            className="rounded border border-slate-300 px-3 py-2 text-sm focus:border-[#0B2C6F] focus:outline-none sm:max-w-xs"
          >
            <option value="All">All Colleges</option>
            {colleges.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded bg-[#0B2C6F] px-5 py-2 text-sm font-semibold text-white hover:bg-[#071F52]"
          >
            Search
          </button>
        </form>

        <div className="bg-white rounded-lg border border-[#D4E2F1] shadow-xs overflow-hidden">
          {loading ? (
            <LoadingSpinner label="Loading registered students..." />
          ) : students.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="No students found"
                description="No registered students match your search or college filter."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b">
                  <tr>
                    <th className="p-3.5 text-left">Student Name & Email</th>
                    <th className="p-3.5 text-left">Enrollment No.</th>
                    <th className="p-3.5 text-left">College / Course</th>
                    <th className="p-3.5 text-left">Apps</th>
                    <th className="p-3.5 text-left">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                  {students.map((st) => (
                    <tr key={st._id} className="hover:bg-slate-50">
                      <td className="p-3.5">
                        <p className="font-bold text-slate-900">{st.name}</p>
                        <p className="text-xs text-slate-500">{st.email}</p>
                      </td>
                      <td className="p-3.5 font-mono font-semibold text-[#0B2C6F]">
                        {st.enrollmentNumber}
                      </td>
                      <td className="p-3.5">
                        <p className="font-medium text-slate-800">{st.college}</p>
                        <p className="text-xs text-slate-500">
                          {st.course} • {st.branch}
                        </p>
                      </td>
                      <td className="p-3.5 font-bold text-slate-700">{st.applicationCount}</td>
                      <td className="p-3.5">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            st.isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {st.isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => openProfile(st)}
                          className="inline-flex items-center gap-1 rounded border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-[#0B2C6F] hover:bg-blue-100"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Profile</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setToggleTarget(st)}
                          className={`inline-flex items-center gap-1 rounded px-2.5 py-1 text-xs font-semibold ${
                            st.isActive
                              ? 'border border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                              : 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {st.isActive ? (
                            <>
                              <UserX className="h-3.5 w-3.5" />
                              <span>Deactivate</span>
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-3.5 w-3.5" />
                              <span>Activate</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Student Profile Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4">
          <div className="w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-lg bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between bg-[#0B2C6F] px-5 py-3.5 text-white">
              <h3 className="text-base font-bold">Student Profile — {selectedStudent.name}</h3>
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="rounded p-1 hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-5 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded border border-slate-200 p-4">
                <p>
                  <strong>Name:</strong> {selectedStudent.name}
                </p>
                <p>
                  <strong>Enrollment:</strong> {selectedStudent.enrollmentNumber}
                </p>
                <p>
                  <strong>Email:</strong> {selectedStudent.email}
                </p>
                <p>
                  <strong>Mobile:</strong> {selectedStudent.phone}
                </p>
                <p className="sm:col-span-2">
                  <strong>College:</strong> {selectedStudent.college}
                </p>
                <p className="sm:col-span-2">
                  <strong>University:</strong> {selectedStudent.university}
                </p>
                <p>
                  <strong>Course:</strong> {selectedStudent.course}
                </p>
                <p>
                  <strong>Branch:</strong> {selectedStudent.branch}
                </p>
                <p>
                  <strong>Academic Year:</strong> {selectedStudent.academicYear}
                </p>
                <p>
                  <strong>Registered:</strong> {formatDate(selectedStudent.createdAt)}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-[#0B2C6F] mb-2">
                  Student Applications ({studentApps.length})
                </h4>
                {studentApps.length === 0 ? (
                  <p className="text-xs text-slate-500">No applications created yet.</p>
                ) : (
                  <div className="divide-y divide-slate-100 rounded border border-slate-200">
                    {studentApps.map((a) => (
                      <div key={a._id} className="p-3 flex items-center justify-between gap-2">
                        <div>
                          <p className="font-mono text-xs font-bold text-[#0B2C6F]">
                            {a.applicationId}
                          </p>
                          <p className="text-xs font-semibold text-slate-800">{a.title}</p>
                        </div>
                        <StatusBadge status={a.status} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(toggleTarget)}
        title={toggleTarget?.isActive ? 'Deactivate Student Account' : 'Activate Student Account'}
        message={`Are you sure you want to ${
          toggleTarget?.isActive ? 'deactivate' : 'activate'
        } ${toggleTarget?.name}'s portal account?`}
        confirmText={toggleTarget?.isActive ? 'Deactivate' : 'Activate'}
        variant={toggleTarget?.isActive ? 'danger' : 'primary'}
        loading={updatingStatus}
        onConfirm={confirmToggleStatus}
        onCancel={() => setToggleTarget(null)}
      />
    </DashboardLayout>
  );
}

