import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Download, Eye, FileText, FolderUp, Trash2 } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { applicationService } from '../../services/studentService';
import { getErrorMessage } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import DocumentPreviewModal from '../../components/DocumentPreviewModal';
import { formatDate, formatFileSize } from '../../utils/formatters';

export default function StudentDocumentsPage() {
  const [applications, setApplications] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [selectedAppId, setSelectedAppId] = useState('');
  const [docType, setDocType] = useState('Student ID Card');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [previewDoc, setPreviewDoc] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [appsRes, docsRes] = await Promise.all([
        applicationService.getMyApplications({}),
        applicationService.getMyDocuments(),
      ]);
      const apps = appsRes.applications || [];
      setApplications(apps);
      setDocuments(docsRes.documents || []);
      if (apps.length > 0 && !selectedAppId) {
        setSelectedAppId(apps[0]._id);
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedAppId) {
      toast.error('Please select an application first.');
      return;
    }
    if (!file) {
      toast.error('Please choose a PDF, JPG, or PNG file.');
      return;
    }
    const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowed.includes(file.type)) {
      toast.error('Invalid file type. Only PDF, JPG, and PNG are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File exceeds 5 MB limit.');
      return;
    }

    setUploading(true);
    try {
      await applicationService.uploadDocument(selectedAppId, file, docType);
      toast.success('Document uploaded and linked successfully!');
      setFile(null);
      e.target.reset();
      loadData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (doc) => {
    try {
      await applicationService.deleteDocument(doc.applicationMongoId, doc.filename);
      toast.success('Document removed.');
      loadData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <DashboardLayout role="student" title="Upload & Manage Documents">
      <div className="space-y-6">
        {/* Upload Form */}
        <form
          onSubmit={handleUpload}
          className="bg-white rounded-lg border border-[#D4E2F1] p-6 shadow-xs space-y-4"
        >
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-[#0B2C6F] flex items-center gap-2">
              <FolderUp className="h-5 w-5 text-[#F37021]" />
              <span>Upload Supporting Document</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Accepted formats: PDF, JPG, PNG • Maximum file size: 5 MB
            </p>
          </div>

          {applications.length === 0 ? (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-3">
              Please create an application or draft first before uploading documents.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Link to Application *
                </label>
                <select
                  value={selectedAppId}
                  onChange={(e) => setSelectedAppId(e.target.value)}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                >
                  {applications.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.applicationId} — {a.title.slice(0, 32)} ({a.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Document Type *
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                >
                  <option>Student ID Card</option>
                  <option>College ID</option>
                  <option>Academic Marksheet</option>
                  <option>Supporting Documents</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Choose File (PDF/JPG/PNG) *
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full rounded border border-slate-300 px-2.5 py-1.5 text-xs bg-slate-50"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={uploading || applications.length === 0}
              className="aicte-btn-orange disabled:opacity-60"
            >
              <FolderUp className="h-4 w-4" />
              <span>{uploading ? 'Uploading...' : 'Upload Document'}</span>
            </button>
          </div>
        </form>

        {/* Uploaded Documents Table */}
        <div className="bg-white rounded-lg border border-[#D4E2F1] shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-[#0B2C6F]">
              My Uploaded Documents ({documents.length})
            </h3>
          </div>

          {loading ? (
            <LoadingSpinner label="Loading uploaded documents..." />
          ) : documents.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="No documents uploaded yet"
                description="Use the upload form above to attach Student ID, College ID, Marksheets, or supporting files."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b">
                  <tr>
                    <th className="p-3.5 text-left">File Name</th>
                    <th className="p-3.5 text-left">Document Type</th>
                    <th className="p-3.5 text-left">Application</th>
                    <th className="p-3.5 text-left">Size</th>
                    <th className="p-3.5 text-left">Uploaded</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                  {documents.map((doc) => (
                    <tr key={`${doc.applicationMongoId}-${doc.filename}`} className="hover:bg-slate-50">
                      <td className="p-3.5 font-semibold text-slate-800 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-[#0B2C6F] shrink-0" />
                        <span className="truncate max-w-[200px]">{doc.originalName}</span>
                      </td>
                      <td className="p-3.5 text-slate-700">{doc.docType}</td>
                      <td className="p-3.5 font-mono text-xs text-[#0B2C6F]">
                        {doc.applicationId} ({doc.applicationStatus})
                      </td>
                      <td className="p-3.5 text-slate-600">{formatFileSize(doc.size)}</td>
                      <td className="p-3.5 text-slate-500">{formatDate(doc.uploadedAt)}</td>
                      <td className="p-3.5 text-right space-x-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewDoc({ doc, applicationMongoId: doc.applicationMongoId })
                          }
                          className="inline-flex items-center gap-1 rounded border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-[#0B2C6F] hover:bg-blue-100"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Preview</span>
                        </button>
                        <a
                          href={applicationService.getDocumentAccessUrl(
                            doc.applicationMongoId,
                            doc.filename,
                            true
                          )}
                          className="inline-flex items-center gap-1 rounded border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>Download</span>
                        </a>
                        {doc.applicationStatus === 'Draft' && (
                          <button
                            type="button"
                            onClick={() => handleDelete(doc)}
                            className="inline-flex items-center gap-1 rounded border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
                            title="Delete from draft"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

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
