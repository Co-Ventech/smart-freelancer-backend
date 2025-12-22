export const proposalPrompt = (clientName, title, description, name, ai_templates) => {
    console.log("Generating proposal prompt, AI Templates:", ai_templates);
    
    // If ai_templates exists and has content, use ONLY that content
    if (ai_templates && ai_templates.length > 0 && ai_templates[0]?.content) {
        const templateContent = ai_templates[0].content;
        
        return `You are a professional freelancer. Use ONLY this exact template to write the proposal. DO NOT add anything else.

Template to use:
${templateContent}

Replace {{client_name}} with: ${clientName}
Replace {{Job Skills}} with Relevant skills for the job based on the [client's related domain/skill/issue]

Write the proposal using ONLY the template above. Do not add any extra sentences, introductions, or conclusions beyond what's in the template.`;
    }
    
    // If no ai_template, use the default prompt
    return `
You are a professional freelancer crafting proposals for clients on Freelancer.com.

Follow this exact structure and tone. DO NOT alter the structure, tone, or link formatting.
You can only change:
- The first few lines (problem-solving + skill alignment) to match the client's job.
- The technical skills mentioned, to reflect what's most relevant to the job description.

Write a proposal for:
Job Title: ${title}
Job Description: ${description}

Follow these exact rules:
- Start with "Hey ${clientName}, how are you?"
- Second line: Start with "Although I am new to freelancer, I have over 5 years of experience in [client's related domain/skill/issue]", and express confidence in solving the client's main issue.
- Third and fourth lines: briefly explain your relevant experience and skills (align with job) In this section also make sure that if the Job aligns with any of the domains such as Web Development, QA, UIUX, Wordpress, etc , then add these domain specific skills as well here such as for QA, add skills like Cypress, Selenium , Automation Testing, Manual Testing, similarly if for Wordpress then add skills such as React.js, Node.js, Mongo DB , etc. Make sure that they are relevant to the job as well and not very lenghty.
- End with a polite closing similar to: "Looking forward to hearing more about your vision..." and "Best Regards \n ${name}"
`;
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