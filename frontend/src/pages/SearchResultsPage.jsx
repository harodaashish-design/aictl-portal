import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, FileText, Building2, Bell, HelpCircle } from 'lucide-react';
import PublicLayout from '../layouts/PublicLayout';
import { publicService } from '../services/publicService';
import LoadingSpinner from '../components/LoadingSpinner';

export default function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [queryInput, setQueryInput] = useState(initialQuery);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = searchParams.get('q') || '';
    setQueryInput(q);
    setLoading(true);
    publicService
      .searchPortal(q)
      .then((data) => setResults(data.results))
      .finally(() => setLoading(false));
  }, [searchParams]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSearchParams(queryInput.trim() ? { q: queryInput.trim() } : {});
  };

  return (
    <PublicLayout>
      <div className="aicte-sky-hero border-b border-sky-200 py-8 px-4">
        <div className="max-w-5xl mx-auto space-y-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B2C6F]">
            Search AICTE Portal
          </h2>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                placeholder="Search notices, institutions, schemes, announcements, FAQs..."
                className="w-full rounded-full border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-sm focus:border-[#0B2C6F] focus:outline-none shadow-xs"
              />
            </div>
            <button type="submit" className="aicte-btn-orange px-6">
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {loading ? (
          <LoadingSpinner label="Searching portal records..." />
        ) : results ? (
          <>
            <div className="bg-white rounded-md border border-slate-200 p-5 space-y-3">
              <h3 className="text-base font-bold text-[#0B2C6F] flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#F37021]" />
                <span>Approval Notices & Sections ({results.sections.length})</span>
              </h3>
              {results.sections.length === 0 ? (
                <p className="text-xs text-slate-500">No matching notices.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {results.sections.map((s) => (
                    <div key={s.title} className="py-2.5 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-slate-800">{s.title}</p>
                        <p className="text-xs text-slate-600">{s.description}</p>
                      </div>
                      <Link
                        to={s.link}
                        className="text-xs font-bold text-[#F37021] hover:underline shrink-0"
                      >
                        Open →
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-md border border-slate-200 p-5 space-y-3">
              <h3 className="text-base font-bold text-[#0B2C6F] flex items-center gap-2">
                <Bell className="h-4 w-4 text-[#F37021]" />
                <span>Announcements ({results.announcements.length})</span>
              </h3>
              {results.announcements.length === 0 ? (
                <p className="text-xs text-slate-500">No matching announcements.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {results.announcements.map((a) => (
                    <div key={a._id} className="py-2.5">
                      <p className="text-sm font-bold text-slate-800">{a.title}</p>
                      <p className="text-xs text-slate-600">{a.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-md border border-slate-200 p-5 space-y-3">
              <h3 className="text-base font-bold text-[#0B2C6F] flex items-center gap-2">
                <Building2 className="h-4 w-4 text-[#F37021]" />
                <span>Approved Institutions ({results.institutions.length})</span>
              </h3>
              {results.institutions.length === 0 ? (
                <p className="text-xs text-slate-500">No matching institutions.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {results.institutions.map((i) => (
                    <div key={i.aisheId} className="py-2.5 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-800">{i.name}</p>
                        <p className="text-xs text-slate-500">
                          {i.city}, {i.state} • {i.programmes.join(', ')}
                        </p>
                      </div>
                      <Link
                        to="/institutions"
                        className="text-xs font-bold text-[#0B2C6F] hover:underline"
                      >
                        Directory →
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-md border border-slate-200 p-5 space-y-3">
              <h3 className="text-base font-bold text-[#0B2C6F] flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-[#F37021]" />
                <span>FAQs ({results.faqs.length})</span>
              </h3>
              {results.faqs.length === 0 ? (
                <p className="text-xs text-slate-500">No matching FAQs.</p>
              ) : (
                <div className="space-y-2.5">
                  {results.faqs.map((f) => (
                    <div key={f.id} className="rounded bg-slate-50 p-3">
                      <p className="text-sm font-bold text-slate-800">{f.question}</p>
                      <p className="text-xs text-slate-600 mt-1">{f.answer}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </PublicLayout>
  );
}
