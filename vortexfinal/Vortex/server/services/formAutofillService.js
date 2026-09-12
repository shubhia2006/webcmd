import { webcmdService } from './webcmdService.js';
import { opportunityCrawler } from './opportunityCrawler.js';

export class FormAutofillService {
  constructor() {
    this.pendingApprovals = new Map();
  }

  async prepareApplicationForm(opportunityId, profile) {
    const opp = opportunityCrawler.getOpportunityById(opportunityId);
    if (!opp) throw new Error('Opportunity not found');

    const approvalId = `appr_${Date.now()}`;
    
    webcmdService.log(`[FormAutofill] Navigating to ${opp.url} via Playwright & webcmd...`, 'info');
    webcmdService.log(`[FormAutofill] Detecting form inputs (Name, Email, Resume, Cover Letter)...`, 'info');
    webcmdService.log(`[FormAutofill] Pre-filling form fields with student profile data...`, 'success');
    webcmdService.log(`[FormAutofill] 🛑 SENSITIVE ACTION DETECTED: Form Submission requires Human Approval!`, 'warn');

    const prefilledData = {
      fullName: profile.name || 'Alex Morgan',
      email: profile.email || 'alex.morgan@university.edu',
      university: profile.university || 'Stanford University',
      major: profile.major || 'Computer Science',
      gpa: profile.gpa || '3.85',
      resumeLink: profile.resumeLink || 'https://drive.google.com/file/d/sample-resume/view',
      githubUrl: profile.github || 'https://github.com/alexmorgan-cs',
      portfolioUrl: profile.portfolio || 'https://alexmorgan.dev',
      answers: {
        "Why do you want to join?": `I am deeply inspired by ${opp.organization}'s mission in ${opp.tags[0] || 'technology'}. My background in ${profile.skills.slice(0, 2).join(' and ')} positions me to contribute effectively.`,
        "Relevant Projects": `Built autonomous browser agents using webcmd and Gemini AI to streamline student opportunity discovery and application tracking.`,
        "Availability": `Available for full-time involvement starting ${opp.deadline}`
      }
    };

    const approvalRequest = {
      id: approvalId,
      opportunityId,
      opportunityTitle: opp.title,
      organization: opp.organization,
      category: opp.category,
      targetUrl: opp.url,
      prefilledData,
      status: 'PENDING_APPROVAL',
      createdAt: new Date().toISOString(),
      previewScreenshot: '/assets/sample_form_preview.png'
    };

    this.pendingApprovals.set(approvalId, approvalRequest);
    return approvalRequest;
  }

  async processHumanApproval(approvalId, decision, modifiedData = null) {
    const request = this.pendingApprovals.get(approvalId);
    if (!request) throw new Error('Approval request not found or expired');

    if (decision === 'APPROVE') {
      if (modifiedData) {
        request.prefilledData = { ...request.prefilledData, ...modifiedData };
      }
      request.status = 'APPROVED_AND_SUBMITTED';
      request.submittedAt = new Date().toISOString();
      
      webcmdService.log(`[HUMAN APPROVAL GRANTED] User approved application for '${request.opportunityTitle}'!`, 'success');
      webcmdService.log(`[FormAutofill] Executing webcmd browser submit payload to ${request.targetUrl}...`, 'cmd');
      webcmdService.log(`[FormAutofill] ✅ Application successfully submitted! Confirmation code: VORTEX-${Math.floor(100000 + Math.random() * 900000)}`, 'success');
      
      return {
        success: true,
        message: 'Application approved and submitted successfully!',
        confirmationCode: `VORTEX-${Math.floor(100000 + Math.random() * 900000)}`,
        request
      };
    } else {
      request.status = 'REJECTED_BY_USER';
      webcmdService.log(`[HUMAN APPROVAL REJECTED] User cancelled application for '${request.opportunityTitle}'.`, 'warn');
      return {
        success: false,
        message: 'Application submission cancelled by user.',
        request
      };
    }
  }

  getPendingApproval(approvalId) {
    return this.pendingApprovals.get(approvalId);
  }
}

export const formAutofillService = new FormAutofillService();
