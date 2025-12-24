export const proposalPrompt = (clientName, title, description, name, ai_templates) => {
    console.log("Generating proposal prompt, AI Templates:", ai_templates);

    //     // If ai_templates exists and has content, use ONLY that content
    //     if (ai_templates && ai_templates.length > 0 && ai_templates[0]?.content) {
    //         const templateContent = ai_templates[0].content;

    //         return `You are a professional freelancer. Use the given example template and create a unique proposal for this :
    // Job Title: ${title}
    // Job Description: ${description} 

    // Example Template:
    // ${templateContent}

    // Replace {{client_name}} with: ${clientName}. if client name is not available, use "Best Regards" , End with name: ${name}.
    // Replace {{job_skills}} with Relevant skills for the job based on the [client's related domain/skill/issue]

    // Make sure the proposal is relevant to the job description provided above.`;
    //     }

    //     // If no ai_template, use the default prompt
    //     return `
    // You are a professional freelancer crafting proposals for clients on Freelancer.com.

    // Follow this exact structure and tone. DO NOT alter the structure, tone, or link formatting.
    // You can only change:
    // - The first few lines (problem-solving + skill alignment) to match the client's job.
    // - The technical skills mentioned, to reflect what's most relevant to the job description.

    // Write a proposal for:
    // Job Title: ${title}
    // Job Description: ${description}

    // Follow these exact rules:
    // - Start with "Hey ${clientName}, how are you?"
    // - Second line: Start with "Although I am new to freelancer, I have over 5 years of experience in [client's related domain/skill/issue]", and express confidence in solving the client's main issue.
    // - Third and fourth lines: briefly explain your relevant experience and skills (align with job) In this section also make sure that if the Job aligns with any of the domains such as Web Development, QA, UIUX, Wordpress, etc , then add these domain specific skills as well here such as for QA, add skills like Cypress, Selenium , Automation Testing, Manual Testing, similarly if for Wordpress then add skills such as React.js, Node.js, Mongo DB , etc. Make sure that they are relevant to the job as well and not very lenghty.
    // - End with a polite closing similar to: "Looking forward to hearing more about your vision..." and "Best Regards \n ${name}"
    // `;

    return `
Act like a senior freelance proposal copywriter and conversion-focused sales strategist who specializes in crafting short, high-conversion proposals for platforms like Upwork, Freelancer, and direct client outreach.

Your goal is to create a short, unique, dynamic, and highly appealing client proposal that immediately grabs attention, communicates relevance, and maximizes reply rates.

Task:
Write a concise, personalized, and outcome-driven proposal that feels human, confident, and credible. The proposal should position the sender as an ideal fit within the first 2–3 lines.

Step-by-step instructions:
1) Carefully read the client’s job description to understand their core problem, priorities, and desired outcomes.
2) Identify the sender’s strongest value proposition by matching skills, experience, and past work to the client’s needs.
3) Start with a compelling opening like: 
"${clientName ?`Hi ${clientName}`:"Hi"}, 
I went through your job description and I am 100% ready to work on this project" or similar attractive sentence to signal understanding and relevance. 
4) Condense skills and experience into 1–2 impactful lines emphasizing results, not just years of experience.
5) Integrate credibility naturally, referencing portfolio platforms, companies, or projects as proof of execution IF it is present.
6) Maintain a professional, warm, and confident tone that feels approachable and trustworthy.
7) End with a clear, low-pressure call to action encouraging the client to start a conversation.
8) Keep the proposal between 80–120 words, ensuring each sentence adds value.

Requirements:
- Use placeholders such as ${clientName} and add relevant skills for the job.
- Avoid clichés, buzzwords, hype, or exaggerated claims.
- Write in clear, simple English with smooth flow.
- Do not include explanations or meta-commentary; only the final proposal text.
- Portfolio links: ${ai_templates?.portfolioLinks}. If it is empty or undefined, DO NOT mention the portfolio in the proposal; otherwise, mention them.
- End the Proposal with 
"Best Regards,
${name}"

Constraints:
- Format: Plain text with short, readable paragraphs.
- Style: Persuasive, confident, concise, and natural.
- Scope: Output only the final proposal.
- Self-check: Ensure clarity, relevance, brevity, and uniqueness before finalizing.

Take a deep breath and work on this problem step-by-step.

Here is a job title : ${title}
job description: ${description}


`
}

// this is commented for future use
// - Include this section exactly:
//   You can review a few of my past work:
//   https://app.recruitinn.ai
//   https://skillbuilder.online
//   https://co-ventech.com
//   https://app.co-ventech.com
//   https://www.starmarketingonline.com/
//   https://teamwear.design/
//   https://visanetic.com/
//   https://drivefds.com/
//   https://gfsbuilders.com.pk/
//   https://bachatt.com/