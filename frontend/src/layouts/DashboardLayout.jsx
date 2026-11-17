import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  ClipboardList,
  FilePlus2,
  FileText,
  FolderUp,
  HelpCircle,
  Home,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  BarChart3,
  Users,
  X,
  Clock,
  XCircle,
  GitCommitVertical,
} from 'lucide-react';
import AicteEmblem from '../components/AicteEmblem';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services/studentService';
import { getBackendOrigin } from '../utils/formatters';

export default function DashboardLayout({ role = 'student', title, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (role === 'student') {
      notificationService
        .getNotifications()
        .then((d) => setUnreadCount(d.unreadCount || 0))
        .catch(() => {});
    }
  }, [role]);

  const studentNav = [
    { label: 'Dashboard', to: '/student/dashboard', icon: LayoutDashboard },
    { label: 'My Profile', to: '/student/profile', icon: Users },
    { label: 'My Applications', to: '/student/applications', icon: ClipboardList },
    { label: 'New Application', to: '/student/new-application', icon: FilePlus2 },
    { label: 'Upload Documents', to: '/student/documents', icon: FolderUp },
    { label: 'Application Status', to: '/student/status', icon: GitCommitVertical },
    {
      label: 'Notifications',
      to: '/student/notifications',
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : null,
    },
    { label: 'Help & Support', to: '/student/help', icon: HelpCircle },
    { label: 'Change Password', to: '/student/change-password', icon: KeyRound },
  ];

  const adminNav = [
    { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Manage Students', to: '/admin/students', icon: Users },
    { label: 'Manage Applications', to: '/admin/applications', icon: FileText, end: true },
    { label: 'Pending Applications', to: '/admin/applications/pending', icon: Clock },
    { label: 'Approved Applications', to: '/admin/applications/approved', icon: CheckCircle2 },
    { label: 'Rejected Applications', to: '/admin/applications/rejected', icon: XCircle },
    { label: 'Manage Notifications', to: '/admin/notifications', icon: Bell },
    { label: 'Reports and Analytics', to: '/admin/reports', icon: BarChart3 },
    { label: 'Settings', to: '/admin/settings', icon: Settings },
  ];

  const navItems = role === 'admin' ? adminNav : studentNav;

  const handleLogout = () => {
    logout();
    navigate(role === 'admin' ? '/admin/login' : '/login');
  };

  const avatarSrc = user?.profilePhoto
    ? `${getBackendOrigin()}${user.profilePhoto}`
    : null;

  return (
    <div className="min-h-screen flex bg-[#F4F7FB]">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#0B2C6F] text-white flex flex-col transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-blue-900">
          <Link to="/" className="flex items-center gap-2.5">
            <AicteEmblem className="h-10 w-10 shrink-0" />
            <div>
              <p className="text-xs font-extrabold tracking-wide leading-tight">AICTE PORTAL</p>
              <p className="text-[10px] text-blue-200 uppercase font-semibold">
                {role === 'admin' ? 'Admin Control Panel' : 'Student Portal'}
              </p>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden rounded p-1 text-blue-200 hover:bg-blue-900"
            aria-label="Close Sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User mini-card */}
        <div className="px-4 py-3.5 border-b border-blue-900/80 bg-[#071F52]/50 flex items-center gap-3">
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt={user?.name}
              className="h-10 w-10 rounded-full object-cover border-2 border-[#F37021]"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-[#F37021] flex items-center justify-center font-bold text-sm text-white shrink-0">
              {(user?.name || 'U').charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xs font-bold truncate">{user?.name}</p>
            <p className="text-[11px] text-blue-200 truncate">
              {role === 'admin' ? 'Administrator' : user?.enrollmentNumber || user?.email}
            </p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between rounded-md px-3 py-2.5 text-xs font-semibold transition ${
                    isActive
                      ? 'bg-[#F37021] text-white shadow-xs'
                      : 'text-blue-100 hover:bg-blue-900/70 hover:text-white'
                  }`
                }
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </span>
                {item.badge ? (
                  <span className="rounded-full bg-white text-[#0B2C6F] px-2 py-0.5 text-[10px] font-extrabold">
                    {item.badge}
                  </span>
                ) : null}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-3 border-t border-blue-900 space-y-1">
          <Link
            to="/"
            className="flex items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium text-blue-200 hover:bg-blue-900/70 hover:text-white transition"
          >
            <Home className="h-4 w-4" />
            <span>Public AICTE Homepage</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 rounded-md px-3 py-2 text-xs font-semibold text-red-200 hover:bg-red-900/50 hover:text-white transition"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden rounded-md p-1.5 text-slate-600 hover:bg-slate-100"
              aria-label="Open Navigation Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-extrabold text-[#0B2C6F]">
                {title || (role === 'admin' ? 'Admin Control Panel' : `Welcome back, ${user?.name}`)}
              </h1>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                AICTE Academic Demonstration Portal • Session 2026–27
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {role === 'student' && (
              <Link
                to="/student/notifications"
                className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100"
                title="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] rounded-full bg-[#F37021] px-1 text-[10px] font-bold text-white flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Link>
            )}
            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-1 rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Home className="h-3.5 w-3.5" />
              <span>Public Portal</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
