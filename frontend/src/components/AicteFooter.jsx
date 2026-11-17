import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, AlertCircle } from 'lucide-react';
import { publicService } from '../services/publicService';

export default function AicteFooter() {
  return (
    <footer className="bg-[#081E4A] text-blue-100 border-t-4 border-[#F37021]">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-sm">
        {/* Column 1: About AICTE */}
        <div>
          <h3 className="text-base font-bold text-white mb-3 border-b border-blue-800 pb-2">
            About AICTE (Demo)
          </h3>
          <p className="text-xs leading-relaxed text-blue-200">
            The All India Council for Technical Education (AICTE) is the statutory apex body for
            planning, formulation, and maintenance of norms & standards in technical education
            across India.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              to="/section/about-us"
              className="text-xs font-semibold text-[#FF9B54] hover:underline"
            >
              Read More →
            </Link>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h3 className="text-base font-bold text-white mb-3 border-b border-blue-800 pb-2">
            Quick Links
          </h3>
          <ul className="space-y-2 text-xs">
            <li>
              <Link to="/" className="hover:text-[#FF9B54] transition">
                Approval Process 2026–2027
              </Link>
            </li>
            <li>
              <Link to="/institutions" className="hover:text-[#FF9B54] transition">
                AICTE Approved Institutions Directory
              </Link>
            </li>
            <li>
              <Link to="/login" className="hover:text-[#FF9B54] transition">
                Student Login Portal
              </Link>
            </li>
            <li>
              <Link to="/register" className="hover:text-[#FF9B54] transition">
                New Student Registration
              </Link>
            </li>
            <li>
              <Link to="/admin/login" className="hover:text-[#FF9B54] transition">
                Administrator Login
              </Link>
            </li>
            <li>
              <Link to="/search" className="hover:text-[#FF9B54] transition">
                Global Portal Search
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Important Notifications */}
        <div>
          <h3 className="text-base font-bold text-white mb-3 border-b border-blue-800 pb-2">
            Important Notifications
          </h3>
          <ul className="space-y-2 text-xs">
            <li>
              <a
                href={publicService.getDocumentDownloadUrl('public-notice-2026-27')}
                className="hover:text-[#FF9B54] transition"
              >
                • Public Notice for Approval Process 2026–27 (PDF)
              </a>
            </li>
            <li>
              <a
                href={publicService.getDocumentDownloadUrl('corrigendum-addendum-2026-27')}
                className="hover:text-[#FF9B54] transition"
              >
                • Corrigendum / Addendum 2026–27 (PDF)
              </a>
            </li>
            <li>
              <a
                href={publicService.getDocumentDownloadUrl('aph-handbook-2026-27')}
                className="hover:text-[#FF9B54] transition"
              >
                • Approval Process Handbook (APH)
              </a>
            </li>
            <li>
              <a
                href={publicService.getDocumentDownloadUrl('revised-academic-calendar-2026-27')}
                className="hover:text-[#FF9B54] transition"
              >
                • Revised Academic Calendar 2026–27 (PDF)
              </a>
            </li>
            <li>
              <Link
                to="/institutions?tab=unapproved"
                className="hover:text-[#FF9B54] transition"
              >
                • List of Unapproved Institutions
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 4: Contact Information & Helpdesk */}
        <div>
          <h3 className="text-base font-bold text-white mb-3 border-b border-blue-800 pb-2">
            Contact & Helpdesk
          </h3>
          <ul className="space-y-2.5 text-xs text-blue-200">
            <li className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-[#FF9B54] shrink-0 mt-0.5" />
              <span>Nelson Mandela Marg, Vasant Kunj, New Delhi - 110070 (Reference Info)</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-[#FF9B54] shrink-0" />
              <span>011-29581000 / 1800-11-2428 (Demo)</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-[#FF9B54] shrink-0" />
              <span>helpdesk-demo@aicte-portal.edu</span>
            </li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-3 text-xs">
            <Link to="/helpdesk" className="text-white underline hover:text-[#FF9B54]">
              Helpdesk
            </Link>
            <Link to="/privacy-policy" className="text-white underline hover:text-[#FF9B54]">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-white underline hover:text-[#FF9B54]">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>

      {/* Academic Disclaimer & Copyright Strip */}
      <div className="bg-[#051434] border-t border-blue-900/70">
        <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
          <div className="flex items-start gap-2 rounded bg-blue-950/80 border border-blue-800/80 px-3 py-2 text-xs text-amber-200">
            <AlertCircle className="h-4 w-4 text-[#F37021] shrink-0 mt-0.5" />
            <p>
              <strong>Academic Project Disclaimer:</strong> This website is an independent academic
              demonstration project built solely for educational purposes. It is NOT an official
              website of the All India Council for Technical Education (AICTE) or the Government of
              India. All sample notices, PDFs, and institution entries are demonstration data.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-blue-300 pt-1">
            <p>
              © {new Date().getFullYear()} AICTE Portal Clone — Academic Major Project. All Rights
              Reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link to="/privacy-policy" className="hover:text-white">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-white">
                Terms and Conditions
              </Link>
              <Link to="/helpdesk" className="hover:text-white">
                Helpdesk
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
