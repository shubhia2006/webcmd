import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { opportunityCrawler } from './services/opportunityCrawler.js';
import { liveWebScraper } from './services/liveWebScraper.js';
import { aiMatcher } from './services/aiMatcher.js';
import { formAutofillService } from './services/formAutofillService.js';
import { webcmdService } from './services/webcmdService.js';
import { geminiChatService } from './services/geminiChatService.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Profile starts null until student enters their details manually
let currentProfile = null;

// Application Tracker state
let applicationTracker = [];

// Profile Endpoints
app.get('/api/profile', (req, res) => {
  res.json({ success: true, profile: currentProfile });
});

app.post('/api/profile', (req, res) => {
  currentProfile = { ...req.body };
  webcmdService.log(`Received manual student profile update for ${currentProfile.name} (${currentProfile.university || 'User Profile'})`, 'info');
  // Clear cache when profile changes so new searches reflect updated skills
  liveWebScraper.clearCache();
  res.json({ success: true, profile: currentProfile });
});

// Live Internet Crawler Endpoint — Fetches REAL live internet data via Playwright browser scraping
app.get('/api/opportunities', async (req, res) => {
  try {
    const { category, query } = req.query;

    // If student has not submitted profile details yet, return empty list
    if (!currentProfile || !currentProfile.skills || currentProfile.skills.length === 0) {
      return res.json({ success: true, count: 0, data: [], profileRequired: true });
    }

    webcmdService.log(`[LIVE INTERNET AGENT] Triggering Playwright web scrape for ${currentProfile.name} (Skills: ${currentProfile.skills.join(', ')}, CGPA: ${currentProfile.gpa || 'N/A'})...`, 'info');

    // Scrape live internet using Playwright
    const items = await liveWebScraper.searchLiveInternet({
      category: category || 'All',
      query: query || '',
      skills: currentProfile.skills || [],
      cgpa: currentProfile.gpa || '0',
      degree: currentProfile.degree || '',
      location: currentProfile.stateLocation || ''
    });
    
    // Attach AI match scores dynamically based on the student's entered skills and CGPA
    const enriched = items.map(item => {
      const match = aiMatcher.calculateMatchScore(currentProfile, item);
      return { ...item, matchScore: match.score, matchDetails: match };
    });

    // Sort by Match score descending
    enriched.sort((a, b) => b.matchScore - a.matchScore);

    res.json({ success: true, count: enriched.length, data: enriched, profileRequired: false, isLiveCrawl: true });
  } catch (err) {
    webcmdService.log(`Error in live internet crawl: ${err.message}`, 'error');
    res.status(500).json({ success: false, error: err.message });
  }
});

