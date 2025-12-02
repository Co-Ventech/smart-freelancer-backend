import { filterStrongSkills, generateProposal, scoreSkills } from "../services/skill-service.mjs";

export const updateGeneralProposal = (client_name, skills, job_title, job_description, proposal, bidder_name) => {
    // 1. Score skills using TF-IDF + Cosine similarity
    const scoredSkills = scoreSkills(skills, job_title, job_description);

    // 2. Select skills with score >= 1
    const threshold = 1;
    const strongSkills = filterStrongSkills(scoredSkills, threshold);

    // 3. Generate proposal
    const finalProposal = generateProposal(client_name, strongSkills, proposal, bidder_name);

    return finalProposal
};
