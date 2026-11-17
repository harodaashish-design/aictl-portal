import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import PublicLayout from '../layouts/PublicLayout';
import { publicService } from '../services/publicService';
import { getErrorMessage } from '../services/api';

export default function StaticPolicyPage({ pageType }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    category: 'Technical Support',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const submitTicket = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await publicService.submitSupportQuery(form);
      toast.success(res.message);
      setForm({
        name: '',
        email: '',
        category: 'Technical Support',
        subject: '',
        message: '',
      });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const titles = {
    privacy: 'Privacy Policy — Academic Demonstration Portal',
    terms: 'Terms and Conditions of Use',
    helpdesk: 'Portal Helpdesk & Technical Support',
  };

  return (
    <PublicLayout>
      <div className="aicte-sky-hero border-b border-sky-200 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold text-[#0B2C6F]/80 mb-2">
            <Link to="/" className="hover:underline">
              Home
            </Link>{' '}
            &gt; {titles[pageType] || 'Information'}
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B2C6F]">
            {titles[pageType]}
          </h2>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {pageType === 'helpdesk' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-md border border-slate-200 p-6 space-y-3">
              <h3 className="text-lg font-bold text-[#0B2C6F]">Contact Helpdesk</h3>
              <p className="text-sm text-slate-600">
                Use this form to submit technical queries, approval questions, or feedback to the
                academic portal support desk.
              </p>
              <div className="rounded bg-[#E8F3FC] p-4 text-xs space-y-1.5 text-[#0B2C6F]">
                <p>
                  <strong>Helpline:</strong> 011-29581000 / 1800-11-2428 (Demo)
                </p>
                <p>
                  <strong>Email:</strong> helpdesk-demo@aicte-portal.edu
                </p>
                <p>
                  <strong>Timings:</strong> Mon – Fri, 9:30 AM – 6:00 PM IST
                </p>
              </div>
            </div>
            <form
              onSubmit={submitTicket}
              className="bg-white rounded-md border border-slate-200 p-6 space-y-3"
            >
              <h3 className="text-base font-bold text-[#0B2C6F]">Submit Support Request</h3>
              <input
                type="text"
                required
                placeholder="Your Full Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                type="email"
                required
                placeholder="Email Address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                type="text"
                required
                placeholder="Subject"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
              />
              <textarea
                rows={4}
                required
                placeholder="Describe your query..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
              />
              <button type="submit" disabled={submitting} className="aicte-btn-orange w-full">
                {submitting ? 'Submitting...' : 'Submit Ticket'}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-md border border-slate-200 p-6 space-y-4 text-sm text-slate-700 leading-relaxed">
            <p className="rounded bg-amber-50 border border-amber-200 p-3 text-xs font-semibold text-amber-900">
              Disclaimer: This website is an independent academic demonstration project created for
              educational purposes and is NOT affiliated with the All India Council for Technical
              Education (AICTE) or the Government of India.
            </p>
            {pageType === 'privacy' ? (
              <>
                <h3 className="text-base font-bold text-[#0B2C6F]">1. Data Collected for Demo</h3>
                <p>
                  Student registration data (name, email, phone, enrollment number, institution
                  details) and uploaded supporting documents are stored securely in the local
                  application database solely to demonstrate full-stack portal workflows.
                </p>
                <h3 className="text-base font-bold text-[#0B2C6F]">
                  2. Security & Role-Based Isolation
                </h3>
                <p>
                  Passwords are hashed with bcrypt, sessions use signed JWT tokens, and uploaded
                  documents are strictly protected so students can only access their own records.
                </p>
              </>
            ) : (
              <>
                <h3 className="text-base font-bold text-[#0B2C6F]">
                  1. Educational Simulation Purpose
                </h3>
                <p>
                  All sample public notices, PDFs, academic calendars, and institution directories on
                  this portal are demonstration materials built for a college major project.
                </p>
                <h3 className="text-base font-bold text-[#0B2C6F]">2. Acceptable Use</h3>
                <p>
                  Do not submit confidential government credentials or sensitive personal
                  information. For official AICTE circulars and approvals, always visit{' '}
                  <span className="font-semibold">https://www.aicte.gov.in/</span>.
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