// Force refresh endpoint — clears cache and re-scrapes
app.post('/api/opportunities/refresh', async (req, res) => {
  try {
    if (!currentProfile || !currentProfile.skills || currentProfile.skills.length === 0) {
      return res.json({ success: false, error: 'Profile required' });
    }

    webcmdService.log(`[REFRESH] Force-clearing cache and re-scraping for ${currentProfile.name}...`, 'info');
    liveWebScraper.clearCache();

    const { category } = req.body;

    const items = await liveWebScraper.searchLiveInternet({
      category: category || 'All',
      query: '',
      skills: currentProfile.skills || [],
      cgpa: currentProfile.gpa || '0',
      degree: currentProfile.degree || '',
      location: currentProfile.stateLocation || ''
    });

    const enriched = items.map(item => {
      const match = aiMatcher.calculateMatchScore(currentProfile, item);
      return { ...item, matchScore: match.score, matchDetails: match };
    });

    enriched.sort((a, b) => b.matchScore - a.matchScore);

    res.json({ success: true, count: enriched.length, data: enriched, isLiveCrawl: true, refreshed: true });
  } catch (err) {
    webcmdService.log(`Error in refresh: ${err.message}`, 'error');
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/opportunities/:id', (req, res) => {
  const item = opportunityCrawler.getOpportunityById(req.params.id);
  if (!item) return res.status(404).json({ success: false, error: 'Not found' });
  const match = currentProfile ? aiMatcher.calculateMatchScore(currentProfile, item) : { score: 0 };
  res.json({ success: true, data: { ...item, matchScore: match.score, matchDetails: match } });
});

// AI Match & Content Generation
app.post('/api/match/content', (req, res) => {
  const { opportunityId } = req.body;
  if (!currentProfile) return res.status(400).json({ success: false, error: 'Please enter your student details first.' });

  const opp = opportunityCrawler.getOpportunityById(opportunityId);
  if (!opp) return res.status(404).json({ success: false, error: 'Opportunity not found' });

  const coldEmail = aiMatcher.generateColdEmail(currentProfile, opp);
  const coverLetter = aiMatcher.generateCoverLetter(currentProfile, opp);

  res.json({ success: true, coldEmail, coverLetter });
});

// Autofill & Human Approval
app.post('/api/autofill/prepare', async (req, res) => {
  try {
    if (!currentProfile) return res.status(400).json({ success: false, error: 'Please enter your student details first.' });

    const { opportunityId } = req.body;
    const approvalRequest = await formAutofillService.prepareApplicationForm(opportunityId, currentProfile);
    res.json({ success: true, approvalRequest });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/autofill/process-approval', async (req, res) => {
  try {
    const { approvalId, decision, modifiedData } = req.body;
    const result = await formAutofillService.processHumanApproval(approvalId, decision, modifiedData);
    
    if (result.success && result.request) {
      // Add to tracker automatically
      const newTrack = {
        id: `tr_${Date.now()}`,
        opportunityId: result.request.opportunityId,
        title: result.request.opportunityTitle,
        organization: result.request.organization,
        category: result.request.category,
        status: 'Applied',
        dateAdded: new Date().toISOString().split('T')[0],
        matchScore: 95,
        notes: `Submitted via Vortex WebCMD agent (Ref: ${result.confirmationCode})`
      };
      applicationTracker.unshift(newTrack);
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Application Tracker Endpoints
app.get('/api/tracker', (req, res) => {
  res.json({ success: true, tracker: applicationTracker });
});

app.post('/api/tracker', (req, res) => {
  const newEntry = { id: `tr_${Date.now()}`, dateAdded: new Date().toISOString().split('T')[0], ...req.body };
  applicationTracker.unshift(newEntry);
  res.json({ success: true, tracker: applicationTracker });
});

app.patch('/api/tracker/:id', (req, res) => {
  const index = applicationTracker.findIndex(t => t.id === req.params.id);
  if (index !== -1) {
    applicationTracker[index] = { ...applicationTracker[index], ...req.body };
  }
});

// Gemini Chatbot Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, context } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    webcmdService.log(`[Gemini Chat] Received query: "${message.slice(0, 50)}..."`, 'info');
    const reply = await geminiChatService.chat(message, {
      profile: context?.profile || currentProfile,
      topOpportunities: context?.topOpportunities || []
    });

    res.json({ success: true, reply });
  } catch (err) {
    webcmdService.log(`[Gemini Chat Error] ${err.message}`, 'error');
    res.status(500).json({ success: false, error: err.message });
  }
});

// WebCMD Infrastructure Routes
app.get('/api/webcmd/logs', (req, res) => {
  res.json({ success: true, logs: webcmdService.getLogs() });
});

app.get('/api/webcmd/doctor', async (req, res) => {
  const result = await webcmdService.runDoctor();
  res.json(result);
});

app.post('/api/webcmd/session', async (req, res) => {
  const { name } = req.body;
  const session = await webcmdService.createSession(name);
  res.json({ success: true, session });
});

app.get('/api/webcmd/snapshot/:sessionId', async (req, res) => {
  const snapshot = await webcmdService.getSessionSnapshot(req.params.sessionId);
  res.json({ success: true, snapshot });
});

// Graceful shutdown — close Playwright browser
process.on('SIGINT', async () => {
  webcmdService.log('Shutting down — closing Playwright browser...', 'info');
  await liveWebScraper.close();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🚀 Vortex Student Life Agent Server running on http://localhost:${PORT}`);
  webcmdService.log(`Server listening on port ${PORT}. Playwright Live Web Scraper ready.`, 'success');
});
