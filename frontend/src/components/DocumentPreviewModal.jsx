import { Download, ExternalLink, X } from 'lucide-react';
import { applicationService } from '../services/studentService';

export default function DocumentPreviewModal({ doc, applicationMongoId, onClose }) {
  if (!doc) return null;

  const previewUrl = applicationService.getDocumentAccessUrl(
    applicationMongoId,
    doc.filename,
    false
  );
  const downloadUrl = applicationService.getDocumentAccessUrl(
    applicationMongoId,
    doc.filename,
    true
  );

  const isPdf = doc.mimeType === 'application/pdf' || doc.filename?.toLowerCase().endsWith('.pdf');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/65 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-4xl rounded-lg bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between bg-[#0B2C6F] px-5 py-3 text-white">
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-bold truncate">{doc.originalName}</h3>
            <p className="text-xs text-blue-200">{doc.docType}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={downloadUrl}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#F37021] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#D85B0F]"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download</span>
            </a>
            <a
              href={previewUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded border border-white/30 px-2.5 py-1.5 text-xs font-semibold hover:bg-white/10"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>New Tab</span>
            </a>
            <button
              type="button"
              onClick={onClose}
              className="rounded p-1 hover:bg-white/10"
              aria-label="Close document preview"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 bg-slate-100 p-4 overflow-auto flex items-center justify-center min-h-[400px]">
          {isPdf ? (
            <iframe
              src={previewUrl}
              title={doc.originalName}
              className="w-full h-[65vh] rounded border border-slate-300 bg-white"
            />
          ) : (
            <img
              src={previewUrl}
              alt={doc.originalName}
              className="max-h-[65vh] max-w-full rounded shadow object-contain bg-white"
            />
          )}
        </div>
      </div>
    </div>
  );
}
