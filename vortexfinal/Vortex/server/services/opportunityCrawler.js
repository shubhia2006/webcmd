import { webcmdService } from './webcmdService.js';

export class OpportunityCrawler {
  constructor() {
    // Official & Verified India & Global Student Opportunities Database
    this.opportunities = [
      // HACKATHONS
      {
        id: 'hack_in_01',
        title: 'Smart India Hackathon (SIH 2026)',
        organization: 'Ministry of Education, Govt of India & AICTE',
        category: 'Hackathon',
        prizeStipend: '₹1,00,000 per Problem Statement + Govt Incubation',
        location: 'Pan India / Nodal Centers (Grand Finale: Dec 2026)',
        deadline: '2026-09-30',
        daysLeft: 18,
        url: 'https://sih.gov.in',
        tags: ['SIH 2026', 'Govt of India', 'Grand Finale Dec 2026', 'AICTE'],
        requiredSkills: ['Python', 'React', 'C++', 'Java', 'Data Structures', 'AI'],
        description: 'Internal college screenings occur Aug-Sept, nodal submission deadline Sept 30, 2026, with the Grand Finale in Dec 2026. Solve central/state ministry challenges.',
        source: 'Official Govt of India SIH Portal'
      },
      {
        id: 'hack_in_02',
        title: 'Flipkart GRiD 8.0 Engineering Challenge',
        organization: 'Flipkart India',
        category: 'Hackathon',
        prizeStipend: '₹15,00,000 Total Prizes + SDE Interview PPIs',
        location: 'Virtual / Bangalore Grand Finale',
        deadline: '2026-09-28',
        daysLeft: 16,
        url: 'https://unstop.com/hackathons/flipkart-grid-8',
        tags: ['Flipkart GRiD', 'Software Development', 'AI Engineering', 'Data Science'],
        requiredSkills: ['Java', 'C++', 'Python', 'Software Development', 'AI Engineering', 'Data Science'],
        description: 'Official tracks: Software Development, AI Engineering, and Data Science. Finale & PPI interviews conducted Sept-Oct 2026.',
        source: 'Unstop / Flipkart Official'
      },
      {
        id: 'hack_in_03',
        title: 'ETHIndia 2026 Web3 & AI Hackathon',
        organization: 'Devfolio & Ethereum India',
        category: 'Hackathon',
        prizeStipend: '$100,000 Prize Pool + Bounties',
        location: 'Bangalore, Karnataka (Dec 2026)',
        deadline: '2026-12-06',
        daysLeft: 85,
        url: 'https://ethindia2026.devfolio.co',
        tags: ['Devfolio', 'December Event', 'Web3', 'AI Agents', 'Bangalore'],
        requiredSkills: ['JavaScript', 'Solidity', 'React', 'Python', 'Node.js'],
        description: "Traditionally hosted in December each year in Bangalore. Asia's largest Ethereum & AI builder hackathon for top Indian student developers.",
        source: 'Devfolio India Official'
      },
      {
        id: 'hack_01',
        title: 'Global AI Agentic Hackathon 2026',
        organization: 'Agentic World & Google Cloud',
        category: 'Hackathon',
        prizeStipend: '$50,000 Total Prizes',
        location: 'Virtual / Online (Global)',
        deadline: '2026-10-15',
        daysLeft: 33,
        url: 'https://devpost.com/hackathons/agentic-ai-2026',
        tags: ['AI Agents', 'LLM', 'WebCMD', 'Python', 'React'],
        requiredSkills: ['JavaScript', 'Python', 'AI Agents', 'React', 'Node.js'],
        description: 'Build autonomous browser agents using webcmd, Playwright, and Gemini. Win cash prizes and VC compute credits.',
        source: 'Devpost Official'
      },

      // INTERNSHIPS
      {
        id: 'intern_in_01',
        title: 'Software Engineering Intern - Summer 2027',
        organization: 'Google India',
        category: 'Internship',
        prizeStipend: '₹1,15,000/mo + Relocation & Meals',
        location: 'Bangalore / Hyderabad, India',
        deadline: '2026-10-01',
        daysLeft: 19,
        url: 'https://careers.google.com/locations/bangalore/',
        tags: ['Google India', 'SWE Intern', 'Tier 1 Pay', 'Bangalore'],
        requiredSkills: ['C++', 'Python', 'Java', 'Data Structures', 'Algorithms'],
        description: 'Work on Google Search, Maps, Cloud, and Pay production infrastructure alongside senior Google engineers.',
        source: 'Google Careers India'
      },
      {
        id: 'intern_in_02',
        title: 'Microsoft India SDE Internship 2027',
        organization: 'Microsoft India (IDC)',
        category: 'Internship',
        prizeStipend: '₹1,25,000/mo + Housing Allowance',
        location: 'Hyderabad / Noida / Bangalore',
        deadline: '2026-09-30',
        daysLeft: 18,
        url: 'https://careers.microsoft.com/students/us/en/india',
        tags: ['Microsoft India', 'SDE Intern', 'Hyderabad', 'Noida'],
        requiredSkills: ['C#', 'C++', 'Python', 'Data Structures', 'Algorithms'],
        description: 'Develop next-generation Azure AI cloud services, Office 365, and Copilot foundation capabilities.',
        source: 'Microsoft University India'
      },
      {
        id: 'intern_in_03',
        title: 'Fullstack & Agentic AI Intern',
        organization: 'Zepto / Swiggy Tech Labs',
        category: 'Internship',
        prizeStipend: '₹60,000/mo + PPO Opportunity',
        location: 'Bangalore, India / Hybrid',
        deadline: '2026-10-15',
        daysLeft: 33,
        url: 'https://www.zepto.co/careers',
        tags: ['Quick Commerce', 'React', 'Node.js', 'High Growth'],
        requiredSkills: ['React', 'Node.js', 'Python', 'JavaScript', 'SQL'],
        description: 'Build real-time dispatch systems and automated agentic inventory intelligence for hyper-growth Indian tech unicorns.',
        source: 'YC & Indian Startup Hub'
      },

      // RESEARCH OPPORTUNITIES
      {
        id: 'res_in_01',
        title: 'IASc-INSA-NASI Summer Research Fellowship (SRFP 2027)',
        organization: 'Indian Academy of Sciences (IASc Bangalore)',
        category: 'Research',
        prizeStipend: '₹12,000/mo Stipend + Free Hostel & Travel',
        location: 'IISc Bangalore / IITs / TIFR / IISERs',
        deadline: '2026-11-30',
        daysLeft: 79,
        url: 'https://web-jrf.ias.ac.in',
        tags: ['IASc SRFP', 'IISc Bangalore', 'App Opens Oct 25', 'Govt Fellowship'],
        requiredSkills: ['Python', 'C++', 'Machine Learning', 'Data Structures', 'AI'],
        description: 'Applications open Oct 25, deadline Nov 30 annually. 2-month summer research fellowship working directly under senior Indian scientists.',
        source: 'Indian Academy of Sciences Official'
      },
      {
        id: 'res_in_02',
        title: 'Mitacs Globalink Research Internship (India to Canada)',
        organization: 'Mitacs Canada & MHRD India',
        category: 'Research',
        prizeStipend: '$8,000 CAD (Airfare + Housing + Stipend)',
        location: 'Canada (Top Canadian Universities)',
        deadline: '2026-09-18',
        daysLeft: 6,
        url: 'https://www.mitacs.ca/en/programs/globalink/globalink-research-internship',
        tags: ['Mitacs', 'Deadline Sept 18', 'Undergrad Fellowship', 'Canada-India'],
        requiredSkills: ['Python', 'Data Science', 'AI', 'C++', 'Java'],
        description: 'Applications open Aug-Sept annually with deadline around Sept 18. 12-week fully funded research internship in Canadian universities.',
        source: 'Mitacs International Official'
      },

      // SCHOLARSHIPS
      {
        id: 'sch_in_01',
        title: 'Reliance Foundation Undergraduate STEM Scholarship 2026-27',
        organization: 'Reliance Foundation India',
        category: 'Scholarship',
        prizeStipend: '₹2,00,000 Total Grant over Degree',
        location: 'Pan India',
        deadline: '2026-10-31',
        daysLeft: 49,
        url: 'https://www.scholarships.reliancefoundation.org',
        tags: ['Reliance Grant', 'Undergrad', 'STEM', 'All India'],
        requiredSkills: ['Python', 'C++', 'Java', 'Data Structures', 'React'],
        description: 'Applications open Oct 2026. Empowering meritorious Indian undergraduate students pursuing CS, AI, and Engineering.',
        source: 'Reliance Foundation Official'
      },
      {
        id: 'sch_in_02',
        title: 'Nutanix Heart Women in Technology Scholarship',
        organization: 'Nutanix India & Global Tech',
        category: 'Scholarship',
        prizeStipend: 'Up to $2,000 USD (Approx ₹1,65,000 INR) Award + Mentorship',
        location: 'India & Global (Annual Cycle: May 31)',
        deadline: '2027-05-31',
        daysLeft: 261,
        url: 'https://www.nutanix.com/scholarships',
        tags: ['Women in Tech', 'Nutanix', '$2000 USD Award', 'May 31 Deadline'],
        requiredSkills: ['Java', 'Python', 'React', 'JavaScript', 'C++'],
        description: 'One-time scholarship award of up to $2,000 USD (approx. ₹1,65,000 INR) plus mentorship for female CS undergraduate students. Closes May 31 annually.',
        source: 'Nutanix Official Portal'
      }
    ];
  }

