import { webcmdService } from './webcmdService.js';

export class AIMatcher {
  calculateMatchScore(profile, opportunity) {
    if (!profile || !profile.skills || profile.skills.length === 0) {
      return { score: 0, matchedSkills: [], missingSkills: opportunity.requiredSkills || [], matchHighlights: [], cgpaStatus: 'Not Entered' };
    }

    const userSkills = profile.skills.map(s => s.trim().toLowerCase()).filter(Boolean);
    const reqSkills = (opportunity.requiredSkills || []).map(s => s.trim().toLowerCase()).filter(Boolean);
    
    const matchedSkills = [];
    const missingSkills = [];

    reqSkills.forEach(req => {
      if (userSkills.some(u => u === req || u.includes(req) || req.includes(u))) {
        matchedSkills.push(req);
      } else {
        missingSkills.push(req);
      }
    });

    // Also check if any user skill appears in the title/description/tags
    let contextBonus = 0;
    const titleLower = (opportunity.title || '').toLowerCase();
    const descLower = (opportunity.description || '').toLowerCase();
    const tagsLower = (opportunity.tags || []).map(t => t.toLowerCase());

    userSkills.forEach(skill => {
      if (titleLower.includes(skill) || descLower.includes(skill) || tagsLower.some(t => t.includes(skill))) {
        contextBonus += 5;
      }
    });
    contextBonus = Math.min(contextBonus, 20); // Cap at 20

    // Skill Match Ratio
    const skillRatio = reqSkills.length > 0 ? matchedSkills.length / reqSkills.length : 0.5; // Default 0.5 if no required skills listed
    
    // User Skill Coverage
    let userSkillOverlapCount = 0;
    userSkills.forEach(u => {
      if (reqSkills.some(req => u === req || u.includes(req) || req.includes(u))) {
        userSkillOverlapCount++;
      }
    });
    const userCoverageRatio = userSkills.length > 0 ? userSkillOverlapCount / userSkills.length : 0;

    let rawScore = Math.round((skillRatio * 45) + (userCoverageRatio * 25) + contextBonus);

    // CGPA Factor Calculation
    let cgpaBonus = 0;
    let cgpaStatus = 'No Cutoff';
    let cgpaHighlight = 'No CGPA Cutoff — Pure Skill Based';

    // Extract numerical CGPA (e.g. "8.9/10" -> 8.9, "7.5" -> 7.5)
    let userCgpa = 0;
    if (profile.gpa) {
      const parsedGpa = parseFloat(profile.gpa.toString().replace('/10', '').replace('/4.0', ''));
      if (!isNaN(parsedGpa)) userCgpa = parsedGpa;
    }

    const minCgpaReq = opportunity.minCgpa || 0;

    if (minCgpaReq > 0 && userCgpa > 0) {
      if (userCgpa >= minCgpaReq) {
        cgpaBonus = 15;
        cgpaStatus = 'Eligible';
        cgpaHighlight = `CGPA (${userCgpa}/10) satisfies min cutoff of ${minCgpaReq}/10 (+15% Merit Boost)`;
      } else {
        cgpaBonus = -40;
        cgpaStatus = 'Ineligible CGPA';
        cgpaHighlight = `⚠️ CGPA (${userCgpa}/10) is below target minimum (${minCgpaReq}/10)`;
      }
    } else if (userCgpa > 0) {
      // No CGPA requirement — give a small bonus for having a good CGPA
      if (userCgpa >= 8.0) {
        cgpaBonus = 10;
        cgpaHighlight = `Strong CGPA (${userCgpa}/10) — No specific cutoff for this opportunity`;
      } else if (userCgpa >= 6.5) {
        cgpaBonus = 5;
        cgpaHighlight = `CGPA (${userCgpa}/10) — No specific cutoff for this opportunity`;
      } else {
        cgpaHighlight = `CGPA (${userCgpa}/10) — No specific cutoff listed`;
      }
      cgpaStatus = 'No Cutoff';
    }

    rawScore += cgpaBonus;

    // If no skills matched at all and no context bonus, keep score low
    if (matchedSkills.length === 0 && contextBonus === 0) {
      rawScore = Math.min(15, rawScore);
    }

    const finalScore = Math.min(99, Math.max(0, rawScore));

    webcmdService.log(`[AI Matcher] "${opportunity.title}" | Student CGPA: ${userCgpa} (Min: ${minCgpaReq}) | Match Score: ${finalScore}%`, 'info');

    const highlights = [];
    if (matchedSkills.length > 0) {
      highlights.push(`Matches skills: ${matchedSkills.join(', ')}`);
    } else if (contextBonus > 0) {
      highlights.push(`Related to your skills (found in title/description)`);
    } else {
      highlights.push(`Skills gap: ${missingSkills.slice(0, 3).join(', ')}`);
    }
    highlights.push(cgpaHighlight);

    return {
      score: finalScore,
      matchedSkills,
      missingSkills,
      cgpaStatus,
      cgpaHighlight,
      matchHighlights: highlights
    };
  }

  generateColdEmail(profile, opportunity) {
    webcmdService.log(`Generating personalized cold email for ${opportunity.organization}...`, 'info');
    
    const matchedStr = profile.skills.slice(0, 3).join(', ');

    return `Subject: Application Inquiry for ${opportunity.title} - ${profile.name} (${profile.university || 'CS Student'})

Dear Hiring Manager / Coordinator at ${opportunity.organization},

I am writing to express my strong enthusiasm for the ${opportunity.title} role. As a student at ${profile.university || 'University'} (CGPA: ${profile.gpa || 'N/A'}) with technical skills in ${matchedStr}, I have been actively following your work in ${(opportunity.tags || []).join(', ')}.

In my recent coursework and projects, I developed applications using ${profile.skills[0] || 'software development'}. The ${opportunity.title} opportunity aligns directly with my background in ${(opportunity.requiredSkills || []).slice(0, 2).join(' & ')}.

I would welcome the opportunity to discuss how my background can contribute to ${opportunity.organization}. My resume and portfolio details are available below.

Thank you for your time and consideration.

Best regards,

${profile.name}
Email: ${profile.email}
CGPA: ${profile.gpa || 'N/A'}
University: ${profile.university}`;
  }

  generateCoverLetter(profile, opportunity) {
    webcmdService.log(`Generating custom cover letter for ${opportunity.title}...`, 'info');

    return `COVER LETTER: ${opportunity.title}
Target Organization: ${opportunity.organization}
Applicant: ${profile.name} (CGPA: ${profile.gpa || 'N/A'}, Email: ${profile.email})

Dear Selection Committee,

I am writing to submit my application for the ${opportunity.title} position at ${opportunity.organization}. As a dedicated student at ${profile.university} with a CGPA of ${profile.gpa || 'N/A'} and proficiency in ${profile.skills.join(', ')}, I am excited to apply my skills to your team.

Key Qualifications:
1. Technical Skills: Experienced in ${profile.skills.slice(0, 3).join(', ')}.
2. Academic Standing: Maintained a CGPA of ${profile.gpa || 'N/A'}, fulfilling academic criteria.
3. Alignment: Eager to contribute to ${(opportunity.tags || []).join(', ')}.

I look forward to discussing how my experience aligns with ${opportunity.organization}.

Sincerely,
${profile.name}`;
  }
}

export const aiMatcher = new AIMatcher();
