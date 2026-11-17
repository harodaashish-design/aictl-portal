import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowRight, Bell, BookOpen, CheckCircle2, Download, FileText } from 'lucide-react';
import PublicLayout from '../layouts/PublicLayout';
import { publicService } from '../services/publicService';
import { formatDate } from '../utils/formatters';

const SECTION_CONTENT = {
  'about-us': {
    title: 'About AICTE — Council Overview & Statutory Mandate',
    subtitle: 'Planning, Formulation & Maintenance of Norms in Technical Education',
    summary:
      'Set up in November 1945 as a national-level Apex Advisory Body and vested with statutory authority by an Act of Parliament in 1987, AICTE promotes coordinated development of technical education across India.',
    cards: [
      {
        heading: 'Vision & Mission',
        body: 'To be a world-class organization leading technological and socio-economic development of the country by enhancing the global competitiveness of technical manpower.',
      },
      {
        heading: 'Core Statutory Functions',
        body: 'Granting approvals for new technical institutions, conducting surveys, laying down norms and standards, promoting innovation & research, and ensuring quality assurance.',
      },
      {
        heading: 'Leadership & Organization',
        body: 'Headquartered in New Delhi with Regional Offices across the nation overseeing Engineering, Management, Pharmacy, Architecture, and Applied Arts programmes.',
      },
    ],
  },
  newsroom: {
    title: 'AICTE NewsRoom — Public Notices & Announcements',
    subtitle: 'Latest Circulars, Press Releases & Portal Updates',
    summary:
      'Stay updated with real-time official announcements, approval process circulars, and scholarship schedules published by portal administrators.',
    showAnnouncements: true,
    cards: [
      {
        heading: 'Approval Process 2026–27 Window Open',
        body: 'Institutions and students can access updated handbooks, notices, and digital verification services for Academic Session 2026–27.',
      },
      {
        heading: 'Digital Student Services Portal',
        body: 'Students can track scholarship renewals, verification NOCs, and credit equivalence applications online with instant status notifications.',
      },
    ],
  },
  'bureaus-cell': {
    title: 'Bureaus & Specialized Cells',
    subtitle: 'Functional Divisions Driving Technical Education Governance',
    summary:
      'AICTE operates through dedicated Bureaus and specialized Cells responsible for Approvals, Regulation, Policy Planning, Research, and Student Grievances.',
    cards: [
      {
        heading: 'Approval Bureau (AB)',
        body: 'Processes applications for Establishment of New Technical Institutions, Extension of Approval (EoA), and Intake Variations under APH 2024–2027.',
      },
      {
        heading: 'Policy & Academic Planning Bureau',
        body: 'Formulates model curricula, academic calendars, emerging-technology minor degrees, and faculty development policies.',
      },
      {
        heading: 'Regulation & Vigilance Cell',
        body: 'Monitors institutional compliance, publishes advisories regarding unapproved institutions, and handles statutory grievances.',
      },
    ],
  },
  initiatives: {
    title: 'National Initiatives & Innovation Programmes',
    subtitle: 'Empowering Students Through Hackathons, MOOCs & Digital Learning',
    summary:
      'Flagship initiatives bridging academia, industry, and innovation ecosystems across Indian technical institutions.',
    cards: [
      {
        heading: 'Smart India Hackathon (SIH)',
        body: 'Nationwide innovation initiative providing students a platform to solve pressing problems faced by ministries and industry.',
      },
      {
        heading: 'SWAYAM & MOOC Credit Transfer',
        body: 'Enables technical students to earn up to 40% academic credits through certified online courses offered by premier institutes.',
      },
      {
        heading: 'NEAT & National Internship Portal',
        body: 'Connects students with AI-curated EdTech learning tools and verified industry internships across India.',
      },
    ],
  },
  schemes: {
    title: 'Student Scholarship & Development Schemes',
    subtitle: 'Financial Assistance & Merit Support Programmes',
    summary:
      'Eligible students enrolled in AICTE-approved technical degree and diploma institutions can apply for scholarships through the Student Dashboard.',
    cards: [
      {
        heading: 'Pragati Scholarship Scheme for Girl Students',
        body: 'Provides financial assistance of ₹50,000 per annum to meritorious girl students pursuing technical degree or diploma courses.',
      },
      {
        heading: 'Saksham Scholarship Scheme',
        body: 'Supports differently-abled students pursuing technical education in AICTE-approved institutions.',
      },
      {
        heading: 'Swanath & PG (GATE/GPAT) Scholarships',
        body: 'Dedicated assistance for orphaned/ward-of-martyr students and postgraduate technical scholars.',
      },
    ],
  },
  education: {
    title: 'Technical Education Domains',
    subtitle: 'Approved Disciplines & Model Curricula',
    summary:
      'AICTE regulates and nurtures quality technical education across undergraduate, postgraduate, and diploma programmes.',
    cards: [
      {
        heading: 'Engineering & Technology',
        body: 'B.E./B.Tech, M.E./M.Tech, and Diploma programmes with updated tracks in AI, Semiconductors, Robotics, and Sustainable Energy.',
      },
      {
        heading: 'Management & Computer Applications',
        body: 'MBA, PGDM, PGCM, MCA, BCA, and BBA programmes adhering to outcome-based accreditation standards.',
      },
      {
        heading: 'Pharmacy, Architecture & Design',
        body: 'Specialized technical programmes promoting interdisciplinary research and industry readiness.',
      },
    ],
  },
  statistics: {
    title: 'Technical Education Statistics & Overview',
    subtitle: 'Institutional Footprint & Student Capacity Metrics (Demo Summary)',
    summary:
      'Explore national institutional directories and sample statistical indicators for Academic Year 2026–27.',
    cards: [
      {
        heading: 'Approved Institutions Directory',
        body: 'Search verified AICTE-approved engineering, management, pharmacy, and polytechnic colleges state-wise.',
        link: { label: 'Open Institutions Directory', to: '/institutions' },
      },
      {
        heading: '2026–27 Intake Overview',
        body: 'Over 8,900+ technical institutions and 30+ lakh sanctioned seats tracked across UG, PG, and Diploma levels (Illustrative Reference).',
      },
    ],
  },
  opportunities: {
    title: 'Opportunities — Internships, Fellowships & Faculty Grants',
    subtitle: 'Career, Research & Institutional Development Avenues',
    summary:
      'Discover student internships, doctoral fellowships, ATAL Faculty Development Programmes, and institutional modernization grants.',
    cards: [
      {
        heading: 'Student Industry Internships',
        body: 'Students can request AICTE Approval Verification NOC letters from their Student Dashboard for PSU & corporate internships.',
      },
      {
        heading: 'AICTE Doctoral Fellowship (ADF) & ATAL FDP',
        body: 'Research fellowships for full-time PhD scholars and faculty upskilling workshops in emerging technologies.',
      },
    ],
  },
  bulletins: {
    title: 'Official Bulletins, Circulars & Handbooks',
    subtitle: 'Downloadable Documents for Approval Process 2026–27',
    summary:
      'Access generated sample PDF bulletins, handbooks, corrigendums, and revised academic calendars for Academic Year 2026–27.',
    cards: [
      {
        heading: 'Public Notice for Approval Process 2026–27',
        body: 'Download the official public notice circular.',
        downloadSlug: 'public-notice-2026-27',
      },
      {
        heading: 'Approval Process Handbook (APH)',
        body: 'Download the APH 2024–2027 reference handbook PDF.',
        downloadSlug: 'aph-handbook-2026-27',
      },
      {
        heading: 'Revised Academic Calendar 2026–27',
        body: 'Download complete admission & commencement schedule PDF.',
        downloadSlug: 'revised-academic-calendar-2026-27',
      },
    ],
  },
};

