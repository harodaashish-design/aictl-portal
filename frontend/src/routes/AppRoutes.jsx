import { Routes, Route, Link } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import PublicLayout from '../layouts/PublicLayout';

// Public Pages
import HomePage from '../pages/HomePage';
import InfoSectionPage from '../pages/InfoSectionPage';
import InstitutionsDirectoryPage from '../pages/InstitutionsDirectoryPage';
import SearchResultsPage from '../pages/SearchResultsPage';
import StaticPolicyPage from '../pages/StaticPolicyPage';

// Auth Pages
import StudentSignupPage from '../pages/StudentSignupPage';
import StudentLoginPage from '../pages/StudentLoginPage';
import AdminLoginPage from '../pages/AdminLoginPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';

// Student Dashboard Pages
import StudentOverviewPage from '../pages/student/StudentOverviewPage';
import StudentProfilePage from '../pages/student/StudentProfilePage';
import StudentApplicationsPage from '../pages/student/StudentApplicationsPage';
import NewApplicationPage from '../pages/student/NewApplicationPage';
import StudentDocumentsPage from '../pages/student/StudentDocumentsPage';
import ApplicationTrackingPage from '../pages/student/ApplicationTrackingPage';
import NotificationsPage from '../pages/student/NotificationsPage';
import HelpSupportPage from '../pages/student/HelpSupportPage';
import ChangePasswordPage from '../pages/student/ChangePasswordPage';

// Admin Dashboard Pages
import AdminOverviewPage from '../pages/admin/AdminOverviewPage';
import ManageStudentsPage from '../pages/admin/ManageStudentsPage';
import ManageApplicationsPage from '../pages/admin/ManageApplicationsPage';
import ManageNotificationsPage from '../pages/admin/ManageNotificationsPage';
import ReportsAnalyticsPage from '../pages/admin/ReportsAnalyticsPage';
import AdminSettingsPage from '../pages/admin/AdminSettingsPage';

function NotFoundPage() {
  return (
    <PublicLayout>
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-4xl font-extrabold text-[#0B3B8C]">404</h2>
        <p className="text-base font-semibold text-slate-700">
          The requested portal page could not be found.
        </p>
        <Link to="/" className="aicte-pill-btn inline-flex px-6 py-2.5">
          Return to Homepage
        </Link>
      </div>
    </PublicLayout>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Portal Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/section/:sectionSlug" element={<InfoSectionPage />} />
      <Route path="/institutions" element={<InstitutionsDirectoryPage />} />
      <Route path="/search" element={<SearchResultsPage />} />
      <Route path="/privacy-policy" element={<StaticPolicyPage pageType="privacy" />} />
      <Route path="/terms" element={<StaticPolicyPage pageType="terms" />} />
      <Route path="/helpdesk" element={<StaticPolicyPage pageType="helpdesk" />} />

      {/* Authentication Routes */}
      <Route path="/register" element={<StudentSignupPage />} />
      <Route path="/login" element={<StudentLoginPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Protected Student Routes */}
      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentOverviewPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/profile"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/applications"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentApplicationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/new-application"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <NewApplicationPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/documents"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentDocumentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/status"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <ApplicationTrackingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/notifications"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <NotificationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/help"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <HelpSupportPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/change-password"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <ChangePasswordPage role="student" />
          </ProtectedRoute>
        }
      />

      {/* Protected Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminOverviewPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/students"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ManageStudentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/applications"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ManageApplicationsPage defaultStatus="All" pageTitle="Manage Applications" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/applications/pending"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ManageApplicationsPage
              defaultStatus="Pending"
              pageTitle="Pending Applications"
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/applications/approved"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ManageApplicationsPage
              defaultStatus="Approved"
              pageTitle="Approved Applications"
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/applications/rejected"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ManageApplicationsPage
              defaultStatus="Rejected"
              pageTitle="Rejected Applications"
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/notifications"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ManageNotificationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ReportsAnalyticsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminSettingsPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

