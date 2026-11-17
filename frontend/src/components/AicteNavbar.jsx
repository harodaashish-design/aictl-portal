import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Search, X } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Home', path: '/' },
  {
    label: 'About Us',
    path: '/section/about-us',
    children: [
      { label: 'Council Overview', path: '/section/about-us?tab=overview' },
      { label: 'History & Mandate', path: '/section/about-us?tab=history' },
      { label: 'Leadership & Organization', path: '/section/about-us?tab=leadership' },
    ],
  },
  {
    label: 'NewsRoom',
    path: '/section/newsroom',
    children: [
      { label: 'Press Releases & Notices', path: '/section/newsroom?tab=press' },
      { label: 'Live Announcements', path: '/section/newsroom?tab=announcements' },
    ],
  },
  {
    label: 'Bureaus/Cell',
    path: '/section/bureaus-cell',
    children: [
      { label: 'Approval Bureau', path: '/section/bureaus-cell?tab=approval' },
      { label: 'Policy & Academic Planning', path: '/section/bureaus-cell?tab=policy' },
      { label: 'Regulation & Vigilance Cell', path: '/section/bureaus-cell?tab=regulation' },
    ],
  },
  {
    label: 'Initiatives',
    path: '/section/initiatives',
    children: [
      { label: 'Smart India Hackathon', path: '/section/initiatives?tab=sih' },
      { label: 'SWAYAM & MOOCs', path: '/section/initiatives?tab=swayam' },
      { label: 'NEAT & Internship Portal', path: '/section/initiatives?tab=neat' },
    ],
  },
  {
    label: 'Schemes',
    path: '/section/schemes',
    children: [
      { label: 'Pragati Scholarship Scheme', path: '/section/schemes?tab=pragati' },
      { label: 'Saksham Scholarship Scheme', path: '/section/schemes?tab=saksham' },
      { label: 'Swanath & PG Scholarships', path: '/section/schemes?tab=swanath' },
    ],
  },
  {
    label: 'Education',
    path: '/section/education',
    children: [
      { label: 'Engineering & Technology', path: '/section/education?tab=engineering' },
      { label: 'Management (MBA/PGDM)', path: '/section/education?tab=management' },
      { label: 'Pharmacy & Architecture', path: '/section/education?tab=pharmacy' },
    ],
  },
  {
    label: 'Statistics',
    path: '/section/statistics',
    children: [
      { label: 'Approved Institutions Directory', path: '/institutions' },
      { label: 'Intake & Enrollment Summary', path: '/section/statistics?tab=intake' },
    ],
  },
  {
    label: 'Opportunities',
    path: '/section/opportunities',
    children: [
      { label: 'Student Internships', path: '/section/opportunities?tab=internships' },
      { label: 'Faculty Fellowships & Grants', path: '/section/opportunities?tab=faculty' },
    ],
  },
  {
    label: 'Bulletins',
    path: '/section/bulletins',
    children: [
      { label: 'Approval Process Bulletins 2026–27', path: '/section/bulletins?tab=approval' },
      { label: 'Unapproved Institutions Caution', path: '/institutions?tab=unapproved' },
    ],
  },
];

export default function AicteNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    setSearchOpen(false);
    setMobileOpen(false);
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
  };

  return (
    <nav className="bg-[#0B3B8C] text-white shadow-sm relative z-30" aria-label="Main Navigation">
      <div className="max-w-7xl mx-auto px-4">
        {/* Desktop Navigation Bar — 11 items matching reference screenshot */}
        <div className="hidden lg:flex items-center justify-center">
          <ul className="flex items-center justify-center flex-wrap">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.path);

              return (
                <li
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => setOpenDropdown(item.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <Link
                    to={item.path}
                    className={`block px-3.5 xl:px-4 py-3 text-[13px] font-medium whitespace-nowrap transition-colors ${
                      isActive
                        ? 'bg-[#082B69] text-white font-semibold border-b-2 border-[#F5B81A]'
                        : 'text-white/95 hover:bg-[#134BA8] hover:text-white'
                    }`}
                  >
                    {item.label}
                  </Link>

                  {item.children && openDropdown === item.label && (
                    <div className="absolute left-0 top-full w-60 rounded-b-md border border-slate-200 bg-white text-slate-800 shadow-lg py-1.5 z-40">
                      {item.children.map((sub) => (
                        <Link
                          key={sub.label}
                          to={sub.path}
                          onClick={() => setOpenDropdown(null)}
                          className="block px-4 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-[#0B3B8C]"
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </li>
              );
            })}

            {/* 11th Item: Search */}
            <li>
              <button
                type="button"
                onClick={() => setSearchOpen((prev) => !prev)}
                className="px-3.5 xl:px-4 py-3 text-[13px] font-medium text-white/95 hover:bg-[#134BA8] transition-colors flex items-center gap-1"
              >
                <span>Search</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Mobile Header Strip */}
        <div className="flex lg:hidden items-center justify-between py-2.5">
          <button
            type="button"
            onClick={() => setMobileOpen((p) => !p)}
            className="inline-flex items-center gap-2 rounded px-2.5 py-1.5 text-sm font-semibold hover:bg-[#134BA8]"
            aria-label="Toggle Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            <span>Menu</span>
          </button>

          <button
            type="button"
            onClick={() => setSearchOpen((prev) => !prev)}
            className="inline-flex items-center gap-1.5 rounded bg-[#082B69] px-3 py-1.5 text-xs font-semibold text-white"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Search</span>
          </button>
        </div>
      </div>

      {/* Expandable Search Bar */}
      {searchOpen && (
        <div className="bg-[#082B69] border-t border-blue-800 px-4 py-3">
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-3xl mx-auto flex items-center gap-2"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Approval Process 2026–27 notices, institutions, schemes, FAQs..."
              className="w-full rounded border border-blue-300/40 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#F5B81A]"
              autoFocus
            />
            <button type="submit" className="aicte-pill-btn shrink-0 py-2 px-5">
              Search
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="rounded p-2 text-blue-100 hover:bg-blue-900"
              aria-label="Close Search"
            >
              <X className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#082B69] border-t border-blue-800 px-4 py-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <div key={item.label} className="border-b border-blue-900/50 last:border-0 pb-1">
              <Link
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className="block py-2 text-sm font-semibold text-white hover:text-[#F5B81A]"
              >
                {item.label}
              </Link>
              {item.children && (
                <div className="pl-3 pb-1 space-y-1">
                  {item.children.map((sub) => (
                    <Link
                      key={sub.label}
                      to={sub.path}
                      onClick={() => setMobileOpen(false)}
                      className="block py-1 text-xs text-blue-200 hover:text-white"
                    >
                      • {sub.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </nav>
  );
}