export default function InfoSectionPage() {
  const { sectionSlug } = useParams();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab');
  const [announcements, setAnnouncements] = useState([]);

  const section = SECTION_CONTENT[sectionSlug] || SECTION_CONTENT['about-us'];

  useEffect(() => {
    publicService
      .getHomepageData()
      .then((d) => setAnnouncements(d.announcements || []))
      .catch(() => {});
  }, []);

  return (
    <PublicLayout>
      <div className="aicte-sky-hero border-b border-sky-200 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-semibold text-[#0B2C6F]/80 mb-2">
            <Link to="/" className="hover:underline">
              Home
            </Link>{' '}
            &gt; {section.title}
            {activeTab ? ` (${activeTab})` : ''}
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B2C6F]">{section.title}</h2>
          <p className="mt-1 text-sm font-semibold text-[#16469E]">{section.subtitle}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="bg-white rounded-md border border-[#D4E2F1] p-6 shadow-xs">
          <div className="flex items-start gap-3">
            <BookOpen className="h-6 w-6 text-[#F37021] shrink-0 mt-0.5" />
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">{section.summary}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {section.cards.map((card) => (
            <div
              key={card.heading}
              className="bg-white rounded-md border border-[#D4E2F1] p-5 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#F37021] shrink-0" />
                  <h3 className="text-base font-bold text-[#0B2C6F]">{card.heading}</h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{card.body}</p>
              </div>
              {card.downloadSlug && (
                <a
                  href={publicService.getDocumentDownloadUrl(card.downloadSlug)}
                  target="_blank"
                  rel="noreferrer"
                  className="aicte-btn-orange text-xs w-fit"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download PDF</span>
                </a>
              )}
              {card.link && (
                <Link to={card.link.to} className="aicte-btn-orange text-xs w-fit">
                  <span>{card.link.label}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          ))}
        </div>

        {section.showAnnouncements && (
          <div className="bg-white rounded-md border border-[#D4E2F1] p-6 shadow-xs space-y-4">
            <h3 className="text-lg font-bold text-[#0B2C6F] flex items-center gap-2 border-b pb-2">
              <Bell className="h-5 w-5 text-[#F37021]" />
              <span>Live Portal Announcements</span>
            </h3>
            <div className="divide-y divide-slate-200">
              {announcements.map((ann) => (
                <div key={ann._id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="inline-block rounded bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-[#0B2C6F] mr-2">
                      {ann.category}
                    </span>
                    <span className="text-sm font-bold text-slate-900">{ann.title}</span>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1">{ann.description}</p>
                  </div>
                  <span className="text-xs font-medium text-slate-400 shrink-0">
                    {formatDate(ann.publishDate)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-[#E8F3FC] rounded-md border border-blue-200 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-[#0B2C6F] shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-[#0B2C6F]">
                Looking to apply for a Student Scheme or Verification?
              </h4>
              <p className="text-xs text-slate-700">
                Sign in to the Student Dashboard to create and track applications online.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/login" className="aicte-btn-orange text-xs">
              Student Portal Login
            </Link>
            <Link
              to="/"
              className="rounded-full border border-[#0B2C6F] bg-white px-4 py-2 text-xs font-semibold text-[#0B2C6F] hover:bg-blue-50"
            >
              Back to Homepage
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
