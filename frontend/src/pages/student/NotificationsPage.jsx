import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Bell, CheckCheck, CheckCircle2, Info, AlertTriangle, XCircle } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { notificationService } from '../../services/studentService';
import { getErrorMessage } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { formatDateTime } from '../../utils/formatters';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationService.getNotifications();
      setNotifications(res.notifications || []);
      setUnreadCount(res.unreadCount || 0);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      loadNotifications();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleMarkAll = async () => {
    try {
      await notificationService.markAllRead();
      toast.success('All notifications marked as read.');
      loadNotifications();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const getIcon = (type) => {
    if (type === 'success') return <CheckCircle2 className="h-5 w-5 text-emerald-600" />;
    if (type === 'warning') return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    if (type === 'error') return <XCircle className="h-5 w-5 text-red-600" />;
    return <Info className="h-5 w-5 text-[#0B2C6F]" />;
  };

  return (
    <DashboardLayout role="student" title="Notifications">
      <div className="space-y-5 max-w-4xl mx-auto">
        <div className="bg-white rounded-lg border border-[#D4E2F1] p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Bell className="h-5 w-5 text-[#F37021]" />
            <div>
              <h2 className="text-base font-bold text-[#0B2C6F]">In-App Notifications</h2>
              <p className="text-xs text-slate-500">
                You have <strong className="text-[#F37021]">{unreadCount}</strong> unread
                notification(s).
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAll}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#0B2C6F] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#071F52]"
            >
              <CheckCheck className="h-4 w-4" />
              <span>Mark All as Read</span>
            </button>
          )}
        </div>

        <div className="bg-white rounded-lg border border-[#D4E2F1] shadow-xs overflow-hidden">
          {loading ? (
            <LoadingSpinner label="Loading notifications..." />
          ) : notifications.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="No notifications yet"
                description="Status updates, application alerts, and official announcements will appear here."
              />
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map((n) => (
                <div
                  key={n._id}
                  className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-3 transition ${
                    n.isRead ? 'bg-white' : 'bg-blue-50/60 border-l-4 border-l-[#F37021]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">{getIcon(n.type)}</div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">{n.title}</h4>
                        {!n.isRead && (
                          <span className="rounded bg-[#F37021] px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
                            Unread
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600">{n.message}</p>
                      <p className="text-[11px] text-slate-400">{formatDateTime(n.createdAt)}</p>
                    </div>
                  </div>
                  {!n.isRead && (
                    <button
                      type="button"
                      onClick={() => handleMarkRead(n._id)}
                      className="shrink-0 self-start rounded border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-[#0B2C6F] hover:bg-slate-50"
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
