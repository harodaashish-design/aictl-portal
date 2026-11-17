import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Accessibility,
  Contrast,
  LogIn,
  LogOut,
  ShieldCheck,
  UserPlus,
  LayoutDashboard,
  Volume2,
  X,
  ChevronDown,
} from 'lucide-react';
import AicteEmblem from './AicteEmblem';
import { useAccessibility } from '../context/AccessibilityContext';
import { useAuth } from '../context/AuthContext';

export default function AicteHeader() {
  const {
    fontScale,
    setFontScale,
    highContrast,
    toggleHighContrast,
    screenReaderMode,
    setScreenReaderMode,
  } = useAccessibility();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [nowText, setNowText] = useState('');
  const [srModalOpen, setSrModalOpen] = useState(false);
  const [hindiLabel, setHindiLabel] = useState(false);
  const [loginMenuOpen, setLoginMenuOpen] = useState(false);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const weekday = now.toLocaleDateString('en-US', { weekday: 'long' });
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      const time = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      setNowText(`${weekday} , ${day}-${month}-${year} , ${time}`);
    };
    updateClock();
    const timer = setInterval(updateClock, 30000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const dashboardPath = user?.role === 'admin' ? '/admin/dashboard' : '/student/dashboard';

  return (
    <header className="w-full bg-white border-b border-slate-200 relative z-40">
      {/* Top Dark Utility Strip (Matching AICTE Reference Screenshot) */}
      <div className="bg-[#181818] text-white text-[11px] sm:text-xs">
        <div className="max-w-7xl mx-auto px-4 py-1.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-3 sm:gap-5">
            <span className="text-slate-200 font-medium">{nowText}</span>
            <button
              type="button"
              onClick={() => {
                setScreenReaderMode((prev) => !prev);
                setSrModalOpen(true);
              }}
              className={`inline-flex items-center gap-1.5 font-medium transition ${
                screenReaderMode ? 'text-[#FBBF24]' : 'text-slate-100 hover:text-[#FBBF24]'
              }`}
              title="Screen Reader Access"
            >
              <Volume2 className="h-3.5 w-3.5" />
              <span>Screen Reader Access</span>
            </button>
            <a
              href="#main-content"
              className="hidden md:inline text-slate-300 hover:text-white underline"
            >
              Skip to Main Content
            </a>
          </div>

          {/* Right-side Accessibility & Web Portal Login Controls */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div
              className="flex items-center gap-1.5 text-slate-200"
              role="group"
              aria-label="Font size controls"
            >
              <span className="hidden sm:inline text-slate-400 mr-0.5">Text Size</span>
              <button
                type="button"
                onClick={() => setFontScale('sm')}
                className={`px-1 rounded transition ${
                  fontScale === 'sm' ? 'text-[#FBBF24] font-bold underline' : 'hover:text-white'
                }`}
                aria-label="Decrease font size"
              >
                A-
              </button>
              <button
                type="button"
                onClick={() => setFontScale('md')}
                className={`px-1 rounded transition ${
                  fontScale === 'md' ? 'text-[#FBBF24] font-bold underline' : 'hover:text-white'
                }`}
                aria-label="Standard font size"
              >
                A
              </button>
              <button
                type="button"
                onClick={() => setFontScale('lg')}
                className={`px-1 rounded transition ${
                  fontScale === 'lg' ? 'text-[#FBBF24] font-bold underline' : 'hover:text-white'
                }`}
                aria-label="Increase font size"
              >
                A+
              </button>
            </div>

            <button
              type="button"
              onClick={toggleHighContrast}
              className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] transition ${
                highContrast
                  ? 'bg-[#FBBF24] text-slate-900 font-bold'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="High Contrast"
            >
              <Contrast className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setHindiLabel((p) => !p)}
              className="inline-flex items-center gap-1 rounded-full bg-[#F5B81A] px-3 py-0.5 text-[11px] font-bold text-slate-900 hover:bg-[#eab015] transition"
              title="Language Display Toggle"
            >
              <span>A/अ</span>
              <span>{hindiLabel ? 'English' : 'हिन्दी'}</span>
            </button>

            {/* Web Portal Login Pill Dropdown */}
            <div className="relative">
              {isAuthenticated ? (
                <div className="flex items-center gap-1.5">
                  <Link
                    to={dashboardPath}
                    className="inline-flex items-center gap-1 rounded-full bg-[#F5B81A] px-3 py-0.5 text-[11px] font-bold text-slate-900 hover:bg-[#eab015]"
                  >
                    <LayoutDashboard className="h-3 w-3" />
                    <span>Dashboard</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center gap-1 rounded-full border border-slate-600 px-2.5 py-0.5 text-[11px] text-slate-200 hover:bg-slate-800"
                  >
                    <LogOut className="h-3 w-3" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setLoginMenuOpen((p) => !p)}
                    className="inline-flex items-center gap-1 rounded-full bg-[#F5B81A] px-3 py-0.5 text-[11px] font-bold text-slate-900 hover:bg-[#eab015] transition"
                  >
                    <LogIn className="h-3 w-3" />
                    <span>Web Portal Login</span>
                    <ChevronDown className="h-3 w-3" />
                  </button>
                  {loginMenuOpen && (
                    <div
                      className="absolute right-0 mt-1.5 w-48 rounded-md border border-slate-200 bg-white text-slate-800 shadow-lg py-1 z-50"
                      onMouseLeave={() => setLoginMenuOpen(false)}
                    >
                      <Link
                        to="/login"
                        onClick={() => setLoginMenuOpen(false)}
                        className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold hover:bg-blue-50 text-[#0B2C6F]"
                      >
                        <LogIn className="h-3.5 w-3.5" />
                        <span>Student Login</span>
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setLoginMenuOpen(false)}
                        className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold hover:bg-blue-50 text-[#F37021]"
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                        <span>Student Registration</span>
                      </Link>
                      <Link
                        to="/admin/login"
                        onClick={() => setLoginMenuOpen(false)}
                        className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold hover:bg-blue-50 text-slate-700 border-t border-slate-100"
                      >
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>Admin Panel Login</span>
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main White Branding Header (Matching Screenshot Layout) */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 sm:py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <Link to="/" className="flex items-center gap-3 group">
          <AicteEmblem className="h-12 w-12 sm:h-14 sm:w-14 shrink-0" />
          <div>
            <p className="font-devanagari text-sm sm:text-base font-bold text-slate-900 leading-snug">
              अखिल भारतीय तकनीकी शिक्षा परिषद
            </p>
            <h1 className="text-xs sm:text-sm md:text-base font-bold text-slate-800 tracking-wide uppercase leading-tight">
              ALL INDIA COUNCIL FOR TECHNICAL EDUCATION
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">
              A Statutory Body of Government of India{' '}
              <span className="text-amber-700 font-semibold">• Academic Demo Project</span>
            </p>
          </div>
        </Link>

        {/* Clean Portal Quick Links on Right */}
        <div className="flex flex-wrap items-center gap-2">
          {isAuthenticated ? (
            <Link
              to={dashboardPath}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#0B3B8C] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#072964] transition"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span>{user?.role === 'admin' ? 'Open Admin Panel' : 'Open Student Dashboard'}</span>
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="inline-flex items-center gap-1 rounded-full border border-[#0B3B8C] px-3.5 py-1.5 text-xs font-bold text-[#0B3B8C] hover:bg-blue-50 transition"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Student Login</span>
              </Link>
              <Link to="/register" className="aicte-pill-btn">
                <UserPlus className="h-3.5 w-3.5" />
                <span>Register</span>
              </Link>
              <Link
                to="/admin/login"
                className="inline-flex items-center gap-1 rounded-full bg-[#0B3B8C] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#072964] transition"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Admin</span>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Screen Reader Accessibility Modal */}
      {srModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg rounded-lg bg-white border border-slate-200 shadow-xl overflow-hidden">
            <div className="flex items-center justify-between bg-[#0B3B8C] px-5 py-3 text-white">
              <div className="flex items-center gap-2">
                <Accessibility className="h-5 w-5" />
                <h2 className="text-base font-bold">Screen Reader & Accessibility Support</h2>
              </div>
              <button
                type="button"
                onClick={() => setSrModalOpen(false)}
                className="rounded p-1 hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5 space-y-3 text-sm text-slate-700">
              <p>
                Enhanced keyboard focus outlines have been{' '}
                <strong className="text-[#0B3B8C]">
                  {screenReaderMode ? 'Enabled' : 'Disabled'}
                </strong>
                . Use <code>A-</code>, <code>A</code>, <code>A+</code> in the top black strip to
                resize portal typography.
              </p>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setSrModalOpen(false)}
                  className="aicte-pill-btn px-6"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