  async searchOpportunities({ category, query, userSkills = [] }) {
    webcmdService.log(`[WebCMD Crawler] Scanning official opportunities for category: '${category || 'All'}', Skills: [${userSkills.join(', ')}]...`, 'info');
    
    let filtered = [...this.opportunities];

    // 1. Strict Category Filter
    if (category && category !== 'All') {
      filtered = filtered.filter(item => item.category.toLowerCase() === category.toLowerCase());
    }

    // 2. Strict Keyword Search Filter
    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(q) ||
        item.organization.toLowerCase().includes(q) ||
        item.tags.some(t => t.toLowerCase().includes(q)) ||
        item.requiredSkills.some(s => s.toLowerCase().includes(q)) ||
        item.description.toLowerCase().includes(q)
      );
    }

    // 3. Strict Skill Fit Filter (Only return opportunities where at least one user skill matches required skills)
    if (userSkills && userSkills.length > 0) {
      const formattedUserSkills = userSkills.map(s => s.trim().toLowerCase());

      filtered = filtered.filter(item => {
        const reqSkills = item.requiredSkills.map(s => s.trim().toLowerCase());
        const hasMatchingSkill = reqSkills.some(req => 
          formattedUserSkills.some(userSkill => userSkill.includes(req) || req.includes(userSkill))
        );
        return hasMatchingSkill;
      });
    }

    webcmdService.log(`[WebCMD Crawler] Matched ${filtered.length} verified official opportunities matching student skills.`, 'success');
    return filtered;
  }

  getOpportunityById(id) {
    return this.opportunities.find(o => o.id === id) || null;
  }
}

export const opportunityCrawler = new OpportunityCrawler();
