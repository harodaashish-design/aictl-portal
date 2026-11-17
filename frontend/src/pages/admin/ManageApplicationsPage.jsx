import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CheckCircle2, Clock, Eye, Search, X, XCircle } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { adminService } from '../../services/adminService';
import { getErrorMessage } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import DocumentPreviewModal from '../../components/DocumentPreviewModal';
import { formatDate, formatFileSize } from '../../utils/formatters';

export default function ManageApplicationsPage({
  defaultStatus = 'All',
  pageTitle = 'Manage Applications',
}) {
  const [searchParams] = useSearchParams();
  const [applications, setApplications] = useState([]);
  const [statusFilter, setStatusFilter] = useState(defaultStatus);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [savingAction, setSavingAction] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);

  useEffect(() => {
    setStatusFilter(defaultStatus);
  }, [defaultStatus]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const res = await adminService.getApplications({
        status: statusFilter,
        search,
      });
      setApplications(res.applications || []);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadApplications();
  };

  const openModal = (app) => {
    setSelectedApp(app);
    setRemarks(app.adminRemarks || '');
  };

  const handleStatusUpdate = async (nextStatus) => {
    if (!selectedApp) return;
    if (nextStatus === 'Rejected' && !remarks.trim()) {
      toast.error('Please enter administrative remarks explaining the rejection reason.');
      return;
    }

    setSavingAction(true);
    try {
      const res = await adminService.updateApplicationStatus(selectedApp._id, {
        status: nextStatus,
        adminRemarks: remarks,
      });
      toast.success(res.message);
      setSelectedApp(null);
      loadApplications();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingAction(false);
    }
  };

  return (
    <DashboardLayout role="admin" title={pageTitle}>
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
              placeholder="Search by Application ID, Title, Student Name or Enrollment..."
              className="w-full rounded border border-slate-300 pl-9 pr-3 py-2 text-sm focus:border-[#0B2C6F] focus:outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded border border-slate-300 px-3 py-2 text-sm focus:border-[#0B2C6F] focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending (Submitted + Under Review)</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Draft">Draft</option>
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
            <LoadingSpinner label="Loading student applications..." />
          ) : applications.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="No applications match this filter"
                description="Try switching status filter or clearing your search query."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b">
                  <tr>
                    <th className="p-3.5 text-left">Application ID</th>
                    <th className="p-3.5 text-left">Student Details</th>
                    <th className="p-3.5 text-left">Application Title</th>
                    <th className="p-3.5 text-left">Submitted</th>
                    <th className="p-3.5 text-left">Status</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                  {applications.map((app) => (
                    <tr key={app._id} className="hover:bg-slate-50">
                      <td className="p-3.5 font-mono font-bold text-[#0B2C6F]">
                        {app.applicationId}
                      </td>
                      <td className="p-3.5">
                        <p className="font-bold text-slate-900">
                          {app.student?.name || app.personalDetails?.fullName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {app.student?.enrollmentNumber ||
                            app.personalDetails?.enrollmentNumber}
                        </p>
                      </td>
                      <td className="p-3.5">
                        <p className="font-semibold text-slate-800">{app.title}</p>
                        <p className="text-xs text-slate-500">{app.applicationType}</p>
                      </td>
                      <td className="p-3.5 text-slate-500">
                        {app.submittedAt ? formatDate(app.submittedAt) : 'Draft'}
                      </td>
                      <td className="p-3.5">
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => openModal(app)}
                          className="inline-flex items-center gap-1 rounded bg-[#0B2C6F] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#071F52]"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Inspect & Decide</span>
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

      {/* Admin Application Review Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between bg-[#0B2C6F] px-5 py-3.5 text-white z-10">
              <div>
                <p className="text-xs font-mono text-blue-200">{selectedApp.applicationId}</p>
                <h3 className="text-base font-bold">{selectedApp.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="rounded p-1 hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs sm:text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
                <StatusBadge status={selectedApp.status} />
                <span className="text-xs text-slate-500">
                  Submitted: {selectedApp.submittedAt ? formatDate(selectedApp.submittedAt) : 'Draft'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="rounded border border-slate-200 p-3.5 space-y-1">
                  <p className="font-bold text-[#0B2C6F] mb-1">Student Personal Details</p>
                  <p>Name: {selectedApp.personalDetails?.fullName}</p>
                  <p>Enrollment: {selectedApp.personalDetails?.enrollmentNumber}</p>
                  <p>Email: {selectedApp.personalDetails?.email}</p>
                  <p>Phone: {selectedApp.personalDetails?.phone}</p>
                  <p>DOB / Gender: {selectedApp.personalDetails?.dateOfBirth || '—'} / {selectedApp.personalDetails?.gender || '—'}</p>
                </div>
                <div className="rounded border border-slate-200 p-3.5 space-y-1">
                  <p className="font-bold text-[#0B2C6F] mb-1">Academic Details</p>
                  <p>College: {selectedApp.academicDetails?.college}</p>
                  <p>University: {selectedApp.academicDetails?.university}</p>
                  <p>Course: {selectedApp.academicDetails?.course}</p>
                  <p>Branch: {selectedApp.academicDetails?.branch}</p>
                  <p>Year / Sem: {selectedApp.academicDetails?.academicYear} ({selectedApp.academicDetails?.semester || '—'})</p>
                </div>
              </div>

              <div className="rounded border border-slate-200 p-3.5 text-xs space-y-1">
                <p className="font-bold text-[#0B2C6F]">Application Description & Reason</p>
                <p className="text-slate-700">{selectedApp.description || '—'}</p>
                {selectedApp.reason && (
                  <p className="text-slate-500">
                    <strong>Reason:</strong> {selectedApp.reason}
                  </p>
                )}
              </div>

              {/* Uploaded Documents */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-[#0B2C6F]">
                  Uploaded Documents ({selectedApp.documents?.length || 0})
                </p>
                {selectedApp.documents?.length > 0 ? (
                  <div className="divide-y divide-slate-100 rounded border border-slate-200">
                    {selectedApp.documents.map((doc) => (
                      <div
                        key={doc.filename}
                        className="p-2.5 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-semibold text-slate-800">{doc.originalName}</p>
                          <p className="text-slate-500">
                            {doc.docType} • {formatFileSize(doc.size)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewDoc({ doc, applicationMongoId: selectedApp._id })
                          }
                          className="rounded bg-blue-50 px-3 py-1 font-semibold text-[#0B2C6F] hover:bg-blue-100"
                        >
                          View / Download
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">No documents attached.</p>
                )}
              </div>

              {/* Administrative Action Section */}
              {selectedApp.status === 'Draft' ? (
                <div className="rounded bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
                  This application is still a Draft and has not been submitted by the student yet.
                </div>
              ) : (
                <div className="border-t border-slate-200 pt-4 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-[#0B2C6F] mb-1">
                      Administrative Remarks (Required for Rejection)
                    </label>
                    <textarea
                      rows={3}
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Enter official scrutiny remarks for the student..."
                      className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-[#0B2C6F] focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-wrap justify-end gap-2.5">
                    <button
                      type="button"
                      disabled={savingAction}
                      onClick={() => handleStatusUpdate('Under Review')}
                      className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-4 py-2 text-xs font-bold text-white hover:bg-amber-600 disabled:opacity-60"
                    >
                      <Clock className="h-4 w-4" />
                      <span>Mark Under Review</span>
                    </button>
                    <button
                      type="button"
                      disabled={savingAction}
                      onClick={() => handleStatusUpdate('Rejected')}
                      className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-60"
                    >
                      <XCircle className="h-4 w-4" />
                      <span>Reject Application</span>
                    </button>
                    <button
                      type="button"
                      disabled={savingAction}
                      onClick={() => handleStatusUpdate('Approved')}
                      className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Approve Application</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {previewDoc && (
        <DocumentPreviewModal
          doc={previewDoc.doc}
          applicationMongoId={previewDoc.applicationMongoId}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </DashboardLayout>
  );
}

