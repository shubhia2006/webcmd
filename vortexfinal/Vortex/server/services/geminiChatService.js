import { GoogleGenAI } from '@google/genai';
import { webcmdService } from './webcmdService.js';

export class GeminiChatService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || null;
    this.client = null;
    if (this.apiKey) {
      try {
        this.client = new GoogleGenAI({ apiKey: this.apiKey });
        webcmdService.log('Gemini Chat Service initialized with API key.', 'success');
      } catch (err) {
        webcmdService.log(`Gemini initialization error: ${err.message}`, 'error');
      }
    } else {
      webcmdService.log('Gemini Chat Service: GEMINI_API_KEY not found in environment, intelligent fallback assistant active.', 'info');
    }
  }

  async chat(message, context = {}) {
    const { profile, topOpportunities } = context;

    // Build system prompt and context summary
    const profileSummary = profile ? `
Student Profile:
- Name: ${profile.name || 'Student'}
- CGPA: ${profile.gpa || 'Not specified'}
- Degree/Major: ${profile.degree || ''} in ${profile.major || 'Computer Science'}
- University: ${profile.university || 'N/A'}
- Key Skills: ${(profile.skills || []).join(', ') || 'General Engineering'}
- Experience Level: ${profile.experienceLevel || 'Beginner'}
` : 'Student has not entered a profile yet.';

    const oppsSummary = (topOpportunities && topOpportunities.length > 0)
      ? topOpportunities.map((o, idx) => `${idx + 1}. [${o.category}] ${o.title} by ${o.organization} | Deadline: ${o.deadline || 'Ongoing'} | Match Score: ${o.matchScore || 'N/A'}%`).join('\n')
      : 'No matched opportunities loaded currently.';

    const systemPrompt = `You are Vortex AI Assistant, an elite AI student career & hackathon advisor integrated directly into the Vortex Student Life Agent platform.
You assist university students with:
1. Hackathon strategy, team building, tech stack choices, pitch decks, and winning tips
2. Scholarships, eligibility, CGPA cutoff navigation, and application strategies
3. Internships, coding competitions, resume advice, and personalized preparation
4. Real-time insights about the opportunities currently matched to the student.

Context Data:
${profileSummary}

Currently Matched Opportunities on Platform:
${oppsSummary}

Guidelines:
- Give direct, highly actionable, encouraging, and structured responses.
- Use clean Markdown with bullet points and bold highlights.
- Reference their actual profile skills or CGPA when relevant.
- Keep replies concise (around 2-4 focused paragraphs or structured bullets).`;

    // 1. Try Gemini API if client available
    if (this.client) {
      try {
        webcmdService.log(`[Gemini AI] Querying model for user prompt: "${message.slice(0, 40)}..."`, 'info');
        const response = await this.client.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
            { role: 'user', parts: [{ text: `${systemPrompt}\n\nUser Question: ${message}` }] }
          ]
        });

        if (response && response.text) {
          return response.text;
        }
      } catch (geminiError) {
        webcmdService.log(`[Gemini API Warning] Request failed: ${geminiError.message}. Switching to local intelligent assistant.`, 'warning');
      }
    }

    // 2. Intelligent Context-Aware Fallback Engine
    return this.generateSmartResponse(message, profile, topOpportunities);
  }

  generateSmartResponse(message, profile, topOpportunities = []) {
    const q = message.toLowerCase();
    const studentName = profile?.name ? profile.name.split(' ')[0] : 'there';
    const skills = profile?.skills || [];
    const cgpa = profile?.gpa || 'N/A';

    // Topic: Hackathons
    if (q.includes('hackathon') || q.includes('sih') || q.includes('ethindia') || q.includes('grid')) {
      const hackathons = (topOpportunities || []).filter(o => o.category?.toLowerCase() === 'hackathon');
      const hackathonList = hackathons.length > 0 
        ? hackathons.slice(0, 3).map(h => `• **${h.title}** (${h.organization}) — Deadline: ${h.deadline || 'Check listing'}`).join('\n')
        : '• Smart India Hackathon (SIH)\n• ETHIndia\n• Flipkart GRiD\n• Google Girl Hackathon';

      return `Hey **${studentName}**! Here is my top hackathon advisory for you:\n\n` +
        `**Key Hackathons Matched for You:**\n${hackathonList}\n\n` +
        `**Winning Hackathon Playbook:**\n` +
        `1. **Problem Selection:** Pick a clear, real-world pain point rather than an over-done concept. Judges prioritize impact and viability.\n` +
        `2. **Tech Stack:** Leverage your core skills (${skills.slice(0, 3).join(', ') || 'React, Node, Python'}). Build a working minimum viable prototype (MVP) first!\n` +
        `3. **The 3-Minute Pitch:** Focus 50% on live demo, 30% on problem & solution, and 20% on future architecture & business model.\n\n` +
        `Need advice on a specific hackathon or building a project deck? Just ask!`;
    }

    // Topic: Scholarships & CGPA
    if (q.includes('scholarship') || q.includes('cgpa') || q.includes('gpa') || q.includes('fund') || q.includes('financial')) {
      const scholarships = (topOpportunities || []).filter(o => o.category?.toLowerCase() === 'scholarship');
      const schList = scholarships.length > 0
        ? scholarships.slice(0, 3).map(s => `• **${s.title}** (${s.organization}) — Deadline: ${s.deadline || 'Upcoming'}`).join('\n')
        : '• Nutanix Heart Women in Technology Scholarship\n• Reliance Foundation Undergraduate Scholarship\n• Adobe India Women-in-Technology Scholarship';

      return `Great question, **${studentName}**! Let's talk scholarships and academic requirements:\n\n` +
        `**Your Academic Status:** Registered CGPA is **${cgpa}**.\n\n` +
        `**Top Scholarship Matches:**\n${schList}\n\n` +
        `**Scholarship Application Strategy:**\n` +
        `• **Statement of Purpose (SOP):** Connect your academic achievements directly to societal impact or research goals.\n` +
        `• **Letters of Recommendation (LOR):** Request recommendations from professors in subjects where you scored high.\n` +
        `• **Merit Boost:** Many premier tech scholarships (e.g. Nutanix, Adobe, Reliance) look at leadership and projects alongside CGPA.`;
    }

    // Topic: Internships & Hiring / Jobs
    if (q.includes('intern') || q.includes('job') || q.includes('career') || q.includes('resume') || q.includes('interview')) {
      return `Here is your personalized career & internship roadmap, **${studentName}**:\n\n` +
        `**Leveraging Your Stack (${skills.slice(0, 4).join(', ') || 'Software Development'}):**\n` +
        `• **GitHub & Portfolio:** Pin 2-3 end-to-end fullstack or AI projects with detailed READMEs and live demo links.\n` +
        `• **Vortex Matcher:** Check out the **Opportunity Radar** tab to view live openings with deadlines and direct links.\n` +
        `• **Automated Cold Email:** Use Vortex's 1-click **Generate Cold Email** button on any matched card to get a tailored pitch for recruiters!\n\n` +
        `What role or domain are you aiming for next? (e.g., Frontend, Fullstack, AI/ML, Backend)`;
    }

    // Topic: What can you do / Help
    if (q.includes('who are you') || q.includes('help') || q.includes('what can you do')) {
      return `I am your **Vortex AI Assistant** ⚡ powered by Gemini!\n\n` +
        `Here is what I can help you with in real time:\n` +
        `1. **Analyze Your Profile:** I inspect your CGPA (${cgpa}) and skills (${skills.join(', ') || 'entered skills'}) to suggest highest-matching opportunities.\n` +
        `2. **Hackathon Guidance:** Strategy, project ideation, team dynamics, and presentation pitch formulas.\n` +
        `3. **Scholarship Guidance:** Deadlines, eligibility criteria, and essay advice.\n` +
        `4. **Application Prep:** Tailored cold emails, cover letters, and webcmd automation assistance.\n\n` +
        `Ask me anything to get started!`;
    }

    // Default intelligent guidance
    return `Hello **${studentName}**! I'm your Vortex AI Assistant.\n\n` +
      `Regarding *"**${message}**"*: As a student with strengths in **${skills.slice(0, 3).join(', ') || 'technology'}** (CGPA: **${cgpa}**), you can leverage Vortex to discover live hackathons, high-value scholarships, and competitions.\n\n` +
      `💡 **Quick Suggestions:**\n` +
      `• Browse the **Opportunity Radar** tab to see your current matches sorted by AI compatibility.\n` +
      `• Ask me *"What hackathons should I apply to?"* or *"How do I improve my scholarship chance?"*\n` +
      `• Use the **WebCMD Console** tab to inspect live web scraping diagnostics.`;
  }
}

export const geminiChatService = new GeminiChatService();
