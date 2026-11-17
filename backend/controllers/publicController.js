const { Announcement, PortalSetting, SupportQuery } = require('../models');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { isValidEmail } = require('../utils/validators');
const { streamPublicDocumentPdf } = require('../services/pdfService');

const APPROVED_INSTITUTIONS = [
  {
    aisheId: 'C-34011',
    name: 'Delhi Technological Institute of Engineering',
    state: 'Delhi',
    city: 'New Delhi',
    type: 'Government / State University',
    programmes: ['B.Tech', 'M.Tech', 'MCA'],
    approvalStatus: 'EoA Approved (2026–27)',
    intake: 1260,
  },
  {
    aisheId: 'C-41208',
    name: 'National Institute of Applied Sciences, Pune',
    state: 'Maharashtra',
    city: 'Pune',
    type: 'Private Aided',
    programmes: ['B.E.', 'M.E.', 'MBA'],
    approvalStatus: 'EoA Approved (2026–27)',
    intake: 960,
  },
  {
    aisheId: 'C-19832',
    name: 'Bengaluru Institute of Emerging Technology',
    state: 'Karnataka',
    city: 'Bengaluru',
    type: 'Private Unaided',
    programmes: ['B.Tech', 'MBA', 'MCA'],
    approvalStatus: 'EoA Approved (2026–27)',
    intake: 840,
  },
  {
    aisheId: 'C-27541',
    name: 'Chennai Institute of Polytechnic & Engineering',
    state: 'Tamil Nadu',
    city: 'Chennai',
    type: 'Autonomous Institution',
    programmes: ['B.E.', 'Diploma', 'B.Pharm'],
    approvalStatus: 'EoA Approved (2026–27)',
    intake: 1080,
  },
  {
    aisheId: 'C-11805',
    name: 'Lucknow College of Technical & Management Studies',
    state: 'Uttar Pradesh',
    city: 'Lucknow',
    type: 'University Department',
    programmes: ['B.Tech', 'MBA', 'PGDM'],
    approvalStatus: 'EoA Approved (2026–27)',
    intake: 720,
  },
  {
    aisheId: 'C-50914',
    name: 'Ahmedabad Institute of Architecture & Planning',
    state: 'Gujarat',
    city: 'Ahmedabad',
    type: 'Government Aided',
    programmes: ['B.Arch', 'M.Plan', 'B.Des'],
    approvalStatus: 'EoA Approved (2026–27)',
    intake: 420,
  },
];

const UNAPPROVED_INSTITUTIONS = [
  {
    id: 'UNAPP-01',
    name: 'Apex Tech Academy (Sample Demonstration Record)',
    state: 'Haryana',
    city: 'Gurugram',
    remark: 'Operating engineering diploma without AICTE Extension of Approval (Demo Advisory)',
    noticeDate: '2026-02-12',
  },
  {
    id: 'UNAPP-02',
    name: 'Global Horizon Institute of Engineering & Mgmt (Sample Demo)',
    state: 'Maharashtra',
    city: 'Thane',
    remark: 'Show-cause notice issued for unapproved PGDM intake (Demo Advisory)',
    noticeDate: '2026-02-19',
  },
  {
    id: 'UNAPP-03',
    name: 'Sunrise Polytechnic & Vocational Hub (Sample Demo)',
    state: 'Telangana',
    city: 'Hyderabad',
    remark: 'No valid EoA for Academic Year 2026–27 (Demo Advisory)',
    noticeDate: '2026-03-01',
  },
  {
    id: 'UNAPP-04',
    name: 'Metro City School of Applied Tech (Sample Demo)',
    state: 'West Bengal',
    city: 'Kolkata',
    remark: 'Mandatory disclosure & approval verification pending (Demo Advisory)',
    noticeDate: '2026-03-04',
  },
];

const PUBLIC_FAQS = [
  {
    id: 'faq-1',
    category: 'Approval Process 2026–27',
    question: 'Who needs to apply under the AICTE Approval Process 2026–27?',
    answer:
      'All existing AICTE-approved Technical Institutions seeking Extension of Approval (EoA), increase/reduction in intake, or new courses, as well as new promoting bodies applying to establish technical institutions for AY 2026–27.',
  },
  {
    id: 'faq-2',
    category: 'Student Services',
    question: 'How can students apply for AICTE schemes, verification NOC, or scholarships?',
    answer:
      'Students can register via the Student Registration page, sign in to the Student Dashboard, and submit a multi-step application with supporting documents (PDF/JPG/PNG).',
  },
  {
    id: 'faq-3',
    category: 'Document Upload',
    question: 'What document formats and file sizes are supported on the portal?',
    answer:
      'The portal accepts PDF, JPG, and PNG documents up to 5 MB per file. Students can preview or download uploaded documents anytime from their dashboard.',
  },
  {
    id: 'faq-4',
    category: 'Verification',
    question: 'How do I check whether a technical college is AICTE approved?',
    answer:
      'Use the AICTE Approved Universities/Institutions Directory or review the List of Unapproved Institutions caution notice published on the portal.',
  },
  {
    id: 'faq-5',
    category: 'Technical Support',
    question: 'How can I join the Information Facilitation Center Live Video Conferencing?',
    answer:
      'Live Video Conferencing sessions are conducted Monday to Friday (10:00 AM – 5:00 PM IST). Check the Facilitation Center panel on the homepage for meeting slots and technical support links.',
  },
];

