import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Save, Settings } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { adminService } from '../../services/adminService';
import { getErrorMessage } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminSettingsPage() {
  const [form, setForm] = useState({
    academicYear: '2026-27',
    applicationsOpen: true,
    supportEmail: '',
    helplineNumber: '',
    portalBannerMessage: '',
    maxUploadSizeMb: 5,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminService
      .getSettings()
      .then((res) => {
        if (res.settings) {
          setForm((prev) => ({ ...prev, ...res.settings }));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await adminService.updateSettings(form);
      toast.success(res.message);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout role="admin" title="Portal Settings">
      {loading ? (
        <LoadingSpinner label="Loading portal configuration..." />
      ) : (
        <div className="max-w-2xl mx-auto">
          <form
            onSubmit={handleSave}
            className="bg-white rounded-lg border border-[#D4E2F1] p-6 shadow-xs space-y-5"
          >
            <div className="flex items-center gap-2 border-b pb-3">
              <Settings className="h-5 w-5 text-[#F37021]" />
              <h3 className="text-base font-bold text-[#0B2C6F]">
                Global Academic Portal Configuration
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Active Academic Year
                </label>
                <input
                  type="text"
                  value={form.academicYear}
                  onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Max Document Upload Size (MB)
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={form.maxUploadSizeMb}
                  onChange={(e) =>
                    setForm({ ...form, maxUploadSizeMb: Number(e.target.value) })
                  }
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Support Email
                </label>
                <input
                  type="email"
                  value={form.supportEmail}
                  onChange={(e) => setForm({ ...form, supportEmail: e.target.value })}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Helpline Number
                </label>
                <input
                  type="text"
                  value={form.helplineNumber}
                  onChange={(e) => setForm({ ...form, helplineNumber: e.target.value })}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Public Portal Banner Message
                </label>
                <textarea
                  rows={2}
                  value={form.portalBannerMessage}
                  onChange={(e) => setForm({ ...form, portalBannerMessage: e.target.value })}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={form.applicationsOpen}
                onChange={(e) => setForm({ ...form, applicationsOpen: e.target.checked })}
                className="rounded border-slate-300"
              />
              <span>Accepting New Student Applications (AY {form.academicYear})</span>
            </label>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button type="submit" disabled={saving} className="aicte-btn-orange px-6">
                <Save className="h-4 w-4" />
                <span>{saving ? 'Saving...' : 'Save Settings'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </DashboardLayout>
  );
}

