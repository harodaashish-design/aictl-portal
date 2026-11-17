const PDFDocument = require('pdfkit');

const PUBLIC_DOCUMENTS = {
  'public-notice-2026-27': {
    filename: 'AICTE_Public_Notice_Approval_Process_2026-27.pdf',
    refNo: 'F.No. AICTE/AB/2026-27/PN-01',
    date: '15 January 2026',
    title: 'PUBLIC NOTICE FOR APPROVAL PROCESS 2026–2027',
    subtitle: 'Extension of Approval (EoA), New Institutions & Variation in Intake',
    sections: [
      {
        heading: '1. Inviting Online Applications for Academic Year 2026–27',
        body: 'Applications are invited through the AICTE Web-Portal for Grant of Approval for Academic Year 2026–27 from existing AICTE-approved Technical Institutions/Universities and new applicant societies/trusts/Section-8 companies offering programmes in Engineering & Technology, Management, MCA, Pharmacy, Architecture, Planning, Design, Applied Arts & Crafts, and Hotel Management.',
      },
      {
        heading: '2. Key Compliance & Mandatory Disclosures',
        body: 'All applicant institutions must ensure updated Mandatory Disclosures on their institutional website, valid Faculty-Student Ratio compliance, functional Anti-Ragging and Internal Complaints Committees, and Aadhaar-seeded faculty details as per APH 2024–2027 norms.',
      },
      {
        heading: '3. Important Schedule Highlights',
        bullets: [
          'Opening of Web Portal for 2026–27 Applications: 20 January 2026',
          'Last Date for Submission without Late Fee: 28 February 2026',
          'Last Date for Submission with Late Penalty: 15 March 2026',
          'Scrutiny & Expert Visit Committee (EVC) Window: March – April 2026',
          'Final Grant of Approval (EoA) Issue Deadline: 30 April 2026',
        ],
      },
    ],
  },
  'corrigendum-addendum-2026-27': {
    filename: 'AICTE_Corrigendum_Addendum_2026-27.pdf',
    refNo: 'F.No. AICTE/AB/2026-27/CORR-02',
    date: '08 February 2026',
    title: 'CORRIGENDUM / ADDENDUM FOR APPROVAL PROCESS 2026–27',
    subtitle: 'Clarifications on Nomenclature, Intake Restoration & ODL/Online Programmes',
    sections: [
      {
        heading: '1. Clarifications to Approval Process Handbook (APH)',
        body: 'In continuation to the Public Notice dated 15.01.2026, the following amendments and clarifications are issued for compliance by all Technical Institutions and Universities during Academic Year 2026–27.',
      },
      {
        heading: '2. Summary of Amendments',
        bullets: [
          'Clause 2.4.1: Provision for Introduction of Supernumerary Seats under PMSSS / NRI / OCI / CIWG categories clarified.',
          'Clause 3.12: Flexibility in introducing emerging-area minor degrees in AI, Robotics, Semiconductor Design, and Green Energy.',
          'Clause 6.2: Revised processing fee concession rules for Government-aided and Women-only technical institutions.',
          'Extension of last date for online submission of NBA accreditation proof up to 10 April 2026.',
        ],
      },
    ],
  },
  'aph-handbook-2026-27': {
    filename: 'AICTE_Approval_Process_Handbook_2026-27_Summary.pdf',
    refNo: 'APH-2024-2027 / AY 2026-27 Edition',
    date: 'Academic Year 2026–27',
    title: 'APPROVAL PROCESS HANDBOOK (APH) & GUIDELINES',
    subtitle: 'Norms, Standards, Infrastructure & Regulatory Guidelines',
    sections: [
      {
        heading: 'Chapter I: Grant of Approval for New Technical Institutions',
        body: 'Covers eligibility of promoting bodies (Trust/Society/Section 8 Company), minimum land requirement norms (Mega/Metro/Non-Metro), built-up area calculations, instructional & administrative area ratios, and digital library norms.',
      },
      {
        heading: 'Chapter II: Extension of Approval (EoA) & Intake Variations',
        body: 'Details procedures for Extension of Approval, increase/reduction in intake, closure of programmes/institutions, change of site/location, and merger of institutions.',
      },
      {
        heading: 'Chapter III & IV: Faculty Norms, Cadre Ratio & Student Protections',
        bullets: [
          'Prescribed Faculty:Student ratio of 1:20 for UG Engineering/Technology and 1:15 for PG programmes.',
          'Mandatory fee refund policy adhering strictly to UGC/AICTE admission cancellation cut-off dates.',
          'Zero-tolerance compliance for Ragging Prevention, Grievance Redressal Ombudsman, and Barrier-Free Campus access.',
        ],
      },
    ],
  },
  'unapproved-institutions-list': {
    filename: 'AICTE_Unapproved_Institutions_Advisory_2026-27.pdf',
    refNo: 'F.No. AICTE/VIG/2026-27/ADV-04',
    date: '01 March 2026',
    title: 'INFORMATION & LIST OF UNAPPROVED INSTITUTIONS',
    subtitle: 'Public Advisory for Students, Parents & Stakeholders (Academic Demo Sample)',
    sections: [
      {
        heading: '1. Public Caution Notice',
        body: 'Students and parents are advised to verify the AICTE approval status of any private technical institute before taking admission to Engineering, Management, MCA, Pharmacy, or Diploma programmes. Degrees/Diplomas obtained from unapproved institutions may not be recognized for government employment or higher studies.',
      },
      {
        heading: '2. Illustrative Sample Entries (Demonstration Data Only)',
        bullets: [
          'Sample Entry A — Apex Tech Academy (Unregistered Campus), Region: Northern [Show-Cause Issued - Demo Record]',
          'Sample Entry B — Global Horizon Institute of Engineering & Mgmt, Region: Western [Unapproved Intake - Demo Record]',
          'Sample Entry C — Sunrise Polytechnic & Vocational Hub, Region: Southern [No Valid EoA 2026-27 - Demo Record]',
          'Sample Entry D — Metro City School of Applied Tech, Region: Eastern [Affiliation Verification Pending - Demo Record]',
        ],
      },
    ],
  },
  'revised-academic-calendar-2026-27': {
    filename: 'AICTE_Revised_Academic_Calendar_2026-27.pdf',
    refNo: 'F.No. AICTE/AP/2026-27/CAL-03',
    date: '22 February 2026',
    title: 'REVISED ACADEMIC CALENDAR 2026–2027',
    subtitle: 'For Technical Institutions, Standalone PGDM/PGCM & University Departments',
    sections: [
      {
        heading: 'Important Deadlines for Academic Session 2026–27',
        bullets: [
          'Last Date for Grant of Approval (EoA) to Technical Institutions: 30 April 2026',
          'Last Date for Grant of Affiliation by Universities / Boards: 31 May 2026',
          'First Round of Centralized Admission Counselling Completion: 15 July 2026',
          'Commencement of Induction Programme & Classes (1st Year Students): 01 August 2026',
          'Last Date for Cancellation of Seats with Full Fee Refund: 11 September 2026',
          'Final Cut-off Date for Admissions Against Vacant / Lateral Entry Seats: 15 September 2026',
        ],
      },
      {
        heading: '2. Academic Instruction Mandate',
        body: 'All institutions shall ensure a minimum of 90 teaching days per semester (excluding examination days) and conduct a mandatory 3-week Student Induction Programme as per AICTE model curriculum.',
      },
    ],
  },
};

