import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Bell,
  Download,
  PhoneCall,
  X,
  CheckCircle2,
  UserPlus,
  LogIn,
  ShieldCheck,
} from 'lucide-react';
import PublicLayout from '../layouts/PublicLayout';
import { publicService } from '../services/publicService';
import { getErrorMessage } from '../services/api';
import { formatDate } from '../utils/formatters';

export default function HomePage() {
  const [announcements, setAnnouncements] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [portalSettings, setPortalSettings] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // 'notice' | 'support' | 'faq' | 'helpline' | 'vc' | 'unapproved' | 'calendar'
  const [supportForm, setSupportForm] = useState({
    name: '',
    email: '',
    category: 'Approval Process Query',
    subject: '',
    message: '',
  });
  const [submittingSupport, setSubmittingSupport] = useState(false);
  const [submittedTicketId, setSubmittedTicketId] = useState('');

  useEffect(() => {
    let mounted = true;
    publicService
      .getHomepageData()
      .then((data) => {
        if (!mounted) return;
        setAnnouncements(data.announcements || []);
        setFaqs(data.faqs || []);
        setPortalSettings(data.portalSettings || null);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const handleSupportSubmit = async (e) => {
    e.preventDefault();
    setSubmittingSupport(true);
    try {
      const res = await publicService.submitSupportQuery(supportForm);
      setSubmittedTicketId(res.ticket?.ticketId || 'SUP-2026');
      toast.success(res.message || 'Support query submitted successfully!');
      setSupportForm({
        name: '',
        email: '',
        category: 'Approval Process Query',
        subject: '',
        message: '',
      });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmittingSupport(false);
    }
  };

  // Exact left-column rows matching the AICTE Approval Process 2026-2027 reference screenshot
  const leftRows = [
    {
      id: 'approved-institutions',
      label: 'AICTE Approved Universities/Institutions',
      buttonText: 'Click Here',
      to: '/institutions',
    },
    {
      id: 'public-notice',
      label: 'Public Notice for Approval Process 2026–27',
      buttonText: 'Click Here',
      onClick: () => setActiveModal('notice'),
    },
    {
      id: 'corrigendum',
      label: 'Corrigendum / Addendum for Approval Process 2026–27 :',
      buttonText: 'To Download Click Here',
      href: publicService.getDocumentDownloadUrl('corrigendum-addendum-2026-27'),
    },
    {
      id: 'aph',
      label: 'Approval Process Handbook (APH) and Guidelines/Information :',
      buttonText: 'To Download APH Click Here',
      href: publicService.getDocumentDownloadUrl('aph-handbook-2026-27'),
    },
    {
      id: 'support-system',
      label: 'Centralized Support System for Approval Queries :',
      buttonText: 'Click Here',
      onClick: () => {
        setSubmittedTicketId('');
        setActiveModal('support');
      },
    },
    {
      id: 'faqs',
      label: 'Frequently Asked Questions (FAQs) :',
      buttonText: 'Click Here',
      onClick: () => setActiveModal('faq'),
    },
    {
      id: 'helpline',
      label: 'Helpline for Technical Queries :',
      buttonText: '(011)29581333, 29581338, 29581342',
      onClick: () => setActiveModal('helpline'),
    },
    {
      id: 'unapproved-info',
      label: 'Information Regarding an Unapproved Institution:',
      buttonText: 'Click Here',
      to: '/institutions?tab=unapproved',
    },
  ];

  // Exact right-column information panels matching the reference screenshot
  const rightPanels = [
    {
      id: 'ifc',
      title: 'Information Facilitation Center for Live Video Conferencing (Technical Support) :',
      buttonText: 'Click Here to Know More',
      onClick: () => setActiveModal('vc'),
    },
    {
      id: 'unapproved-list',
      title: 'List of Unapproved Institutions :',
      buttonText: 'Click Here to Know More',
      onClick: () => setActiveModal('unapproved'),
    },
    {
      id: 'academic-calendar',
      title: 'Revised Academic Calendar 2026–27 :',
      buttonText: 'Click Here to Know More',
      onClick: () => setActiveModal('calendar'),
    },
  ];

  return (
    <PublicLayout>
      {/* FULL SKY & CLOUDS APPROVAL PROCESS SECTION — Matches Reference Screenshot */}
      <section className="relative overflow-hidden aicte-sky-hero pb-10 pt-5 sm:pt-7">
        {/* Soft Layered Atmospheric Sky Clouds */}
        <svg
          className="pointer-events-none absolute top-2 left-4 w-64 sm:w-96 opacity-75"
          viewBox="0 0 360 110"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M35 90 H325 C345 90 355 77 355 62 C355 47 344 35 327 35 C320 18 302 6 280 6 C262 6 246 15 237 29 C226 19 212 13 196 13 C168 13 145 33 141 59 C133 55 123 53 113 53 C88 53 68 69 68 88 C68 89 49 90 35 90 Z"
            fill="#FFFFFF"
            fillOpacity="0.6"
          />
        </svg>

        <svg
          className="pointer-events-none absolute top-8 right-6 w-72 sm:w-[420px] opacity-70"
          viewBox="0 0 400 120"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M20 96 H368 C386 96 396 82 396 66 C396 50 383 37 364 37 C356 18 337 5 314 5 C295 5 278 15 268 30 C257 20 242 14 225 14 C196 14 172 35 168 63 C158 58 148 56 136 56 C108 56 85 74 85 95 Z"
            fill="#FFFFFF"
            fillOpacity="0.55"
          />
        </svg>

        <svg
          className="pointer-events-none absolute bottom-0 left-0 w-full h-44 opacity-50"
          viewBox="0 0 1440 200"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0,120 C160,60 320,140 500,95 C680,50 860,135 1040,85 C1210,40 1340,105 1440,80 L1440,200 L0,200 Z"
            fill="#FFFFFF"
            fillOpacity="0.65"
          />
        </svg>

        {/* Centered Hero Heading */}
        <div className="relative max-w-7xl mx-auto px-4">
          <div className="text-center mb-6 sm:mb-7">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0A2E6F] tracking-tight">
              Approval Process 2026–2027
            </h2>
            <p className="mt-1 text-sm sm:text-base font-medium text-slate-800">
              Academic Year 2026–27 <span className="text-slate-600 text-xs sm:text-sm">(w.e.f 28th Nov, 2025)</span>
            </p>
          </div>

          {/* TWO MAIN COLUMNS WITH THIN GOLD BORDER (Matching Screenshot Layout) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* LEFT COLUMN (~66% width) */}
            <div className="lg:col-span-8 border border-[#D9B64E] bg-white/30 backdrop-blur-[1px] px-4 sm:px-6 py-4 sm:py-5">
              <div className="divide-y divide-sky-900/10">
                {leftRows.map((row) => (
                  <div
                    key={row.id}
                    className="py-2.5 sm:py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4"
                  >
                    <h3 className="text-sm sm:text-[15px] font-bold text-[#0A2E6F] leading-snug">
                      {row.label}
                    </h3>
                    <div className="shrink-0">
                      {row.to ? (
                        <Link to={row.to} className="aicte-pill-btn w-full sm:w-64">
                          {row.buttonText}
                        </Link>
                      ) : row.href ? (
                        <a
                          href={row.href}
                          target="_blank"
                          rel="noreferrer"
                          className="aicte-pill-btn w-full sm:w-64"
                        >
                          {row.buttonText}
                        </a>
                      ) : (
                        <button
                          type="button"
                          onClick={row.onClick}
                          className="aicte-pill-btn w-full sm:w-64"
                        >
                          {row.buttonText}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT COLUMN (~34% width) */}
            <div className="lg:col-span-4 border border-[#D9B64E] bg-white/30 backdrop-blur-[1px] px-5 py-6 flex flex-col justify-between gap-7 text-center">
              {rightPanels.map((panel) => (
                <div key={panel.id} className="space-y-3">
                  <h3 className="text-sm sm:text-[15px] font-bold text-[#0A2E6F] leading-snug">
                    {panel.title}
                  </h3>
                  <button
                    type="button"
                    onClick={panel.onClick}
                    className="aicte-pill-btn w-full sm:w-60 mx-auto"
                  >
                    {panel.buttonText}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* DYNAMIC PORTAL SERVICES & ANNOUNCEMENTS SECTION BELOW SKY HERO */}
      <section className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Live Announcements from Database */}
          <div className="lg:col-span-8 bg-white rounded-md border border-[#D4E2F1] shadow-xs overflow-hidden">
            <div className="bg-[#0B3B8C] px-5 py-3 text-white flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold flex items-center gap-2">
                <Bell className="h-4 w-4 text-[#F5B81A]" />
                <span>Latest Circulars & Official Announcements</span>
              </h3>
              <Link
                to="/section/newsroom"
                className="text-xs font-semibold text-[#F5B81A] hover:underline"
              >
                View All →
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {announcements.length === 0 ? (
                <p className="p-5 text-xs text-slate-500">
                  No active announcements published yet.
                </p>
              ) : (
                announcements.slice(0, 4).map((ann) => (
                  <div key={ann._id} className="p-4 hover:bg-slate-50 transition">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="inline-block rounded bg-blue-50 border border-blue-200 px-2 py-0.5 text-[11px] font-bold text-[#0B3B8C]">
                        {ann.category}
                      </span>
                      <span className="text-xs text-slate-400">
                        {formatDate(ann.publishDate)}
                      </span>
                    </div>
                    <h4 className="mt-1.5 text-sm font-bold text-slate-900">{ann.title}</h4>
                    <p className="mt-0.5 text-xs text-slate-600">{ann.description}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Student & Admin Portal Quick Access Panel */}
          <div className="lg:col-span-4 bg-white rounded-md border border-[#D4E2F1] shadow-xs p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <h3 className="text-base font-extrabold text-[#0B3B8C] border-b border-slate-100 pb-2">
                Online Student & Admin Portal
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Students can register, submit scholarship/verification applications, upload
                documents, and track live approval status. Administrators can manage students and
                review submissions.
              </p>
            </div>
            <div className="space-y-2.5">
              <Link
                to="/login"
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#0B3B8C] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#082B69] transition"
              >
                <LogIn className="h-4 w-4" />
                <span>Student Login</span>
              </Link>
              <Link to="/register" className="aicte-pill-btn w-full py-2.5">
                <UserPlus className="h-4 w-4" />
                <span>New Student Registration</span>
              </Link>
              <Link
                to="/admin/login"
                className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                <ShieldCheck className="h-4 w-4 text-[#0B3B8C]" />
                <span>Admin Control Panel Login</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE MODALS FOR ALL BUTTONS */}
      {activeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-lg bg-white border border-slate-200 shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between bg-[#0B3B8C] px-5 py-3.5 text-white z-10">
              <h3 className="text-base font-bold">
                {activeModal === 'notice' && 'Public Notice for Approval Process 2026–27'}
                {activeModal === 'support' && 'Centralized Support System for Approval Queries'}
                {activeModal === 'faq' && 'Frequently Asked Questions (Approval Process 2026–27)'}
                {activeModal === 'helpline' && 'Helpline for Technical Queries'}
                {activeModal === 'vc' &&
                  'Information Facilitation Center — Live Video Conferencing'}
                {activeModal === 'unapproved' && 'List of Unapproved Institutions'}
                {activeModal === 'calendar' && 'Revised Academic Calendar 2026–27'}
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded p-1 hover:bg-white/10"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6">
              {activeModal === 'notice' && (
                <div className="space-y-4 text-sm text-slate-700">
                  <p className="text-xs font-bold text-[#0B3B8C]">
                    Ref: F.No. AICTE/AB/2026-27/PN-01 | Academic Year 2026–27
                  </p>
                  <p className="leading-relaxed">
                    Online applications are invited from existing AICTE-approved technical
                    institutions and new applicant trusts/societies for Grant of Approval /
                    Extension of Approval (EoA) for Academic Year 2026–27 under the provisions of
                    Approval Process Handbook (APH 2024–2027).
                  </p>
                  <ul className="list-disc pl-5 text-xs space-y-1.5 text-slate-600">
                    <li>Portal Opening Date: 20 January 2026</li>
                    <li>Last Date Without Late Fee: 28 February 2026</li>
                    <li>Final EoA Approval Deadline: 30 April 2026</li>
                  </ul>
                  <div className="flex flex-wrap justify-end gap-2 pt-2">
                    <a
                      href={publicService.getDocumentDownloadUrl('public-notice-2026-27')}
                      target="_blank"
                      rel="noreferrer"
                      className="aicte-pill-btn px-6 py-2.5"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download Public Notice PDF</span>
                    </a>
                  </div>
                </div>
              )}

              {activeModal === 'support' && (
                <div>
                  {submittedTicketId ? (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-center space-y-3">
                      <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
                      <h4 className="text-base font-bold text-emerald-900">
                        Support Query Submitted!
                      </h4>
                      <p className="text-sm text-emerald-800">
                        Reference Ticket ID:{' '}
                        <span className="font-mono font-bold">{submittedTicketId}</span>
                      </p>
                      <button
                        type="button"
                        onClick={() => setSubmittedTicketId('')}
                        className="aicte-pill-btn px-6"
                      >
                        Submit Another Query
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSupportSubmit} className="space-y-4">
                      <p className="text-xs sm:text-sm text-slate-600">
                        Submit approval or technical queries directly to our Centralized Support
                        Database.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          required
                          value={supportForm.name}
                          onChange={(e) =>
                            setSupportForm({ ...supportForm, name: e.target.value })
                          }
                          className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                          placeholder="Full Name *"
                        />
                        <input
                          type="email"
                          required
                          value={supportForm.email}
                          onChange={(e) =>
                            setSupportForm({ ...supportForm, email: e.target.value })
                          }
                          className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                          placeholder="Email Address *"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <select
                          value={supportForm.category}
                          onChange={(e) =>
                            setSupportForm({ ...supportForm, category: e.target.value })
                          }
                          className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                        >
                          <option>Approval Process Query</option>
                          <option>Technical Support</option>
                          <option>Application Status</option>
                          <option>Document Upload Issue</option>
                          <option>Scholarship / Scheme</option>
                        </select>
                        <input
                          type="text"
                          required
                          value={supportForm.subject}
                          onChange={(e) =>
                            setSupportForm({ ...supportForm, subject: e.target.value })
                          }
                          className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                          placeholder="Subject *"
                        />
                      </div>
                      <textarea
                        rows={4}
                        required
                        value={supportForm.message}
                        onChange={(e) =>
                          setSupportForm({ ...supportForm, message: e.target.value })
                        }
                        className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                        placeholder="Describe your query in detail..."
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveModal(null)}
                          className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={submittingSupport}
                          className="aicte-pill-btn px-6"
                        >
                          {submittingSupport ? 'Submitting...' : 'Submit Query'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {activeModal === 'faq' && (
                <div className="space-y-3">
                  {faqs.map((faq) => (
                    <div
                      key={faq.id}
                      className="rounded-md border border-slate-200 bg-slate-50 p-4 space-y-1.5"
                    >
                      <span className="inline-block rounded bg-blue-100 px-2 py-0.5 text-[11px] font-bold text-[#0B3B8C]">
                        {faq.category}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">{faq.question}</h4>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {activeModal === 'helpline' && (
                <div className="space-y-4 text-sm text-slate-700">
                  <div className="rounded-md bg-[#E8F3FC] border border-blue-200 p-4 flex items-start gap-3">
                    <PhoneCall className="h-5 w-5 text-[#0B3B8C] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-[#0B3B8C]">
                        Technical Helpline Numbers (Demo)
                      </p>
                      <p className="text-xs mt-1">
                        Phone:{' '}
                        <strong>
                          (011) 29581333, 29581338, 29581342{' '}
                          {portalSettings?.helplineNumber ? `/ ${portalSettings.helplineNumber}` : ''}
                        </strong>
                      </p>
                      <p className="text-xs mt-0.5">
                        Email:{' '}
                        <strong>
                          {portalSettings?.supportEmail || 'helpdesk-demo@aicte-portal.edu'}
                        </strong>
                      </p>
                      <p className="text-xs mt-0.5">
                        Timings: Monday to Friday, 09:30 AM – 06:00 PM IST
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeModal === 'vc' && (
                <div className="space-y-4 text-sm text-slate-700">
                  <p className="leading-relaxed">
                    The Information Facilitation Center conducts Live Video Conferencing sessions
                    Monday through Friday to support Institutions and Students with Approval Process
                    2026–27 queries.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="rounded border border-slate-200 bg-slate-50 p-3.5">
                      <p className="font-bold text-[#0B3B8C]">Morning Technical Session</p>
                      <p className="mt-1">10:30 AM – 01:00 PM IST</p>
                      <p className="text-slate-500 mt-1">Demo Room: VC-AICTE-2026-A</p>
                    </div>
                    <div className="rounded border border-slate-200 bg-slate-50 p-3.5">
                      <p className="font-bold text-[#0B3B8C]">Afternoon Student & Grievance Desk</p>
                      <p className="mt-1">02:30 PM – 05:00 PM IST</p>
                      <p className="text-slate-500 mt-1">Demo Room: VC-AICTE-2026-B</p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setSubmittedTicketId('');
                        setActiveModal('support');
                      }}
                      className="aicte-pill-btn px-6"
                    >
                      Submit Online Support Query
                    </button>
                  </div>
                </div>
              )}

              {activeModal === 'unapproved' && (
                <div className="space-y-4 text-sm text-slate-700">
                  <p className="leading-relaxed">
                    Students and parents are advised to verify AICTE approval status before enrolling
                    in technical institutions. Download the sample advisory PDF or browse the
                    searchable list online.
                  </p>
                  <div className="flex flex-wrap justify-end gap-2">
                    <Link
                      to="/institutions?tab=unapproved"
                      className="rounded-full border border-[#0B3B8C] px-5 py-2 text-xs font-bold text-[#0B3B8C] hover:bg-blue-50"
                    >
                      View List Online
                    </Link>
                    <a
                      href={publicService.getDocumentDownloadUrl('unapproved-institutions-list')}
                      target="_blank"
                      rel="noreferrer"
                      className="aicte-pill-btn px-6 py-2"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download Unapproved List PDF</span>
                    </a>
                  </div>
                </div>
              )}

              {activeModal === 'calendar' && (
                <div className="space-y-4">
                  <table className="w-full text-xs sm:text-sm border border-slate-200">
                    <thead className="bg-[#0B3B8C] text-white">
                      <tr>
                        <th className="p-3 text-left">Academic Activity (AY 2026–27)</th>
                        <th className="p-3 text-left">Revised Target Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="p-3 font-medium">
                          Last Date for Grant of Approval (EoA) to Technical Institutions
                        </td>
                        <td className="p-3 font-bold text-[#0B3B8C]">30 April 2026</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-medium">
                          Last Date for Grant of Affiliation by Universities / Boards
                        </td>
                        <td className="p-3 font-bold text-[#0B3B8C]">31 May 2026</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-medium">
                          Commencement of Induction & First Year Technical Classes
                        </td>
                        <td className="p-3 font-bold text-[#0B3B8C]">01 August 2026</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-medium">
                          Last Date for Seat Cancellation with Full Fee Refund
                        </td>
                        <td className="p-3 font-bold text-[#0B3B8C]">11 September 2026</td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="flex justify-end">
                    <a
                      href={publicService.getDocumentDownloadUrl('revised-academic-calendar-2026-27')}
                      target="_blank"
                      rel="noreferrer"
                      className="aicte-pill-btn px-6 py-2"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download Academic Calendar PDF</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </PublicLayout>
  );
}
