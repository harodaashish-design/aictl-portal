import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { BellPlus, Pencil, Trash2, MessageSquare } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { adminService } from '../../services/adminService';
import { getErrorMessage } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmDialog from '../../components/ConfirmDialog';
import { formatDate } from '../../utils/formatters';

export default function ManageNotificationsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Public Notice',
    isActive: true,
  });
  const [saving, setSaving] = useState(false);

  const [replyTarget, setReplyTarget] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyStatus, setReplyStatus] = useState('Resolved');

  const loadData = async () => {
    setLoading(true);
    try {
      const [annRes, tktRes] = await Promise.all([
        adminService.getAnnouncements(),
        adminService.getSupportTickets(),
      ]);
      setAnnouncements(annRes.announcements || []);
      setTickets(tktRes.tickets || []);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm({
      title: '',
      description: '',
      category: 'Public Notice',
      isActive: true,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await adminService.updateAnnouncement(editingId, form);
        toast.success('Announcement updated!');
      } else {
        await adminService.createAnnouncement(form);
        toast.success('Announcement published & student notifications sent!');
      }
      resetForm();
      loadData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (ann) => {
    setEditingId(ann._id);
    setForm({
      title: ann.title,
      description: ann.description,
      category: ann.category,
      isActive: ann.isActive,
    });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminService.deleteAnnouncement(deleteTarget._id);
      toast.success('Announcement deleted.');
      setDeleteTarget(null);
      loadData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleTicketReply = async (e) => {
    e.preventDefault();
    if (!replyTarget) return;
    try {
      await adminService.replySupportTicket(replyTarget._id, {
        status: replyStatus,
        adminReply: replyText,
      });
      toast.success('Support ticket updated & student notified.');
      setReplyTarget(null);
      loadData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <DashboardLayout role="admin" title="Manage Notifications & Announcements">
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create / Edit Announcement Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg border border-[#D4E2F1] p-5 shadow-xs space-y-4 h-fit"
          >
            <h3 className="text-base font-bold text-[#0B2C6F] flex items-center gap-2 border-b pb-2">
              <BellPlus className="h-5 w-5 text-[#F37021]" />
              <span>{editingId ? 'Edit Announcement' : 'Publish Announcement'}</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Announcement Title *
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Scholarship Deadline Extended"
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
              >
                <option>Public Notice</option>
                <option>Corrigendum</option>
                <option>Academic Calendar</option>
                <option>Scheme</option>
                <option>General</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description / Message *
              </label>
              <textarea
                rows={4}
                required
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Write announcement details..."
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="rounded border-slate-300"
              />
              <span>Visible on Public Homepage & Notify Students</span>
            </label>

            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="aicte-btn-orange flex-1">
                {saving ? 'Saving...' : editingId ? 'Update' : 'Publish Announcement'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {/* Announcements List */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-[#D4E2F1] p-5 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-[#0B2C6F] border-b pb-2">
              Published Announcements ({announcements.length})
            </h3>
            {loading ? (
              <LoadingSpinner label="Loading announcements..." />
            ) : (
              <div className="divide-y divide-slate-100">
                {announcements.map((ann) => (
                  <div
                    key={ann._id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-[#0B2C6F]">
                          {ann.category}
                        </span>
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                            ann.isActive
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {ann.isActive ? 'Active' : 'Hidden'}
                        </span>
                        <span className="text-xs text-slate-400">
                          {formatDate(ann.publishDate)}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{ann.title}</h4>
                      <p className="text-xs text-slate-600">{ann.description}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => startEdit(ann)}
                        className="rounded border border-slate-300 p-1.5 text-slate-600 hover:bg-slate-100"
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(ann)}
                        className="rounded border border-red-200 bg-red-50 p-1.5 text-red-600 hover:bg-red-100"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Support Tickets Management */}
        <div className="bg-white rounded-lg border border-[#D4E2F1] p-5 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-[#0B2C6F] flex items-center gap-2 border-b pb-2">
            <MessageSquare className="h-5 w-5 text-[#F37021]" />
            <span>Helpdesk & Student Support Queries ({tickets.length})</span>
          </h3>
          {tickets.length === 0 ? (
            <p className="text-xs text-slate-500">No support queries submitted yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {tickets.map((t) => (
                <div
                  key={t._id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#0B2C6F]">
                        {t.ticketId}
                      </span>
                      <span className="text-xs font-semibold text-slate-600">
                        {t.name} ({t.email})
                      </span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold">
                        {t.status}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-800">{t.subject}</p>
                    <p className="text-xs text-slate-600">{t.message}</p>
                    {t.adminReply && (
                      <p className="text-xs text-emerald-700 font-medium">
                        Reply: {t.adminReply}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setReplyTarget(t);
                      setReplyText(t.adminReply || '');
                      setReplyStatus(t.status === 'Open' ? 'Resolved' : t.status);
                    }}
                    className="shrink-0 rounded border border-[#0B2C6F] px-3 py-1.5 text-xs font-bold text-[#0B2C6F] hover:bg-blue-50"
                  >
                    Reply / Update
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {replyTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4">
          <form
            onSubmit={handleTicketReply}
            className="w-full max-w-md rounded-lg bg-white p-6 space-y-4 shadow-xl"
          >
            <h4 className="text-base font-bold text-[#0B2C6F]">
              Reply to Ticket {replyTarget.ticketId}
            </h4>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={replyStatus}
                onChange={(e) => setReplyStatus(e.target.value)}
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Admin Reply
              </label>
              <textarea
                rows={3}
                required
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setReplyTarget(null)}
                className="rounded border border-slate-300 px-4 py-1.5 text-xs font-semibold"
              >
                Cancel
              </button>
              <button type="submit" className="aicte-btn-orange text-xs">
                Save Reply
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Announcement"
        message={`Delete announcement "${deleteTarget?.title}"?`}
        confirmText="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </DashboardLayout>
  );
}

