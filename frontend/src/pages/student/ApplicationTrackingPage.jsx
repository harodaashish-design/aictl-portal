import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, Circle, Clock, FileCheck, XCircle } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { applicationService } from '../../services/studentService';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { formatDateTime } from '../../utils/formatters';

export default function ApplicationTrackingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [applications, setApplications] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    applicationService
      .getMyApplications({})
      .then((res) => {
        const list = res.applications || [];
        setApplications(list);
        const paramId = searchParams.get('id');
        if (paramId) {
          const found = list.find(
            (a) => a.applicationId === paramId || a._id === paramId
          );
          setSelected(found || list[0] || null);
        } else {
          setSelected(list[0] || null);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSelectChange = (appId) => {
    const found = applications.find((a) => a.applicationId === appId);
    setSelected(found || null);
    if (found) setSearchParams({ id: found.applicationId });
  };

  // Compute canonical 4-step progress timeline dynamically from real DB status
  const getTimelineSteps = (app) => {
    const status = app.status;
    const isSubmitted = ['Submitted', 'Under Review', 'Approved', 'Rejected'].includes(status);
    const isUnderReview = ['Under Review', 'Approved', 'Rejected'].includes(status);
    const isDecided = ['Approved', 'Rejected'].includes(status);

    const findEntry = (s) => (app.timeline || []).find((t) => t.status === s);

    return [
      {
        title: '1. Application Created',
        done: true,
        active: status === 'Draft',
        timestamp: findEntry('Draft')?.timestamp || app.createdAt,
        note: findEntry('Draft')?.note || 'Application initialized in portal.',
      },
      {
        title: '2. Application Submitted',
        done: isSubmitted,
        active: status === 'Submitted',
        timestamp: findEntry('Submitted')?.timestamp || app.submittedAt,
        note: isSubmitted
          ? findEntry('Submitted')?.note || 'Submitted by student for verification.'
          : 'Awaiting student submission.',
      },
      {
        title: '3. Under Administrative Review',
        done: isUnderReview,
        active: status === 'Under Review',
        timestamp: findEntry('Under Review')?.timestamp,
        note: isUnderReview
          ? findEntry('Under Review')?.note || 'Reviewed by AICTE Admin Officer.'
          : 'Pending review assignment.',
      },
      {
        title:
          status === 'Rejected'
            ? '4. Application Rejected'
            : status === 'Approved'
            ? '4. Application Approved'
            : '4. Application Approved / Rejected',
        done: isDecided,
        rejected: status === 'Rejected',
        active: isDecided,
        timestamp:
          findEntry('Approved')?.timestamp || findEntry('Rejected')?.timestamp,
        note: isDecided
          ? app.adminRemarks || `Final status recorded as ${status}.`
          : 'Final decision pending.',
      },
    ];
  };

  return (
    <DashboardLayout role="student" title="Application Status Tracking">
      {loading ? (
        <LoadingSpinner label="Loading application tracking timeline..." />
      ) : applications.length === 0 ? (
        <EmptyState
          title="No applications to track"
          description="Submit an application first to view real-time administrative tracking."
          action={
            <Link to="/student/new-application" className="aicte-btn-orange text-xs">
              Create Application
            </Link>
          }
        />
      ) : (
        <div className="space-y-6">
          {/* Application Selector */}
          <div className="bg-white rounded-lg border border-[#D4E2F1] p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <label className="text-xs font-bold text-[#0B2C6F] uppercase">
              Select Application to Track:
            </label>
            <select
              value={selected?.applicationId || ''}
              onChange={(e) => handleSelectChange(e.target.value)}
              className="rounded border border-slate-300 px-3 py-2 text-sm font-medium focus:border-[#0B2C6F] focus:outline-none sm:min-w-[340px]"
            >
              {applications.map((a) => (
                <option key={a._id} value={a.applicationId}>
                  {a.applicationId} — {a.title} ({a.status})
                </option>
              ))}
            </select>
          </div>

          {selected && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Summary Panel */}
              <div className="bg-white rounded-lg border border-[#D4E2F1] p-5 shadow-xs space-y-4 h-fit">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <span className="font-mono text-sm font-extrabold text-[#0B2C6F]">
                    {selected.applicationId}
                  </span>
                  <StatusBadge status={selected.status} />
                </div>

                <div className="space-y-3 text-xs sm:text-sm">
                  <div>
                    <p className="text-xs text-slate-400">Application Title</p>
                    <p className="font-bold text-slate-800">{selected.title}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Application Type</p>
                    <p className="font-semibold text-slate-700">{selected.applicationType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Submission Date</p>
                    <p className="font-semibold text-slate-700">
                      {selected.submittedAt
                        ? formatDateTime(selected.submittedAt)
                        : 'Not yet submitted'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Last Updated</p>
                    <p className="font-semibold text-slate-700">
                      {formatDateTime(selected.updatedAt)}
                    </p>
                  </div>
                </div>

                <div className="rounded-md border border-slate-200 bg-slate-50 p-3.5 text-xs">
                  <p className="font-bold text-[#0B2C6F] mb-1">Admin Remarks</p>
                  <p className="text-slate-700 leading-relaxed">
                    {selected.adminRemarks || 'No administrative remarks added yet.'}
                  </p>
                </div>
              </div>

              {/* Vertical Progress Timeline */}
              <div className="lg:col-span-2 bg-white rounded-lg border border-[#D4E2F1] p-6 shadow-xs">
                <h3 className="text-base font-bold text-[#0B2C6F] border-b border-slate-100 pb-3 mb-6 flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-[#F37021]" />
                  <span>Vertical Progress Timeline</span>
                </h3>

                <ol className="relative border-l-2 border-slate-200 ml-3.5 space-y-7">
                  {getTimelineSteps(selected).map((stage) => {
                    let Icon = Circle;
                    let iconColors = 'bg-white text-slate-300 border-slate-300';
                    if (stage.rejected) {
                      Icon = XCircle;
                      iconColors = 'bg-red-600 text-white border-red-600';
                    } else if (stage.done && stage.active) {
                      Icon = stage.title.includes('Under Administrative')
                        ? Clock
                        : CheckCircle2;
                      iconColors = stage.title.includes('Under Administrative')
                        ? 'bg-amber-500 text-white border-amber-500'
                        : 'bg-emerald-600 text-white border-emerald-600';
                    } else if (stage.done) {
                      Icon = CheckCircle2;
                      iconColors = 'bg-[#0B2C6F] text-white border-[#0B2C6F]';
                    }

                    return (
                      <li key={stage.title} className="ml-7">
                        <span
                          className={`absolute -left-[15px] flex h-7 w-7 items-center justify-center rounded-full border-2 ${iconColors}`}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <div className="rounded-md border border-slate-200 bg-slate-50/60 p-4">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h4
                              className={`text-sm font-bold ${
                                stage.rejected
                                  ? 'text-red-700'
                                  : stage.done
                                  ? 'text-[#0B2C6F]'
                                  : 'text-slate-400'
                              }`}
                            >
                              {stage.title}
                            </h4>
                            <span className="text-[11px] font-medium text-slate-500">
                              {stage.timestamp ? formatDateTime(stage.timestamp) : 'Pending'}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-600">{stage.note}</p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