function streamPublicDocumentPdf(slug, res) {
  const docMeta = PUBLIC_DOCUMENTS[slug];
  if (!docMeta) return false;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${docMeta.filename}"`);

  const pdf = new PDFDocument({ margin: 50, size: 'A4' });
  pdf.pipe(res);

  // Header Banner
  pdf
    .rect(50, 40, 495, 68)
    .fill('#0B2C6F');

  pdf
    .fillColor('#FFFFFF')
    .fontSize(14)
    .font('Helvetica-Bold')
    .text('ALL INDIA COUNCIL FOR TECHNICAL EDUCATION', 65, 52, { width: 465, align: 'center' });

  pdf
    .fontSize(9.5)
    .font('Helvetica')
    .text('Academic Demonstration Portal — Inspired by AICTE Statutory Format', 65, 72, {
      width: 465,
      align: 'center',
    });

  pdf
    .fillColor('#F37021')
    .rect(50, 108, 495, 4)
    .fill();

  pdf.moveDown(3.5);
  pdf.y = 128;

  pdf
    .fillColor('#334155')
    .fontSize(9.5)
    .font('Helvetica-Bold')
    .text(`Reference: ${docMeta.refNo}`, 50, pdf.y, { continued: true })
    .text(`Date: ${docMeta.date}`, { align: 'right' });

  pdf.moveDown(1.2);
  pdf
    .fillColor('#0B2C6F')
    .fontSize(15)
    .font('Helvetica-Bold')
    .text(docMeta.title, { align: 'center' });

  pdf.moveDown(0.3);
  pdf
    .fillColor('#475569')
    .fontSize(10.5)
    .font('Helvetica-Oblique')
    .text(docMeta.subtitle, { align: 'center' });

  pdf.moveDown(1.2);

  for (const sec of docMeta.sections) {
    pdf
      .fillColor('#0B2C6F')
      .fontSize(11.5)
      .font('Helvetica-Bold')
      .text(sec.heading);
    pdf.moveDown(0.4);

    if (sec.body) {
      pdf
        .fillColor('#1E293B')
        .fontSize(10)
        .font('Helvetica')
        .text(sec.body, { align: 'justify', lineGap: 3 });
      pdf.moveDown(0.8);
    }

    if (sec.bullets) {
      for (const b of sec.bullets) {
        pdf
          .fillColor('#1E293B')
          .fontSize(10)
          .font('Helvetica')
          .text(`•  ${b}`, { indent: 12, lineGap: 3 });
        pdf.moveDown(0.25);
      }
      pdf.moveDown(0.6);
    }
  }

  // Disclaimer Box at bottom
  const footerY = 740;
  pdf
    .rect(50, footerY, 495, 52)
    .fillAndStroke('#F1F5F9', '#CBD5E1');
  pdf
    .fillColor('#475569')
    .fontSize(8.5)
    .font('Helvetica-Bold')
    .text('ACADEMIC DEMONSTRATION DISCLAIMER:', 60, footerY + 10);
  pdf
    .font('Helvetica')
    .text(
      'This PDF is dynamically generated for an independent academic major project demonstration and is NOT an official circular of AICTE or the Government of India.',
      60,
      footerY + 23,
      { width: 475 }
    );

  pdf.end();
  return true;
}

module.exports = {
  PUBLIC_DOCUMENTS,
  streamPublicDocumentPdf,
};