const getHomepageData = asyncHandler(async (req, res) => {
  const announcements = await Announcement.find({ isActive: true }).sort({
    publishDate: -1,
    createdAt: -1,
  });
  const settings = await PortalSetting.findOne({ key: 'portal_config' });

  res.json({
    success: true,
    announcements,
    portalSettings: settings || {
      academicYear: '2026-27',
      applicationsOpen: true,
      supportEmail: 'helpdesk-demo@aicte-portal.edu',
      helplineNumber: '011-29581000 / 1800-11-2428 (Demo)',
    },
    faqs: PUBLIC_FAQS,
  });
});

const downloadPublicDocument = (req, res, next) => {
  const { slug } = req.params;
  const streamed = streamPublicDocumentPdf(slug, res);
  if (!streamed) {
    return next(new AppError('Requested public document was not found.', 404));
  }
};

const getInstitutions = asyncHandler(async (req, res) => {
  const { type = 'approved', search = '', state = 'All' } = req.query;
  const q = search.trim().toLowerCase();

  if (type === 'unapproved') {
    let list = UNAPPROVED_INSTITUTIONS;
    if (q) {
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.state.toLowerCase().includes(q) ||
          i.city.toLowerCase().includes(q)
      );
    }
    return res.json({ success: true, institutions: list });
  }

  let list = APPROVED_INSTITUTIONS;
  if (state && state !== 'All') {
    list = list.filter((i) => i.state === state);
  }
  if (q) {
    list = list.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.city.toLowerCase().includes(q) ||
        i.state.toLowerCase().includes(q) ||
        i.aisheId.toLowerCase().includes(q)
    );
  }

  const states = Array.from(new Set(APPROVED_INSTITUTIONS.map((i) => i.state))).sort();
  res.json({ success: true, institutions: list, states });
});

const searchPortal = asyncHandler(async (req, res) => {
  const q = (req.query.q || '').trim().toLowerCase();
  const announcements = await Announcement.find({ isActive: true });

  const staticSections = [
    {
      title: 'Public Notice for Approval Process 2026–27',
      type: 'Approval Notice',
      description: 'Official notice inviting EoA & new institution applications for AY 2026–27.',
      link: '/?highlight=public-notice',
    },
    {
      title: 'Corrigendum / Addendum for Approval Process 2026–27',
      type: 'Corrigendum',
      description: 'Clarifications on intake variations, supernumerary seats and APH 2024–2027.',
      link: '/?highlight=corrigendum',
    },
    {
      title: 'Approval Process Handbook (APH) & Guidelines',
      type: 'Handbook',
      description: 'Norms, infrastructure standards, faculty ratios and mandatory disclosures.',
      link: '/?highlight=aph',
    },
    {
      title: 'Revised Academic Calendar 2026–27',
      type: 'Calendar',
      description: 'Important deadlines for EoA grant, seat refund, and commencement of classes.',
      link: '/?highlight=calendar',
    },
    {
      title: 'Pragati & Saksham Scholarship Schemes',
      type: 'Scheme',
      description: 'Financial assistance schemes for girl students and differently-abled students.',
      link: '/section/schemes',
    },
    {
      title: 'Smart India Hackathon & SWAYAM Initiatives',
      type: 'Initiative',
      description: 'National innovation, MOOC credit transfer, and internship portals.',
      link: '/section/initiatives',
    },
  ];

  const matchedSections = q
    ? staticSections.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.type.toLowerCase().includes(q)
      )
    : staticSections;

  const matchedAnnouncements = q
    ? announcements.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q)
      )
    : announcements;

  const matchedInstitutions = q
    ? APPROVED_INSTITUTIONS.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.city.toLowerCase().includes(q) ||
          i.state.toLowerCase().includes(q)
      )
    : APPROVED_INSTITUTIONS;

  const matchedFaqs = q
    ? PUBLIC_FAQS.filter(
        (f) => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q)
      )
    : PUBLIC_FAQS;

  res.json({
    success: true,
    query: req.query.q || '',
    results: {
      sections: matchedSections,
      announcements: matchedAnnouncements,
      institutions: matchedInstitutions,
      faqs: matchedFaqs,
    },
  });
});

const submitPublicSupportQuery = asyncHandler(async (req, res, next) => {
  const { name, email, category, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    return next(new AppError('Name, email, subject and message are required.', 400));
  }
  if (!isValidEmail(email)) {
    return next(new AppError('Please enter a valid email address.', 400));
  }

  const ticketId = `SUP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const ticket = await SupportQuery.create({
    ticketId,
    name: String(name).trim(),
    email: String(email).trim().toLowerCase(),
    category: category || 'Approval Process Query',
    subject: String(subject).trim(),
    message: String(message).trim(),
    status: 'Open',
  });

  res.status(201).json({
    success: true,
    message: `Query submitted successfully. Reference Ticket ID: ${ticketId}`,
    ticket,
  });
});

module.exports = {
  getHomepageData,
  downloadPublicDocument,
  getInstitutions,
  searchPortal,
  submitPublicSupportQuery,
};
