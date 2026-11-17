import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { HelpCircle, MessageSquarePlus, Phone } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { studentService } from '../../services/studentService';
import { getErrorMessage } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { formatDateTime } from '../../utils/formatters';

export default function HelpSupportPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    category: 'Application Status',
    subject: '',
    message: '',
  });

  const loadTickets = async () => {
    setLoading(true);
    try {
      const res = await studentService.getSupportTickets();
      setTickets(res.tickets || []);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await studentService.createSupportTicket(form);
      toast.success(res.message);
      setForm({ category: 'Application Status', subject: '', message: '' });
      loadTickets();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout role="student" title="Help & Support">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg border border-[#D4E2F1] p-6 shadow-xs space-y-4 h-fit"
        >
          <h3 className="text-base font-bold text-[#0B2C6F] flex items-center gap-2 border-b pb-2">
            <MessageSquarePlus className="h-5 w-5 text-[#F37021]" />
            <span>Raise Support Ticket</span>
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
            >
              <option>Application Status</option>
              <option>Document Upload Issue</option>
              <option>Scholarship / Scheme</option>
              <option>Technical Support</option>
              <option>General Grievance</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Subject *</label>
            <input
              type="text"
              required
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="Brief summary of issue"
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Message *</label>
            <textarea
              rows={4}
              required
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Explain your query..."
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <button type="submit" disabled={submitting} className="aicte-btn-orange w-full">
            {submitting ? 'Submitting...' : 'Submit Ticket'}
          </button>

          <div className="rounded bg-[#E8F3FC] p-3 text-xs text-[#0B2C6F] space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" />
              <span>Technical Helpline (Demo)</span>
            </p>
            <p>011-29581000 • Mon–Fri, 9:30 AM – 6:00 PM</p>
          </div>
        </form>

        <div className="lg:col-span-2 bg-white rounded-lg border border-[#D4E2F1] p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-[#0B2C6F] flex items-center gap-2 border-b pb-2">
            <HelpCircle className="h-5 w-5 text-[#F37021]" />
            <span>My Support Tickets ({tickets.length})</span>
          </h3>

          {loading ? (
            <LoadingSpinner label="Loading support tickets..." />
          ) : tickets.length === 0 ? (
            <EmptyState
              title="No support tickets raised"
              description="Submit a query on the left if you need assistance with applications or documents."
            />
          ) : (
            <div className="space-y-3">
              {tickets.map((t) => (
                <div key={t._id} className="rounded-md border border-slate-200 p-4 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-mono text-xs font-bold text-[#0B2C6F] mr-2">
                        {t.ticketId}
                      </span>
                      <span className="text-xs rounded bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                        {t.category}
                      </span>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        t.status === 'Resolved'
                          ? 'bg-emerald-50 text-emerald-700'
                          : t.status === 'In Progress'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{t.subject}</h4>
                  <p className="text-xs text-slate-600">{t.message}</p>
                  {t.adminReply && (
                    <div className="rounded bg-blue-50 border border-blue-200 p-2.5 text-xs text-[#0B2C6F]">
                      <strong>Admin Reply:</strong> {t.adminReply}
                    </div>
                  )}
                  <p className="text-[11px] text-slate-400">
                    Created: {formatDateTime(t.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
