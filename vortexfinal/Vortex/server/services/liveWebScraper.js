import { chromium } from 'playwright';
import { webcmdService } from './webcmdService.js';

// In-memory cache: { key: string -> { data: [], timestamp: number } }
const resultCache = new Map();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

// Navigation/junk title blocklist — these are never real opportunities
const JUNK_TITLES = new Set([
  'back', 'home', 'login', 'sign up', 'sign in', 'register',
  'about', 'contact', 'help', 'faq', 'terms', 'privacy',
  'competitions', 'hackathons', 'quizzes', 'scholarships',
  'post a job', 'post a job or internship', 'become a mentor',
  'menu', 'search', 'filter', 'sort', 'next', 'previous',
  'explore', 'trending', 'featured', 'popular', 'new',
  'log in', 'get started', 'join now', 'create account'
]);

function isJunkTitle(title) {
  if (!title || title.length < 8 || title.length > 250) return true;
  const lower = title.toLowerCase().trim();
  if (JUNK_TITLES.has(lower)) return true;
  // Filter out titles that are just single words (likely navigation)
  if (!lower.includes(' ') && lower.length < 15) return true;
  return false;
}

export class LiveWebScraper {
  constructor() {
    this.browser = null;
  }

  async ensureBrowser() {
    if (!this.browser || !this.browser.isConnected()) {
      webcmdService.log('[BROWSER AGENT] Launching headless Chromium via Playwright...', 'info');
      this.browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      });
      webcmdService.log('[BROWSER AGENT] Chromium launched successfully.', 'success');
    }
    return this.browser;
  }

  getCacheKey(skills, category, cgpa) {
    return `${skills.sort().join(',').toLowerCase()}|${category}|${cgpa}`;
  }

  getCached(key) {
    const entry = resultCache.get(key);
    if (entry && (Date.now() - entry.timestamp) < CACHE_TTL_MS) {
      return entry.data;
    }
    resultCache.delete(key);
    return null;
  }

  setCache(key, data) {
    resultCache.set(key, { data, timestamp: Date.now() });
  }

  clearCache() {
    resultCache.clear();
    webcmdService.log('[CACHE] All cached results cleared.', 'info');
  }

  calcDaysLeft(deadlineStr) {
    if (!deadlineStr) return null;
    try {
      const deadline = new Date(deadlineStr);
      const now = new Date();
      const diff = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
      return Math.max(0, diff);
    } catch {
      return null;
    }
  }

  // Main entry point
  async searchLiveInternet({ query = '', category = 'All', skills = [], cgpa = '0', degree = '', location = '' }) {
    const userSkillsLower = skills.map(s => s.trim().toLowerCase()).filter(Boolean);
    if (userSkillsLower.length === 0) return [];

    const cacheKey = this.getCacheKey(userSkillsLower, category, cgpa);
    const cached = this.getCached(cacheKey);
    if (cached) {
      webcmdService.log(`[CACHE HIT] Returning ${cached.length} cached results for skills: [${userSkillsLower.join(', ')}]`, 'info');
      return cached;
    }

    webcmdService.log(`[LIVE SCRAPER] Starting real-time web scrape for skills: [${userSkillsLower.join(', ')}], CGPA: ${cgpa}`, 'info');

    const allResults = [];

    // 1. Scrape Google search results
    const searchCategories = category === 'All'
      ? ['Hackathon', 'Internship', 'Scholarship', 'Research']
      : [category];

    for (const cat of searchCategories) {
      try {
        const results = await this.scrapeGoogleForCategory(userSkillsLower, cat, cgpa);
        allResults.push(...results);
      } catch (err) {
        webcmdService.log(`[SCRAPER ERROR] Google ${cat}: ${err.message}`, 'error');
      }
    }

    // 2. Scrape Unstop for Indian opportunities
    try {
      const unstopResults = await this.scrapeUnstop(userSkillsLower, category);
      allResults.push(...unstopResults);
    } catch (err) {
      webcmdService.log(`[SCRAPER ERROR] Unstop: ${err.message}`, 'error');
    }

    // 3. Scrape Devpost for hackathons
    if (category === 'All' || category === 'Hackathon') {
      try {
        const devpostResults = await this.scrapeDevpost(userSkillsLower);
        allResults.push(...devpostResults);
      } catch (err) {
        webcmdService.log(`[SCRAPER ERROR] Devpost: ${err.message}`, 'error');
      }
    }

    // 4. Scrape Internshala for internships
    if (category === 'All' || category === 'Internship') {
      try {
        const internshalaResults = await this.scrapeInternshala(userSkillsLower);
        allResults.push(...internshalaResults);
      } catch (err) {
        webcmdService.log(`[SCRAPER ERROR] Internshala: ${err.message}`, 'error');
      }
    }

    // Deduplicate by title
    const uniqueMap = new Map();
    allResults.forEach(item => {
      const key = item.title.toLowerCase().trim();
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, item);
      }
    });

    let results = Array.from(uniqueMap.values());

    // Filter by search query
    if (query) {
      const q = query.toLowerCase();
      results = results.filter(o =>
        o.title.toLowerCase().includes(q) ||
        o.organization.toLowerCase().includes(q) ||
        (o.tags && o.tags.some(t => t.toLowerCase().includes(q))) ||
        (o.requiredSkills && o.requiredSkills.some(s => s.toLowerCase().includes(q)))
      );
    }

    // Recalculate daysLeft
    results.forEach(r => {
      if (r.deadline) r.daysLeft = this.calcDaysLeft(r.deadline);
    });

    // Sort by deadline (soonest first)
    results.sort((a, b) => {
      if (a.deadline && b.deadline) return new Date(a.deadline) - new Date(b.deadline);
      if (a.deadline) return -1;
      return 1;
    });

    this.setCache(cacheKey, results);
    webcmdService.log(`[LIVE SCRAPER] Total unique results: ${results.length}`, 'success');
    return results;
  }

  // Google Search scraper — uses broader selectors to handle Google's dynamic DOM
  async scrapeGoogleForCategory(skills, category, cgpa) {
    const browser = await this.ensureBrowser();
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      locale: 'en-IN',
      timezoneId: 'Asia/Kolkata'
    });
    const page = await context.newPage();

    const categoryTerms = {
      'Hackathon': 'hackathon 2026 registration open',
      'Internship': 'internship 2026 India apply now',
      'Scholarship': 'scholarship 2026 India undergraduate deadline',
      'Research': 'research fellowship 2026 India students'
    };

    const skillStr = skills.slice(0, 2).join(' ');
    const searchQuery = `${skillStr} ${categoryTerms[category] || category}`;

    webcmdService.log(`[GOOGLE SCRAPER] Searching: "${searchQuery}"`, 'info');

    const results = [];
    try {
      await page.goto(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}&num=10&hl=en`, {
        waitUntil: 'networkidle',
        timeout: 25000
      });

      await page.waitForTimeout(2500);

      // Use a very broad approach: find all links with h3 headings
      const items = await page.evaluate(() => {
        const entries = [];

        // Strategy 1: Find all <a> tags that contain an <h3>
        document.querySelectorAll('a').forEach(a => {
          const h3 = a.querySelector('h3');
          if (h3 && a.href && !a.href.includes('google.com') && !a.href.includes('accounts.google') && a.href.startsWith('http')) {
            // Find the closest parent container and look for snippet text
            let snippet = '';
            const parentContainer = a.closest('div');
            if (parentContainer) {
              const nextSiblings = parentContainer.parentElement?.querySelectorAll('div');
              if (nextSiblings) {
                nextSiblings.forEach(div => {
                  const text = div.textContent?.trim() || '';
                  if (text.length > 40 && text.length < 500 && !text.includes(h3.textContent)) {
                    if (!snippet || text.length > snippet.length) {
                      snippet = text;
                    }
                  }
                });
              }
            }

            entries.push({
              title: h3.textContent.trim(),
              url: a.href,
              snippet: snippet.substring(0, 300)
            });
          }
        });

        return entries;
      });

      webcmdService.log(`[GOOGLE SCRAPER] Found ${items.length} raw results for "${category}"`, 'info');

      for (const item of items.slice(0, 6)) {
        if (isJunkTitle(item.title)) continue;
        if (item.url.includes('youtube.com') || item.url.includes('facebook.com') || item.url.includes('twitter.com')) continue;

        // Try extracting deadline
        const deadlineMatch = item.snippet.match(/(?:deadline|last date|apply by|closes?|ends?|before|due|registration)[\s:]*(\d{1,2}[\s\/\-]\w+[\s\/\-]\d{2,4}|\w+ \d{1,2},?\s*\d{4})/i);
        let deadline = null;
        if (deadlineMatch) {
          try {
            const parsed = new Date(deadlineMatch[1]);
            if (!isNaN(parsed.getTime()) && parsed > new Date()) {
              deadline = parsed.toISOString().split('T')[0];
            }
          } catch (e) { /* could not parse */ }
        }

        if (!deadline) {
          const offsetDays = { 'Hackathon': 40, 'Internship': 55, 'Scholarship': 60, 'Research': 70 };
          deadline = new Date(Date.now() + (offsetDays[category] || 45) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        }

        // Extract amount/prize
        const amountMatch = item.snippet.match(/(₹[\d,\.]+(?:\s*(?:lakhs?|lakh|crore|per month|\/mo|p\.m\.))?|(?:USD|INR|\$)\s*[\d,\.]+(?:\s*\w+)?)/i);

        // Extract org from URL domain
        let organization = 'See source';
        try {
          const urlObj = new URL(item.url);
          organization = urlObj.hostname.replace('www.', '').split('.')[0];
          organization = organization.charAt(0).toUpperCase() + organization.slice(1);
        } catch (e) { /* keep default */ }

        results.push({
          id: `google_${category.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          title: item.title,
          organization,
          category,
          prizeStipend: amountMatch ? amountMatch[1] : (category === 'Scholarship' ? 'See official page' : category === 'Internship' ? 'Stipend varies' : 'See details'),
          location: 'India',
          deadline,
          daysLeft: this.calcDaysLeft(deadline),
          minCgpa: 0,
          url: item.url,
          tags: [...skills.slice(0, 2), category, 'Google Search'],
          requiredSkills: skills.slice(0, 4),
          description: item.snippet || `${category} opportunity found via live Google search for ${skills.join(', ')} students.`,
          source: 'Google (Live)'
        });
      }
    } catch (err) {
      webcmdService.log(`[GOOGLE SCRAPER ERROR] ${err.message}`, 'error');
    } finally {
      await context.close();
    }

    return results;
  }

  // Unstop scraper — targets actual listing cards, not navigation
  async scrapeUnstop(skills, category) {
    const browser = await this.ensureBrowser();
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();

    const results = [];
    const searchTerm = skills.slice(0, 2).join(' ');

    try {
      webcmdService.log(`[UNSTOP SCRAPER] Searching Unstop for: "${searchTerm}"`, 'info');

      // Use the search/listing page that shows actual competition cards
      await page.goto(`https://unstop.com/competitions?searchTerm=${encodeURIComponent(searchTerm)}`, {
        waitUntil: 'domcontentloaded',
        timeout: 25000
      });
      await page.waitForTimeout(4000);

      const items = await page.evaluate(() => {
        const cards = [];
        
        // Unstop listing cards have specific class patterns
        // Target only elements inside the main content area, skip header/nav/footer
        const mainContent = document.querySelector('main, .main-content, .listing-container, [class*="listing"], [class*="content-area"]') || document.body;
        
        // Look for all links that point to specific opportunity pages (contain /competition/, /hackathon/, etc.)
        const opportunityLinks = mainContent.querySelectorAll('a[href*="/competition/"], a[href*="/hackathons/"], a[href*="/internships/"], a[href*="/scholarships/"], a[href*="/p/"], a[href*="/challenge/"]');
        
        const seenUrls = new Set();
        
        opportunityLinks.forEach(link => {
          if (seenUrls.has(link.href)) return;
          
          // Get the card container (parent elements)
          const card = link.closest('[class*="card"], [class*="single"], [class*="listing"], [class*="opportunity"], div') || link;
          
          const titleEl = card.querySelector('h2, h3, h4, .title, [class*="title"]') || link;
          const title = titleEl.textContent.trim();
          
          // Only accept titles that look like real opportunities
          if (title.length >= 10 && title.length < 200) {
            seenUrls.add(link.href);
            
            // Look for date/deadline within the card
            const dateTexts = [];
            card.querySelectorAll('span, p, div, time').forEach(el => {
              const text = el.textContent.trim();
              if (text.match(/\d{1,2}\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i) || 
                  text.match(/\d{4}[-\/]\d{2}[-\/]\d{2}/) ||
                  text.match(/deadline|ends?|closes?/i)) {
                dateTexts.push(text.substring(0, 100));
              }
            });

            // Look for prize info
            let prize = '';
            card.querySelectorAll('span, p, div').forEach(el => {
              const text = el.textContent.trim();
              if (text.match(/₹|prize|reward|stipend|worth|lakh|crore/i) && text.length < 100) {
                if (!prize || text.length > prize.length) prize = text;
              }
            });

            // Look for organization
            let org = '';
            card.querySelectorAll('span, p, div, [class*="org"], [class*="company"], [class*="host"]').forEach(el => {
              const text = el.textContent.trim();
              if (text.length > 3 && text.length < 60 && text !== title && !text.match(/₹|prize|deadline|days/i)) {
                if (!org) org = text;
              }
            });

            cards.push({
              title,
              url: link.href,
              date: dateTexts.join(' | ').substring(0, 200),
              prize,
              org
            });
          }
        });

        return cards.slice(0, 12);
      });

      webcmdService.log(`[UNSTOP SCRAPER] Found ${items.length} opportunity cards`, 'info');

      for (const item of items) {
        if (isJunkTitle(item.title)) continue;

        let deadline = null;
        if (item.date) {
          // Try to parse dates from text
          const dateMatch = item.date.match(/(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s*(\d{4})?/i);
          if (dateMatch) {
            const year = dateMatch[3] || '2026';
            try {
              const parsed = new Date(`${dateMatch[2]} ${dateMatch[1]}, ${year}`);
              if (!isNaN(parsed.getTime()) && parsed > new Date()) {
                deadline = parsed.toISOString().split('T')[0];
              }
            } catch (e) { /* skip */ }
          }
        }
        if (!deadline) {
          deadline = new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        }

        // Detect category from title
        let cat = 'Hackathon';
        const titleLower = item.title.toLowerCase();
        if (titleLower.includes('internship') || titleLower.includes('intern')) cat = 'Internship';
        else if (titleLower.includes('scholarship') || titleLower.includes('grant')) cat = 'Scholarship';
        else if (titleLower.includes('research') || titleLower.includes('fellowship')) cat = 'Research';
        else if (titleLower.includes('quiz') || titleLower.includes('challenge') || titleLower.includes('competition')) cat = 'Hackathon';

        if (category !== 'All' && cat !== category) continue;

        results.push({
          id: `unstop_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          title: item.title,
          organization: item.org || 'Unstop Platform',
          category: cat,
          prizeStipend: item.prize || 'See official page',
          location: 'India',
          deadline,
          daysLeft: this.calcDaysLeft(deadline),
          minCgpa: 0,
          url: item.url.startsWith('http') ? item.url : `https://unstop.com${item.url}`,
          tags: [...skills.slice(0, 2), cat, 'Unstop', 'India'],
          requiredSkills: skills.slice(0, 4),
          description: `${cat} on Unstop: ${item.title}. ${item.prize ? 'Prize: ' + item.prize + '.' : ''} Visit the link for full details and eligibility.`,
          source: 'Unstop (Live)'
        });
      }
    } catch (err) {
      webcmdService.log(`[UNSTOP SCRAPER ERROR] ${err.message}`, 'error');
    } finally {
      await context.close();
    }

    return results;
  }

  // Devpost hackathon scraper
  async scrapeDevpost(skills) {
    const browser = await this.ensureBrowser();
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();

    const results = [];
    const searchTerm = skills.slice(0, 2).join('+');

    try {
      webcmdService.log(`[DEVPOST SCRAPER] Searching Devpost for: "${searchTerm}"`, 'info');

      await page.goto(`https://devpost.com/hackathons?search=${encodeURIComponent(searchTerm)}&status[]=upcoming&status[]=open`, {
        waitUntil: 'domcontentloaded',
        timeout: 25000
      });
      await page.waitForTimeout(4000);

      const items = await page.evaluate(() => {
        const cards = [];
        
        // Devpost hackathon listings have links to individual hackathon pages
        const hackathonLinks = document.querySelectorAll('a[href*=".devpost.com"]');
        const seenUrls = new Set();
        
        hackathonLinks.forEach(link => {
          const href = link.href;
          // Only accept links to hackathon subdomains (e.g., *.devpost.com)
          // Skip devpost.com itself, api.devpost.com, etc.
          if (!href || seenUrls.has(href)) return;
          if (href === 'https://devpost.com' || href === 'https://devpost.com/') return;
          if (href.includes('devpost.com/hackathons') || href.includes('devpost.com/users') || href.includes('devpost.com/software')) return;
          if (href.includes('info.devpost.com') || href.includes('help.devpost.com')) return;
          
          // Get the card/tile container
          const card = link.closest('[class*="tile"], [class*="card"], [class*="challenge"], [class*="hackathon"], li, article') || link;
          
          const titleEl = card.querySelector('h2, h3, h4, .title, [class*="title"]');
          const title = titleEl ? titleEl.textContent.trim() : link.textContent.trim();
          
          if (title.length >= 8 && title.length < 200) {
            seenUrls.add(href);
            
            // Look for host/organization
            let host = '';
            card.querySelectorAll('.host-label, .host, [class*="host"], span, p').forEach(el => {
              const text = el.textContent.trim();
              if (text.length > 3 && text.length < 80 && text !== title && text.match(/hosted|by|organized/i)) {
                if (!host) host = text.replace(/hosted by|organized by/i, '').trim();
              }
            });
            if (!host) {
              // Try extracting from subdomain
              try {
                const hUrl = new URL(href);
                const sub = hUrl.hostname.replace('.devpost.com', '');
                if (sub && sub !== 'devpost' && sub.length > 2) {
                  host = sub.replace(/-/g, ' ');
                  host = host.charAt(0).toUpperCase() + host.slice(1);
                }
              } catch (e) { /* skip */ }
            }

            // Look for prize
            let prize = '';
            card.querySelectorAll('[class*="prize"], span, p').forEach(el => {
              const text = el.textContent.trim();
              if (text.match(/\$[\d,]+|prize|reward/i) && text.length < 80) {
                if (!prize || text.length > prize.length) prize = text;
              }
            });

            // Look for date
            let date = '';
            card.querySelectorAll('[class*="date"], [class*="submission"], time, span').forEach(el => {
              const text = el.textContent.trim();
              if (text.match(/\w+ \d{1,2},? \d{4}|submission|deadline|ends/i) && text.length < 100) {
                if (!date) date = text;
              }
            });

            cards.push({ title, url: href, host, prize, date });
          }
        });
        
        return cards.slice(0, 10);
      });

      webcmdService.log(`[DEVPOST SCRAPER] Found ${items.length} hackathons`, 'info');

      for (const item of items) {
        if (isJunkTitle(item.title)) continue;
        if (item.url.includes('/users/') || item.url.includes('/software/')) continue;

        let deadline = null;
        if (item.date) {
          try {
            const dateClean = item.date.replace(/submissions?:?\s*/i, '').replace(/ends?:?\s*/i, '').trim();
            const parsed = new Date(dateClean);
            if (!isNaN(parsed.getTime()) && parsed > new Date()) {
              deadline = parsed.toISOString().split('T')[0];
            }
          } catch (e) { /* skip */ }
        }
        if (!deadline) {
          deadline = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        }

        results.push({
          id: `devpost_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          title: item.title,
          organization: item.host || 'Devpost Community',
          category: 'Hackathon',
          prizeStipend: item.prize || 'See official page',
          location: 'Online / Global',
          deadline,
          daysLeft: this.calcDaysLeft(deadline),
          minCgpa: 0,
          url: item.url,
          tags: [...skills.slice(0, 2), 'Hackathon', 'Devpost'],
          requiredSkills: skills.slice(0, 4),
          description: `Hackathon on Devpost: ${item.title}. ${item.prize ? 'Prize: ' + item.prize + '.' : ''} ${item.host ? 'Hosted by ' + item.host + '.' : ''} Check the link for full details.`,
          source: 'Devpost (Live)'
        });
      }
    } catch (err) {
      webcmdService.log(`[DEVPOST SCRAPER ERROR] ${err.message}`, 'error');
    } finally {
      await context.close();
    }

    return results;
  }

  // Internshala scraper
  async scrapeInternshala(skills) {
    const browser = await this.ensureBrowser();
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();

    const results = [];
    const skillKeyword = skills[0]?.toLowerCase().replace(/\s+/g, '-') || 'engineering';

    try {
      webcmdService.log(`[INTERNSHALA SCRAPER] Searching Internshala for: "${skillKeyword}"`, 'info');

      await page.goto(`https://internshala.com/internships/${encodeURIComponent(skillKeyword)}-internship/`, {
        waitUntil: 'domcontentloaded',
        timeout: 25000
      });
      await page.waitForTimeout(4000);

      const items = await page.evaluate(() => {
        const cards = [];
        
        // Internshala lists internships as linked cards with specific patterns
        const internshipLinks = document.querySelectorAll('a[href*="/internship/detail/"], a[href*="/internship/"]');
        const seenUrls = new Set();
        
        internshipLinks.forEach(link => {
          if (seenUrls.has(link.href)) return;
          
          const card = link.closest('.individual_internship, .internship_meta, [class*="internship"], [class*="individual"], div') || link;
          
          // Find the job title
          const titleEl = card.querySelector('h3 a, h3, .heading_4_5 a, .profile, a.job-title-href, [class*="profile"]');
          const title = titleEl ? titleEl.textContent.trim() : '';
          
          if (title.length >= 5 && title.length < 200) {
            seenUrls.add(link.href);
            
            // Company name
            let company = '';
            card.querySelectorAll('h4, .company_name, [class*="company"], p').forEach(el => {
              const text = el.textContent.trim();
              if (text.length > 2 && text.length < 80 && text !== title && !text.match(/₹|apply|intern/i)) {
                if (!company) company = text;
              }
            });

            // Stipend
            let stipend = '';
            card.querySelectorAll('[class*="stipend"], span').forEach(el => {
              const text = el.textContent.trim();
              if (text.match(/₹|per month|\/month|stipend/i) && text.length < 60) {
                if (!stipend) stipend = text;
              }
            });

            // Location
            let location = '';
            card.querySelectorAll('[class*="location"], a[class*="location"]').forEach(el => {
              const text = el.textContent.trim();
              if (text.length > 2 && text.length < 60) {
                if (!location) location = text;
              }
            });

            cards.push({
              title,
              company,
              stipend,
              location,
              url: link.href.startsWith('http') ? link.href : 'https://internshala.com' + link.getAttribute('href')
            });
          }
        });

        return cards.slice(0, 8);
      });

      webcmdService.log(`[INTERNSHALA SCRAPER] Found ${items.length} internships`, 'info');

      for (const item of items) {
        if (isJunkTitle(item.title)) continue;

        const deadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        results.push({
          id: `internshala_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          title: item.title,
          organization: item.company || 'Internshala Listing',
          category: 'Internship',
          prizeStipend: item.stipend || 'See listing',
          location: item.location || 'India',
          deadline,
          daysLeft: this.calcDaysLeft(deadline),
          minCgpa: 0,
          url: item.url,
          tags: [...skills.slice(0, 2), 'Internship', 'Internshala', 'India'],
          requiredSkills: skills.slice(0, 4),
          description: `Internship: ${item.title} at ${item.company || 'a company'}. ${item.stipend ? 'Stipend: ' + item.stipend + '.' : ''} ${item.location ? 'Location: ' + item.location + '.' : ''} Apply via link.`,
          source: 'Internshala (Live)'
        });
      }
    } catch (err) {
      webcmdService.log(`[INTERNSHALA SCRAPER ERROR] ${err.message}`, 'error');
    } finally {
      await context.close();
    }

    return results;
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

export const liveWebScraper = new LiveWebScraper();
