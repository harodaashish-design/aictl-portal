import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Eye,
  FilePlus2,
  GitCommitVertical,
  Pencil,
  Search,
  Send,
  Trash2,
  X,
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { applicationService } from '../../services/studentService';
import { getErrorMessage } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';
import DocumentPreviewModal from '../../components/DocumentPreviewModal';
import { APPLICATION_STATUSES } from '../../utils/constants';
import { formatDate, formatFileSize } from '../../utils/formatters';

export default function StudentApplicationsPage() {
  const [searchParams] = useSearchParams();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const res = await applicationService.getMyApplications({
        status: statusFilter,
        search,
      });
      const list = res.applications || [];
      setApplications(list);

      const viewId = searchParams.get('view');
      if (viewId) {
        const match = list.find((a) => a._id === viewId || a.applicationId === viewId);
        if (match) setSelectedApp(match);
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadApplications();
  };

  const handleSubmitDraft = async (app) => {
    try {
      const res = await applicationService.submitDraft(app._id);
      toast.success(res.message);
      loadApplications();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDeleteDraft = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await applicationService.deleteDraft(deleteTarget._id);
      toast.success('Draft deleted.');
      setDeleteTarget(null);
      loadApplications();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <DashboardLayout role="student" title="My Applications">
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-2 flex-1">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by Application ID or Title..."
                className="w-full rounded border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm focus:border-[#0B2C6F] focus:outline-none"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded border border-slate-300 bg-white px-3 py-2 text-sm focus:border-[#0B2C6F] focus:outline-none"
            >
              <option value="All">All Statuses</option>
              {APPLICATION_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded bg-[#0B2C6F] px-4 py-2 text-sm font-semibold text-white hover:bg-[#071F52]"
            >
              Search
            </button>
          </form>

          <Link to="/student/new-application" className="aicte-btn-orange shrink-0">
            <FilePlus2 className="h-4 w-4" />
            <span>New Application</span>
          </Link>
        </div>

        <div className="bg-white rounded-lg border border-[#D4E2F1] shadow-xs overflow-hidden">
          {loading ? (
            <LoadingSpinner label="Fetching your applications..." />
          ) : applications.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="No applications found"
                description="Create a new application or adjust your status filter."
                action={
                  <Link to="/student/new-application" className="aicte-btn-orange text-xs">
                    Start New Application
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
                    <th className="p-3.5 text-left">Title & Type</th>
                    <th className="p-3.5 text-left">Submission Date</th>
                    <th className="p-3.5 text-left">Status</th>
                    <th className="p-3.5 text-left">Admin Remarks</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                  {applications.map((app) => (
                    <tr key={app._id} className="hover:bg-slate-50/70">
                      <td className="p-3.5 font-mono font-bold text-[#0B2C6F]">
                        {app.applicationId}
                      </td>
                      <td className="p-3.5">
                        <p className="font-semibold text-slate-800">{app.title}</p>
                        <p className="text-xs text-slate-500">{app.applicationType}</p>
                      </td>
                      <td className="p-3.5 text-slate-600">
                        {app.submittedAt ? formatDate(app.submittedAt) : 'Draft'}
                      </td>
                      <td className="p-3.5">
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="p-3.5 text-xs text-slate-600 max-w-xs truncate">
                        {app.adminRemarks || '—'}
                      </td>
                      <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                        {app.status === 'Draft' && (
                          <>
                            <Link
                              to={`/student/new-application?edit=${app._id}`}
                              className="inline-flex items-center gap-1 rounded border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 hover:bg-amber-100"
                            >
                              <Pencil className="h-3 w-3" />
                              <span>Edit</span>
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleSubmitDraft(app)}
                              className="inline-flex items-center gap-1 rounded bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
                            >
                              <Send className="h-3 w-3" />
                              <span>Submit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(app)}
                              className="inline-flex items-center gap-1 rounded border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
                              title="Delete Draft"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </>
                        )}
                        <Link
                          to={`/student/status?id=${app.applicationId}`}
                          className="inline-flex items-center gap-1 rounded border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-[#0B2C6F] hover:bg-blue-100"
                        >
                          <GitCommitVertical className="h-3 w-3" />
                          <span>Track</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => setSelectedApp(app)}
                          className="inline-flex items-center gap-1 rounded border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          <Eye className="h-3 w-3" />
                          <span>View</span>
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

      {/* Application Detail Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4">
          <div className="w-full max-w-3xl max-h-[88vh] overflow-y-auto rounded-lg bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between bg-[#0B2C6F] px-5 py-3.5 text-white">
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
            <div className="p-6 space-y-5 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
                <StatusBadge status={selectedApp.status} />
                <span className="text-xs text-slate-500">
                  Last Updated: {formatDate(selectedApp.updatedAt)}
                </span>
              </div>

              {selectedApp.adminRemarks && (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-3.5 text-xs">
                  <p className="font-bold text-amber-900">Administrative Remarks:</p>
                  <p className="text-amber-800 mt-1">{selectedApp.adminRemarks}</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="rounded border border-slate-200 p-3.5 space-y-1">
                  <p className="font-bold text-[#0B2C6F] mb-1">Personal Details</p>
                  <p>Name: {selectedApp.personalDetails?.fullName}</p>
                  <p>Enrollment: {selectedApp.personalDetails?.enrollmentNumber}</p>
                  <p>Email: {selectedApp.personalDetails?.email}</p>
                  <p>Phone: {selectedApp.personalDetails?.phone}</p>
                  <p>Address: {selectedApp.personalDetails?.address || '—'}</p>
                </div>
                <div className="rounded border border-slate-200 p-3.5 space-y-1">
                  <p className="font-bold text-[#0B2C6F] mb-1">Academic Details</p>
                  <p>College: {selectedApp.academicDetails?.college}</p>
                  <p>University: {selectedApp.academicDetails?.university}</p>
                  <p>
                    Course/Branch: {selectedApp.academicDetails?.course} (
                    {selectedApp.academicDetails?.branch})
                  </p>
                  <p>Academic Year: {selectedApp.academicDetails?.academicYear}</p>
                </div>
              </div>

              <div className="text-xs space-y-1">
                <p className="font-bold text-[#0B2C6F]">Description & Reason</p>
                <p className="text-slate-700">{selectedApp.description || '—'}</p>
                {selectedApp.reason && (
                  <p className="text-slate-500">Reason: {selectedApp.reason}</p>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-[#0B2C6F]">
                  Attached Documents ({selectedApp.documents?.length || 0})
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
                          Preview / Download
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">No documents attached yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Draft Application"
        message={`Are you sure you want to delete draft "${deleteTarget?.title}" (${deleteTarget?.applicationId})? This action cannot be undone.`}
        confirmText="Delete Draft"
        loading={deleting}
        onConfirm={handleDeleteDraft}
        onCancel={() => setDeleteTarget(null)}
      />

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
