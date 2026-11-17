import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Building2, Download, Search, ShieldAlert, ShieldCheck } from 'lucide-react';
import PublicLayout from '../layouts/PublicLayout';
import { publicService } from '../services/publicService';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

export default function InstitutionsDirectoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'unapproved' ? 'unapproved' : 'approved';

  const [tab, setTab] = useState(initialTab);
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('All');
  const [states, setStates] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTab(searchParams.get('tab') === 'unapproved' ? 'unapproved' : 'approved');
  }, [searchParams]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    publicService
      .getInstitutions({ type: tab, search, state: stateFilter })
      .then((data) => {
        if (!active) return;
        setInstitutions(data.institutions || []);
        if (data.states) setStates(data.states);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [tab, search, stateFilter]);

  const switchTab = (nextTab) => {
    setTab(nextTab);
    setSearchParams(nextTab === 'unapproved' ? { tab: 'unapproved' } : {});
  };

  return (
    <PublicLayout>
      <div className="aicte-sky-hero border-b border-sky-200 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-semibold text-[#0B2C6F]/80 mb-2">
            <Link to="/" className="hover:underline">
              Home
            </Link>{' '}
            &gt; Institutions Directory
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B2C6F]">
            AICTE Approved & Unapproved Institutions Directory
          </h2>
          <p className="mt-1 text-sm text-slate-700">
            Verify institutional Extension of Approval (EoA) status or review public caution
            notices for Academic Year 2026–27 (Demonstration Dataset).
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex rounded-lg border border-slate-200 bg-white p-1">
            <button
              type="button"
              onClick={() => switchTab('approved')}
              className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-xs sm:text-sm font-bold transition ${
                tab === 'approved'
                  ? 'bg-[#0B2C6F] text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Approved Institutions</span>
            </button>
            <button
              type="button"
              onClick={() => switchTab('unapproved')}
              className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-xs sm:text-sm font-bold transition ${
                tab === 'unapproved'
                  ? 'bg-red-700 text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <ShieldAlert className="h-4 w-4" />
              <span>Unapproved Institutions List</span>
            </button>
          </div>

          {tab === 'unapproved' && (
            <a
              href={publicService.getDocumentDownloadUrl('unapproved-institutions-list')}
              target="_blank"
              rel="noreferrer"
              className="aicte-btn-orange text-xs"
            >
              <Download className="h-4 w-4" />
              <span>Download Advisory PDF</span>
            </a>
          )}
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-md border border-slate-200 p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by institute name, city, state, or AISHE code..."
              className="w-full rounded border border-slate-300 pl-9 pr-3 py-2 text-sm focus:border-[#0B2C6F] focus:outline-none"
            />
          </div>
          {tab === 'approved' && (
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="rounded border border-slate-300 px-3 py-2 text-sm focus:border-[#0B2C6F] focus:outline-none"
            >
              <option value="All">All States / UTs</option>
              {states.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          )}
        </div>

        {loading ? (
          <LoadingSpinner label="Loading institutions directory..." />
        ) : institutions.length === 0 ? (
          <EmptyState
            title="No matching institutions found"
            description="Try clearing your search filter or switching tabs."
          />
        ) : tab === 'approved' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {institutions.map((inst) => (
              <div
                key={inst.aisheId}
                className="bg-white rounded-md border border-[#D4E2F1] p-5 shadow-xs space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <Building2 className="h-5 w-5 text-[#0B2C6F] shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-base font-bold text-[#0B2C6F]">{inst.name}</h3>
                      <p className="text-xs text-slate-500">
                        {inst.city}, {inst.state} • {inst.type}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 shrink-0">
                    {inst.approvalStatus}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <span className="font-semibold text-slate-700">AISHE ID: {inst.aisheId}</span>
                  <span className="text-slate-300">|</span>
                  <span className="font-semibold text-slate-700">
                    Approved Intake: {inst.intake}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {inst.programmes.map((p) => (
                    <span
                      key={p}
                      className="rounded bg-[#E8F3FC] px-2 py-0.5 text-[11px] font-semibold text-[#0B2C6F]"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-md border border-red-200 overflow-hidden shadow-xs">
            <div className="bg-red-50 border-b border-red-200 px-4 py-3 text-xs text-red-900 font-medium">
              Caution Advisory: The entries below are illustrative academic demonstration records
              highlighting the caution format for unapproved technical institutions.
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-600 border-b">
                  <tr>
                    <th className="p-3 text-left">Ref ID</th>
                    <th className="p-3 text-left">Institution Name</th>
                    <th className="p-3 text-left">Location</th>
                    <th className="p-3 text-left">Advisory Remarks</th>
                    <th className="p-3 text-left">Notice Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs sm:text-sm">
                  {institutions.map((item) => (
                    <tr key={item.id} className="hover:bg-red-50/30">
                      <td className="p-3 font-mono font-semibold text-red-700">{item.id}</td>
                      <td className="p-3 font-bold text-slate-800">{item.name}</td>
                      <td className="p-3 text-slate-600">
                        {item.city}, {item.state}
                      </td>
                      <td className="p-3 text-slate-700">{item.remark}</td>
                      <td className="p-3 text-slate-500">{item.noticeDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
