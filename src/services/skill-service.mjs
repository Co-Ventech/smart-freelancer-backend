import natural from 'natural';
import { jobRolesDB, keywordsDB } from "../skills-data/skills-data.mjs";

// Clean text
function cleanText(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9+#. ]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

// Cosine similarity
function cosineSimilarity(docA, docB) {
    const tfidf = new natural.TfIdf();
    tfidf.addDocument(docA);
    tfidf.addDocument(docB);

    const terms = new Set();
    tfidf.listTerms(0).forEach(t => terms.add(t.term));
    tfidf.listTerms(1).forEach(t => terms.add(t.term));

    const vecA = [];
    const vecB = [];
    for (const term of terms) {
        vecA.push(tfidf.tfidf(term, 0));
        vecB.push(tfidf.tfidf(term, 1));
    }

    const dot = vecA.reduce((s, v, i) => s + v * vecB[i], 0);
    const magA = Math.sqrt(vecA.reduce((s, v) => s + v * v, 0));
    const magB = Math.sqrt(vecB.reduce((s, v) => s + v * v, 0));
    if (!magA || !magB) return 0;

    return dot / (magA * magB);
}

// Detect job role (only from jobRolesDB)
export function detectJobRole(jobTitle, jobDescription) {
    const text = cleanText(jobTitle + " " + jobDescription);

    const scored = Object.keys(jobRolesDB)
        .map(role => ({
            role,
            score: cosineSimilarity(role, text)
        }))
        .sort((a, b) => b.score - a.score);

    return scored[0]?.role || null;
}

// Append skills by role + keyword scanning
export function appendSkillsBasedOnJob(skills, jobTitle, jobDescription) {
    const text = cleanText(jobTitle + " " + jobDescription);
    const detectedRole = detectJobRole(jobTitle, jobDescription);

    // Start with user-selected skills
    const skillSet = new Set(skills.map(s => s.name.toLowerCase()));

    // Add role skills
    if (detectedRole) {
        jobRolesDB[detectedRole].forEach(s => skillSet.add(s.toLowerCase()));
    }

    // Add keyword-based skills
    for (const keyword of Object.keys(keywordsDB)) {
        if (text.includes(keyword.toLowerCase())) {
            keywordsDB[keyword].forEach(s =>
                skillSet.add(s.toLowerCase())
            );
        }
    }

    return [...skillSet].map(name => ({ name }));
}

// Score skills
export function scoreSkills(skills, jobTitle, jobDescription) {
    const jobText = cleanText(jobTitle + " " + jobDescription);

    return skills?.map(skill => ({
        ...skill,
        score: Number((cosineSimilarity(cleanText(skill.name), jobText) * 100).toFixed(2))
    })).sort((a, b) => b.score - a.score);
}

// Strong skills
export function filterStrongSkills(scoredSkills, threshold = 5) {
    return scoredSkills.filter(s => s.score >= threshold).map(s => s.name);
}

// Proposal generation
export function generateProposal(clientName, skills, template, bidderName) {
    const skillsText = skills.length ? skills.join(", ") : "the required skills";
    // const concatenatedTemplate = template?.reduce((prev, curr) => prev + curr.content, "");
    const newProposal = template?.sort((a, b) => a.order - b.order)?.filter(a => a.alwaysInclude)?.reduce((prev, curr) => prev + curr.content + "\n", "");
    return newProposal
        ?.replace(/{{client_name}}/g, clientName)
        ?.replace(/{{skills}}/g, skillsText)
        ?.replace(/{{bidder_name}}/g, bidderName);
}
