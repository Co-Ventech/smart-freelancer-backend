import natural from 'natural';
function getSimilarity(skillName, jobText) {
    const tfidf = new natural.TfIdf();

    // Add documents
    tfidf.addDocument(jobText);       // doc[0] = Job Description
    tfidf.addDocument(skillName);     // doc[1] = Skill Name

    // Convert both to vectors
    const jobVector = [];
    const skillVector = [];

    tfidf.listTerms(0).forEach(term => {
        jobVector.push(term.tfidf);
        skillVector.push(tfidf.tfidf(term.term, 1));
    });

    // Cosine similarity
    const dot = jobVector.reduce((sum, val, i) => sum + val * skillVector[i], 0);
    const magnitudeA = Math.sqrt(jobVector.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(skillVector.reduce((sum, val) => sum + val * val, 0));

    if (magnitudeA === 0 || magnitudeB === 0) return 0;

    return dot / (magnitudeA * magnitudeB); // value between 0–1
}

export function scoreSkills(skills, jobTitle, jobDescription) {
    const jobText = (jobTitle + " " + jobDescription).toLowerCase();

    return skills?.map(skill => {
        const similarity = getSimilarity(skill.name.toLowerCase(), jobText);

        return {
            ...skill,
            score: Math.round(similarity * 10) // convert 0-1 → 0-10
        };
    });
}

export function filterStrongSkills(scoredSkills, threshold = 6) {
    return scoredSkills
        .filter(s => s.score >= threshold)
        .map(s => s.name);
}

export function generateProposal(clientName, skills, template, bidderName) {
    const skillsText = skills.length ? skills.join(", ") : "the required technologies";

    return template
        .replace("{{client_name}}", clientName)
        .replace("{{skills}}", skillsText)
        .replace("{{bidder_name}}", bidderName);
}
