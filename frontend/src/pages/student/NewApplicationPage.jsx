import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  FileCheck2,
  FolderUp,
  Save,
  Send,
  Trash2,
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { applicationService } from '../../services/studentService';
import { getErrorMessage } from '../../services/api';
import { ACADEMIC_YEARS, APPLICATION_TYPES, COURSES } from '../../utils/constants';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatFileSize } from '../../utils/formatters';

const STEPS = [
  'Personal Details',
  'Academic Details',
  'Application Details',
  'Document Upload',
  'Review & Submit',
];

const DOC_SLOTS = [
  'Student ID Card',
  'College ID',
  'Academic Marksheet',
  'Supporting Documents',
];

export default function NewApplicationPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');

  const [step, setStep] = useState(0);
  const [loadingDraft, setLoadingDraft] = useState(Boolean(editId));
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const [personalDetails, setPersonalDetails] = useState({
    fullName: user?.name || '',
    enrollmentNumber: user?.enrollmentNumber || '',
    dateOfBirth: '',
    gender: 'Male',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
  });

  const [academicDetails, setAcademicDetails] = useState({
    college: user?.college || '',
    university: user?.university || '',
    course: user?.course || 'B.Tech',
    branch: user?.branch || '',
    semester: '6th Semester',
    academicYear: user?.academicYear || '2026-27',
    admissionYear: '2023',
  });

  const [appDetails, setAppDetails] = useState({
    applicationType: APPLICATION_TYPES[0],
    title: '',
    description: '',
    reason: '',
  });

  // Files selected before creation OR already saved on draft
  const [pendingFiles, setPendingFiles] = useState([]); // [{ file, docType }]
  const [existingDocs, setExistingDocs] = useState([]);

  useEffect(() => {
    if (!editId) return;
    setLoadingDraft(true);
    applicationService
      .getApplicationById(editId)
      .then((res) => {
        const app = res.application;
        if (app.status !== 'Draft') {
          toast.error('Submitted applications cannot be edited.');
          navigate('/student/applications');
          return;
        }
        setPersonalDetails((prev) => ({ ...prev, ...(app.personalDetails || {}) }));
        setAcademicDetails((prev) => ({ ...prev, ...(app.academicDetails || {}) }));
        setAppDetails({
          applicationType: app.applicationType || APPLICATION_TYPES[0],
          title: app.title || '',
          description: app.description || '',
          reason: app.reason || '',
        });
        setExistingDocs(app.documents || []);
      })
      .catch((err) => {
        toast.error(getErrorMessage(err));
        navigate('/student/applications');
      })
      .finally(() => setLoadingDraft(false));
  }, [editId, navigate]);

  const validateStep = (targetStep) => {
    if (targetStep === 0) {
      if (!personalDetails.fullName || !personalDetails.email || !personalDetails.phone) {
        toast.error('Full Name, Email, and Mobile Number are required.');
        return false;
      }
    }
    if (targetStep === 1) {
      if (!academicDetails.college || !academicDetails.course) {
        toast.error('College Name and Course are required.');
        return false;
      }
    }
    if (targetStep === 2) {
      if (!appDetails.applicationType || !appDetails.title.trim()) {
        toast.error('Application Type and Application Title are required.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };

  const handleFileSelect = (docType, file) => {
    if (!file) return;
    const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowed.includes(file.type)) {
      toast.error('Only PDF, JPG, and PNG files are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be 5 MB or less.');
      return;
    }
    setPendingFiles((prev) => [
      ...prev.filter((item) => item.docType !== docType),
      { docType, file },
    ]);
    toast.success(`${file.name} queued for upload (${docType}).`);
  };

  const removePendingFile = (docType) => {
    setPendingFiles((prev) => prev.filter((item) => item.docType !== docType));
  };

  const handleRemoveExistingDoc = async (filename) => {
    if (!editId) return;
    try {
      const res = await applicationService.deleteDocument(editId, filename);
      setExistingDocs(res.application.documents || []);
      toast.success('Document removed.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handlePersist = async (saveAsDraft) => {
    if (!appDetails.title.trim()) {
      toast.error('Please enter an Application Title (Step 3) before saving.');
      setStep(2);
      return;
    }

    if (!saveAsDraft) {
      if (!validateStep(0) || !validateStep(1) || !validateStep(2)) return;
      if (!confirmed) {
        toast.error('Please tick the confirmation checkbox before submitting.');
        return;
      }
    }

    setSubmitting(true);
    try {
      let targetAppId = editId;

      if (editId) {
        // First update draft fields (keep as draft until docs upload if submitting)
        await applicationService.updateDraft(editId, {
          personalDetails,
          academicDetails,
          ...appDetails,
          submitNow: pendingFiles.length === 0 ? !saveAsDraft : false,
        });
      } else {
        // Create initially as Draft if files need uploading first, else directly as Draft/Submitted
        const createDraftFirst = pendingFiles.length > 0 ? true : saveAsDraft;
        const created = await applicationService.createApplication({
          personalDetails,
          academicDetails,
          ...appDetails,
          saveAsDraft: createDraftFirst,
        });
        targetAppId = created.application._id;
      }

      // Upload queued documents if any
      for (const item of pendingFiles) {
        await applicationService.uploadDocument(targetAppId, item.file, item.docType);
      }

      // If submitting and we had pending files (so it was saved as draft temporarily), submit now!
      if (!saveAsDraft && pendingFiles.length > 0) {
        await applicationService.submitDraft(targetAppId);
      }

      toast.success(
        saveAsDraft
          ? 'Application saved as Draft successfully!'
          : 'Application submitted successfully!'
      );
      navigate('/student/applications');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingDraft) {
    return (
      <DashboardLayout role="student" title="Edit Draft Application">
        <LoadingSpinner label="Loading draft details..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      role="student"
      title={editId ? 'Edit Draft Application' : 'New Application'}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Stepper Bar */}
        <div className="bg-white rounded-lg border border-[#D4E2F1] p-4 shadow-xs">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {STEPS.map((label, idx) => {
              const active = idx === step;
              const done = idx < step;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => idx <= step && setStep(idx)}
                  className={`flex items-center gap-2 rounded-md p-2 text-left text-xs font-semibold transition ${
                    active
                      ? 'bg-[#0B2C6F] text-white'
                      : done
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-50 text-slate-500'
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                      active
                        ? 'bg-[#F37021] text-white'
                        : done
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {done ? <Check className="h-3 w-3" /> : idx + 1}
                  </span>
                  <span className="truncate">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg border border-[#D4E2F1] p-6 shadow-xs space-y-5">
          {step === 0 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-[#0B2C6F] border-b pb-2">
                Step 1: Personal Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={personalDetails.fullName}
                    onChange={(e) =>
                      setPersonalDetails({ ...personalDetails, fullName: e.target.value })
                    }
                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Enrollment Number *
                  </label>
                  <input
                    type="text"
                    value={personalDetails.enrollmentNumber}
                    onChange={(e) =>
                      setPersonalDetails({
                        ...personalDetails,
                        enrollmentNumber: e.target.value,
                      })
                    }
                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={personalDetails.dateOfBirth}
                    onChange={(e) =>
                      setPersonalDetails({ ...personalDetails, dateOfBirth: e.target.value })
                    }
                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Gender
                  </label>
                  <select
                    value={personalDetails.gender}
                    onChange={(e) =>
                      setPersonalDetails({ ...personalDetails, gender: e.target.value })
                    }
                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={personalDetails.email}
                    onChange={(e) =>
                      setPersonalDetails({ ...personalDetails, email: e.target.value })
                    }
                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    value={personalDetails.phone}
                    onChange={(e) =>
                      setPersonalDetails({ ...personalDetails, phone: e.target.value })
                    }
                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Address
                  </label>
                  <textarea
                    rows={2}
                    value={personalDetails.address}
                    onChange={(e) =>
                      setPersonalDetails({ ...personalDetails, address: e.target.value })
                    }
                    placeholder="Residential correspondence address"
                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-[#0B2C6F] border-b pb-2">
                Step 2: Academic Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    College Name *
                  </label>
                  <input
                    type="text"
                    value={academicDetails.college}
                    onChange={(e) =>
                      setAcademicDetails({ ...academicDetails, college: e.target.value })
                    }
                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    University *
                  </label>
                  <input
                    type="text"
                    value={academicDetails.university}
                    onChange={(e) =>
                      setAcademicDetails({ ...academicDetails, university: e.target.value })
                    }
                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Course *
                  </label>
                  <select
                    value={academicDetails.course}
                    onChange={(e) =>
                      setAcademicDetails({ ...academicDetails, course: e.target.value })
                    }
                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                  >
                    {COURSES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Branch *
                  </label>
                  <input
                    type="text"
                    value={academicDetails.branch}
                    onChange={(e) =>
                      setAcademicDetails({ ...academicDetails, branch: e.target.value })
                    }
                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Semester
                  </label>
                  <input
                    type="text"
                    value={academicDetails.semester}
                    onChange={(e) =>
                      setAcademicDetails({ ...academicDetails, semester: e.target.value })
                    }
                    placeholder="e.g. 6th Semester"
                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Current Academic Year
                  </label>
                  <select
                    value={academicDetails.academicYear}
                    onChange={(e) =>
                      setAcademicDetails({ ...academicDetails, academicYear: e.target.value })
                    }
                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                  >
                    {ACADEMIC_YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Admission Year
                  </label>
                  <input
                    type="text"
                    value={academicDetails.admissionYear}
                    onChange={(e) =>
                      setAcademicDetails({ ...academicDetails, admissionYear: e.target.value })
                    }
                    placeholder="e.g. 2023"
                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-[#0B2C6F] border-b pb-2">
                Step 3: Application Details
              </h3>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Application Type *
                </label>
                <select
                  value={appDetails.applicationType}
                  onChange={(e) =>
                    setAppDetails({ ...appDetails, applicationType: e.target.value })
                  }
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                >
                  {APPLICATION_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Application Title *
                </label>
                <input
                  type="text"
                  value={appDetails.title}
                  onChange={(e) => setAppDetails({ ...appDetails, title: e.target.value })}
                  placeholder="e.g. Pragati Scholarship Application AY 2026-27"
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={appDetails.description}
                  onChange={(e) =>
                    setAppDetails({ ...appDetails, description: e.target.value })
                  }
                  placeholder="Provide full context for your application..."
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason for Application
                </label>
                <input
                  type="text"
                  value={appDetails.reason}
                  onChange={(e) => setAppDetails({ ...appDetails, reason: e.target.value })}
                  placeholder="Brief justification or purpose"
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="border-b pb-2">
                <h3 className="text-base font-bold text-[#0B2C6F]">
                  Step 4: Document Upload
                </h3>
                <p className="text-xs text-slate-500">
                  Accepted formats: PDF, JPG, PNG (max 5 MB each).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {DOC_SLOTS.map((slot) => {
                  const queued = pendingFiles.find((p) => p.docType === slot);
                  const existing = existingDocs.find((d) => d.docType === slot);
                  return (
                    <div
                      key={slot}
                      className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 space-y-2"
                    >
                      <p className="text-xs font-bold text-[#0B2C6F]">{slot}</p>
                      {queued ? (
                        <div className="flex items-center justify-between rounded bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs">
                          <span className="truncate font-semibold text-emerald-800">
                            {queued.file.name} ({formatFileSize(queued.file.size)})
                          </span>
                          <button
                            type="button"
                            onClick={() => removePendingFile(slot)}
                            className="text-red-600 hover:text-red-800 ml-2"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : existing ? (
                        <div className="flex items-center justify-between rounded bg-blue-50 border border-blue-200 px-3 py-2 text-xs">
                          <span className="truncate font-semibold text-[#0B2C6F]">
                            Uploaded: {existing.originalName}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveExistingDoc(existing.filename)}
                            className="text-red-600 hover:text-red-800 ml-2"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : null}

                      <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-white border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100">
                        <FolderUp className="h-3.5 w-3.5 text-[#F37021]" />
                        <span>{queued || existing ? 'Replace File' : 'Choose File'}</span>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="hidden"
                          onChange={(e) => handleFileSelect(slot, e.target.files?.[0])}
                        />
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <h3 className="text-base font-bold text-[#0B2C6F] border-b pb-2 flex items-center gap-2">
                <FileCheck2 className="h-5 w-5 text-[#F37021]" />
                <span>Step 5: Review and Submit</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="rounded border border-slate-200 p-4 space-y-1">
                  <p className="font-bold text-[#0B2C6F] mb-1.5">Personal Details</p>
                  <p>
                    <strong>Name:</strong> {personalDetails.fullName}
                  </p>
                  <p>
                    <strong>Enrollment:</strong> {personalDetails.enrollmentNumber}
                  </p>
                  <p>
                    <strong>Email:</strong> {personalDetails.email}
                  </p>
                  <p>
                    <strong>Mobile:</strong> {personalDetails.phone}
                  </p>
                  <p>
                    <strong>DOB / Gender:</strong> {personalDetails.dateOfBirth || '—'} /{' '}
                    {personalDetails.gender}
                  </p>
                  <p>
                    <strong>Address:</strong> {personalDetails.address || '—'}
                  </p>
                </div>

                <div className="rounded border border-slate-200 p-4 space-y-1">
                  <p className="font-bold text-[#0B2C6F] mb-1.5">Academic Details</p>
                  <p>
                    <strong>College:</strong> {academicDetails.college}
                  </p>
                  <p>
                    <strong>University:</strong> {academicDetails.university}
                  </p>
                  <p>
                    <strong>Course:</strong> {academicDetails.course} — {academicDetails.branch}
                  </p>
                  <p>
                    <strong>Semester:</strong> {academicDetails.semester}
                  </p>
                  <p>
                    <strong>Academic Year:</strong> {academicDetails.academicYear} (Admitted:{' '}
                    {academicDetails.admissionYear || '—'})
                  </p>
                </div>
              </div>

              <div className="rounded border border-slate-200 p-4 text-xs space-y-1.5">
                <p className="font-bold text-[#0B2C6F]">Application Details</p>
                <p>
                  <strong>Type:</strong> {appDetails.applicationType}
                </p>
                <p>
                  <strong>Title:</strong> {appDetails.title}
                </p>
                <p>
                  <strong>Description:</strong> {appDetails.description || '—'}
                </p>
                <p>
                  <strong>Reason:</strong> {appDetails.reason || '—'}
                </p>
                <p>
                  <strong>Documents Attached:</strong>{' '}
                  {existingDocs.length + pendingFiles.length} file(s)
                </p>
              </div>

              <label className="flex items-start gap-2.5 rounded-md border border-blue-200 bg-blue-50 p-3.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-[#0B2C6F]"
                />
                <span>
                  I hereby declare that all details entered and documents attached are true and
                  correct. Once submitted, this application will be locked for administrative
                  review.
                </span>
              </label>
            </div>
          )}

          {/* Footer Navigation Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200">
            <div className="flex gap-2">
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </button>
              )}
              <button
                type="button"
                disabled={submitting}
                onClick={() => handlePersist(true)}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#0B2C6F] px-4 py-2 text-xs font-bold text-[#0B2C6F] hover:bg-blue-50 disabled:opacity-60"
              >
                <Save className="h-3.5 w-3.5" />
                <span>{submitting ? 'Saving...' : 'Save as Draft'}</span>
              </button>
            </div>

            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="aicte-btn-orange text-xs py-2 px-5"
              >
                <span>Next Step</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={submitting}
                onClick={() => handlePersist(false)}
                className="aicte-btn-orange text-xs py-2.5 px-6 disabled:opacity-60"
              >
                <Send className="h-4 w-4" />
                <span>{submitting ? 'Submitting...' : 'Submit Application'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
