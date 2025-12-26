export const proposalPrompt = (clientName, title, description, name, ai_templates,) => {
    console.log("Generating proposal prompt, AI Templates:", ai_templates);


    // If ai_templates exists and has content, use ONLY that content
    if (ai_templates && ai_templates.length > 0 && ai_templates[0]?.content) {
        const templateContent = ai_templates[0].content;

        templateContent.replace(/{{client_name}}/g, clientName ? clientName : "Best Regards");
        templateContent.replace(/{{job_skills}}/g, "Relevant skills for the job based on the [client's related domain/skill/issue]");
        templateContent.replace(/{{title}}/g, title);
        templateContent.replace(/{{{matching_job_skills}}/g, "Relevant skills for the job based on the [client's related domain/skill/issue]");
        templateContent.replace(/{{name}}/g, name);
        return `
           
           This is the example template to be used for creating a unique proposal for the job:
           ${templateContent}

           Requirements:
           - Portfolio links: If portfolio link ${ai_templates[0]?.portfolioLinks} is empty or undefined, DO NOT about my portfolio in the proposal; otherwise, REPLACE IT. DO NOT fabricate any links. In addition to, DO NOT mention Placeholder text like "[Portfolio Link Placeholder: https://abc.com]" in the proposal if portfolio links are available. You can mention the portfolio links naturally in the proposal if they are available.
           - DO NOT use placeholders like {{client_name}}, {{job_skills}}, {{title}}, {{matching_job_skills}}, {{name}}, {{portfolio_links}} in the final proposal.
           - IF ANY placeholder data is missing, DO NOT mention or create a placeholder for it.
           - NOTE : KEEP THE PROPOSAL SHORT AND CONCISE AND TO THE POINT.

           job Title: ${title}
           Job Description: ${description}

           `
    }


    return `
Act like a senior freelance proposal copywriter and conversion-focused sales strategist who specializes in crafting short, high-conversion proposals for platforms like Upwork, Freelancer, and direct client outreach.

Your goal is to create a short, unique, dynamic, and highly appealing client proposal that immediately grabs attention, communicates relevance, and maximizes reply rates.

Task:
Write a concise, personalized, and outcome-driven proposal that feels human, confident, and credible. The proposal should position the sender as an ideal fit within the first 2–3 lines.

Step-by-step instructions:
1) Carefully read the client’s job description to understand their core problem, priorities, and desired outcomes.
2) Identify the sender’s strongest value proposition by matching skills, experience, and past work to the client’s needs.
3) Start with a compelling opening like: 
"${clientName ? `Hi ${clientName}` : "Hi"}, 
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
- Portfolio links: ${ai_templates[0]?.portfolioLinks}. If it is empty or undefined, DO NOT mention the portfolio in the proposal; otherwise, mention them. DO NOT fabricate any links. In addition to, DO NOT mention Placeholder text like "[Portfolio Link Placeholder: https://abc.com]" in the proposal if portfolio links are available. You can mention the portfolio links naturally in the proposal if they are available.
- End the Proposal with 
"Best Regards,
${name}"
- Keep it short and concise.
- Keep my experience relevant to the job description and use "4+" as number of experience instead of "X" wherever expeience is needed in job description.


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