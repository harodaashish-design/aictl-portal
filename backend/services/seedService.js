const bcrypt = require('bcryptjs');
const env = require('../config/env');
const {
  User,
  Application,
  Notification,
  Announcement,
  PortalSetting,
  SupportQuery,
} = require('../models');

async function seedDemoData() {
  if (!env.demoSeed) return;

  // Ensure default portal settings exist
  const existingSettings = await PortalSetting.findOne({ key: 'portal_config' });
  if (!existingSettings) {
    await PortalSetting.create({
      key: 'portal_config',
      academicYear: '2026-27',
      applicationsOpen: true,
      supportEmail: 'helpdesk-demo@aicte-portal.edu',
      helplineNumber: '011-29581000 / 1800-11-2428 (Demo)',
      portalBannerMessage:
        'Approval Process 2026–2027 & Student Services Portal open for Academic Year 2026–27.',
      maxUploadSizeMb: env.uploadMaxSizeMb,
    });
  }

  const userCount = await User.countDocuments();
  if (userCount > 0) {
    return;
  }

  console.log('[SEED] Seeding demo data (students, admin, applications, announcements)...');

  const studentPasswordHash = await bcrypt.hash('Student@123', 10);
  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);

  const student1 = await User.create({
    name: 'Aarav Sharma',
    email: 'student@aicte-demo.edu',
    phone: '9876543210',
    enrollmentNumber: 'AICTE2026CS1042',
    college: 'Delhi Technological Institute of Engineering',
    university: 'Guru Gobind Singh Indraprastha University',
    course: 'B.Tech',
    branch: 'Computer Science & Engineering',
    academicYear: '2026-27',
    passwordHash: studentPasswordHash,
    role: 'student',
    isActive: true,
  });

  const student2 = await User.create({
    name: 'Priya Verma',
    email: 'priya.verma@aicte-demo.edu',
    phone: '9811223344',
    enrollmentNumber: 'AICTE2026EC2081',
    college: 'National Institute of Applied Sciences, Pune',
    university: 'Savitribai Phule Pune University',
    course: 'B.E.',
    branch: 'Electronics & Communication Engineering',
    academicYear: '2026-27',
    passwordHash: studentPasswordHash,
    role: 'student',
    isActive: true,
  });

  await User.create({
    name: 'Dr. Rajesh Kulkarni',
    email: 'admin@aicte-demo.edu',
    phone: '01129581001',
    enrollmentNumber: 'ADMIN-AICTE-01',
    college: 'AICTE Head Office (Demo)',
    university: 'Statutory Regulatory Body (Academic Demo)',
    course: 'Administration',
    branch: 'Approval Bureau',
    academicYear: '2026-27',
    passwordHash: adminPasswordHash,
    role: 'admin',
    isActive: true,
  });

  const now = new Date();
  const daysAgo = (d) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);

  const sampleApps = [
    {
      applicationId: 'AICTE-2026-1001',
      studentId: String(student1._id),
      personalDetails: {
        fullName: student1.name,
        enrollmentNumber: student1.enrollmentNumber,
        dateOfBirth: '2004-08-14',
        gender: 'Male',
        email: student1.email,
        phone: student1.phone,
        address: 'Sector 14, Rohini, New Delhi - 110085',
      },
      academicDetails: {
        college: student1.college,
        university: student1.university,
        course: student1.course,
        branch: student1.branch,
        semester: '6th Semester',
        academicYear: '2026-27',
        admissionYear: '2023',
      },
      applicationType: 'Scholarship / Fellowship',
      title: 'Saksham / Merit Technical Scholarship Renewal 2026–27',
      description:
        'Application for renewal of annual technical merit scholarship under AICTE Student Development Scheme for Academic Year 2026–27.',
      reason: 'Maintaining 8.9 CGPA with 94% attendance in B.Tech CSE.',
      documents: [],
      status: 'Approved',
      adminRemarks:
        'Academic credentials and institutional bonafide verification completed. Approved for AY 2026–27 disbursement.',
      submittedAt: daysAgo(45),
      createdAt: daysAgo(48),
      updatedAt: daysAgo(30),
      timeline: [
        {
          status: 'Draft',
          label: 'Application Created',
          note: 'Draft initialized by Aarav Sharma.',
          updatedBy: 'Student',
          timestamp: daysAgo(48),
        },
        {
          status: 'Submitted',
          label: 'Application Submitted',
          note: 'Application submitted for AICTE portal verification.',
          updatedBy: 'Student',
          timestamp: daysAgo(45),
        },
        {
          status: 'Under Review',
          label: 'Under Administrative Review',
          note: 'Assigned to Scholarship & Approval Bureau Officer.',
          updatedBy: 'Dr. Rajesh Kulkarni (Admin)',
          timestamp: daysAgo(38),
        },
        {
          status: 'Approved',
          label: 'Application Approved',
          note: 'Approved after marksheet and enrollment verification.',
          updatedBy: 'Dr. Rajesh Kulkarni (Admin)',
          timestamp: daysAgo(30),
        },
      ],
    },
    {
      applicationId: 'AICTE-2026-1002',
      studentId: String(student1._id),
      personalDetails: {
        fullName: student1.name,
        enrollmentNumber: student1.enrollmentNumber,
        dateOfBirth: '2004-08-14',
        gender: 'Male',
        email: student1.email,
        phone: student1.phone,
        address: 'Sector 14, Rohini, New Delhi - 110085',
      },
      academicDetails: {
        college: student1.college,
        university: student1.university,
        course: student1.course,
        branch: student1.branch,
        semester: '6th Semester',
        academicYear: '2026-27',
        admissionYear: '2023',
      },
      applicationType: 'Student Verification / NOC',
      title: 'AICTE Approval Verification Certificate for National Internship',
      description:
        'Requesting official institutional approval verification letter confirming AICTE EoA status of current B.Tech CSE programme.',
      reason: 'Required for PSUs & National Internship Portal onboarding.',
      documents: [],
      status: 'Under Review',
      adminRemarks: 'Institute EoA 2026–27 cross-check in progress with Regional Office.',
      submittedAt: daysAgo(12),
      createdAt: daysAgo(14),
      updatedAt: daysAgo(6),
      timeline: [
        {
          status: 'Draft',
          label: 'Application Created',
          note: 'Draft created by Aarav Sharma.',
          updatedBy: 'Student',
          timestamp: daysAgo(14),
        },
        {
          status: 'Submitted',
          label: 'Application Submitted',
          note: 'Submitted with enrollment verification details.',
          updatedBy: 'Student',
          timestamp: daysAgo(12),
        },
        {
          status: 'Under Review',
          label: 'Under Administrative Review',
          note: 'Under review by Approval Verification Desk.',
          updatedBy: 'Dr. Rajesh Kulkarni (Admin)',
          timestamp: daysAgo(6),
        },
      ],
    },
    {
      applicationId: 'AICTE-2026-1003',
      studentId: String(student1._id),
      personalDetails: {
        fullName: student1.name,
        enrollmentNumber: student1.enrollmentNumber,
        dateOfBirth: '2004-08-14',
        gender: 'Male',
        email: student1.email,
        phone: student1.phone,
        address: 'Sector 14, Rohini, New Delhi - 110085',
      },
      academicDetails: {
        college: student1.college,
        university: student1.university,
        course: student1.course,
        branch: student1.branch,
        semester: '6th Semester',
        academicYear: '2026-27',
        admissionYear: '2023',
      },
      applicationType: 'Course Equivalence',
      title: 'Minor Specialization Credit Equivalence Request (AI & Data Science)',
      description:
        'Seeking credit transfer approval for 18-credit SWAYAM / NPTEL honours minor track.',
      reason: 'Aligning MOOC credits with AICTE Model Curriculum 2026.',
      documents: [],
      status: 'Draft',
      adminRemarks: '',
      submittedAt: null,
      createdAt: daysAgo(3),
      updatedAt: daysAgo(3),
      timeline: [
        {
          status: 'Draft',
          label: 'Application Created',
          note: 'Saved as draft for document attachment before submission.',
          updatedBy: 'Student',
          timestamp: daysAgo(3),
        },
      ],
    },
    {
      applicationId: 'AICTE-2026-1004',
      studentId: String(student2._id),
      personalDetails: {
        fullName: student2.name,
        enrollmentNumber: student2.enrollmentNumber,
        dateOfBirth: '2005-03-21',
        gender: 'Female',
        email: student2.email,
        phone: student2.phone,
        address: 'Kothrud, Pune, Maharashtra - 411038',
      },
      academicDetails: {
        college: student2.college,
        university: student2.university,
        course: student2.course,
        branch: student2.branch,
        semester: '4th Semester',
        academicYear: '2026-27',
        admissionYear: '2024',
      },
      applicationType: 'Scholarship / Fellowship',
      title: 'Pragati Scholarship for Girl Students (AY 2026–27)',
      description:
        'Annual continuation application under AICTE Pragati Scholarship Scheme for technical degree students.',
      reason: 'Eligible merit score and verified family income certificate.',
      documents: [],
      status: 'Submitted',
      adminRemarks: '',
      submittedAt: daysAgo(5),
      createdAt: daysAgo(7),
      updatedAt: daysAgo(5),
      timeline: [
        {
          status: 'Draft',
          label: 'Application Created',
          note: 'Draft created by Priya Verma.',
          updatedBy: 'Student',
          timestamp: daysAgo(7),
        },
        {
          status: 'Submitted',
          label: 'Application Submitted',
          note: 'Submitted to AICTE Scholarship Cell.',
          updatedBy: 'Student',
          timestamp: daysAgo(5),
        },
      ],
    },
    {
      applicationId: 'AICTE-2026-1005',
      studentId: String(student2._id),
      personalDetails: {
        fullName: student2.name,
        enrollmentNumber: student2.enrollmentNumber,
        dateOfBirth: '2005-03-21',
        gender: 'Female',
        email: student2.email,
        phone: student2.phone,
        address: 'Kothrud, Pune, Maharashtra - 411038',
      },
      academicDetails: {
        college: student2.college,
        university: student2.university,
        course: student2.course,
        branch: student2.branch,
        semester: '4th Semester',
        academicYear: '2026-27',
        admissionYear: '2024',
      },
      applicationType: 'Transfer / Migration Approval',
      title: 'Inter-University Migration & Seat Supernumerary Request',
      description:
        'Application for lateral academic transfer between affiliated engineering colleges in Pune region.',
      reason: 'Medical relocation request.',
      documents: [],
      status: 'Rejected',
      adminRemarks:
        'University No-Objection Certificate (NOC) from parent university was missing. Please re-apply with signed University NOC.',
      submittedAt: daysAgo(62),
      createdAt: daysAgo(65),
      updatedAt: daysAgo(50),
      timeline: [
        {
          status: 'Draft',
          label: 'Application Created',
          note: 'Draft created by Priya Verma.',
          updatedBy: 'Student',
          timestamp: daysAgo(65),
        },
        {
          status: 'Submitted',
          label: 'Application Submitted',
          note: 'Submitted for migration scrutiny.',
          updatedBy: 'Student',
          timestamp: daysAgo(62),
        },
        {
          status: 'Under Review',
          label: 'Under Administrative Review',
          note: 'Reviewed by Migration & Compliance Committee.',
          updatedBy: 'Dr. Rajesh Kulkarni (Admin)',
          timestamp: daysAgo(55),
        },
        {
          status: 'Rejected',
          label: 'Application Rejected',
          note: 'Rejected due to missing parent University NOC.',
          updatedBy: 'Dr. Rajesh Kulkarni (Admin)',
          timestamp: daysAgo(50),
        },
      ],
    },
  ];

  for (const app of sampleApps) {
    await Application.create(app);
  }

  const sampleNotifications = [
    {
      title: 'Welcome to AICTE Student Portal',
      message:
        'Your student account (AICTE2026CS1042) is active for Academic Year 2026–27. Keep your profile and academic documents updated.',
      type: 'info',
      recipientId: String(student1._id),
      isRead: true,
    },
    {
      title: 'Application Approved (AICTE-2026-1001)',
      message:
        'Your Saksham / Merit Technical Scholarship Renewal 2026–27 application has been approved by the Approval Bureau.',
      type: 'success',
      recipientId: String(student1._id),
      relatedApplicationId: 'AICTE-2026-1001',
      isRead: false,
    },
    {
      title: 'Application Moved to Under Review (AICTE-2026-1002)',
      message:
        'Your application AICTE-2026-1002 is currently Under Review. Remarks: Institute EoA 2026–27 cross-check in progress.',
      type: 'warning',
      recipientId: String(student1._id),
      relatedApplicationId: 'AICTE-2026-1002',
      isRead: false,
    },
    {
      title: 'New Announcement: Revised Academic Calendar 2026–27',
      message:
        'AICTE has published the Revised Academic Calendar 2026–27 with admission cut-off and class commencement dates.',
      type: 'info',
      recipientId: String(student1._id),
      isRead: false,
    },
  ];

  for (const n of sampleNotifications) {
    await Notification.create(n);
  }

  const sampleAnnouncements = [
    {
      title: 'Public Notice for Approval Process 2026–27 Released',
      description:
        'Online portal is open for Extension of Approval (EoA), New Technical Institutions, and Variation in Intake for AY 2026–27.',
      category: 'Public Notice',
      publishDate: daysAgo(20),
      isActive: true,
      createdBy: 'Dr. Rajesh Kulkarni',
    },
    {
      title: 'Corrigendum / Addendum to Approval Process Handbook 2026–27',
      description:
        'Updated clarifications regarding supernumerary seats, emerging-area minor tracks, and NBA accreditation submission deadlines.',
      category: 'Corrigendum',
      publishDate: daysAgo(14),
      isActive: true,
      createdBy: 'Dr. Rajesh Kulkarni',
    },
    {
      title: 'Revised Academic Calendar for Academic Session 2026–27',
      description:
        'First-year classes commence from 01 August 2026; last date for seat cancellation with full fee refund is 11 September 2026.',
      category: 'Academic Calendar',
      publishDate: daysAgo(7),
      isActive: true,
      createdBy: 'Dr. Rajesh Kulkarni',
    },
    {
      title: 'Pragati & Saksham Scholarship Portal Window Open',
      description:
        'Eligible technical degree and diploma students may submit fresh or renewal scholarship applications via the Student Dashboard.',
      category: 'Scheme',
      publishDate: daysAgo(3),
      isActive: true,
      createdBy: 'Dr. Rajesh Kulkarni',
    },
  ];

  for (const ann of sampleAnnouncements) {
    await Announcement.create(ann);
  }

  await SupportQuery.create({
    ticketId: 'SUP-2026-001',
    userId: String(student1._id),
    name: student1.name,
    email: student1.email,
    category: 'Application Status',
    subject: 'Clarification on EoA verification turnaround time',
    message: 'Kindly confirm expected verification duration for National Internship NOC.',
    status: 'In Progress',
    adminReply:
      'Your request is currently being verified with the Regional Approval Office and will be finalized within 3 working days.',
  });

  console.log('[SEED] Demo data seeded successfully.');
}

module.exports = { seedDemoData };
