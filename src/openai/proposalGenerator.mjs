import fs from "fs";
import path from "path";
import { proposalPrompt } from "../helper/prompts.mjs";
import { openai_client } from "../../config/openai-config.mjs";

// === Load the email template ===
const templatePath = path.resolve("src/templates/email_templates.json");
let universalTemplate = "";

try {
    const data = JSON.parse(fs.readFileSync(templatePath, "utf-8"));
    universalTemplate = data.freelancer_template?.base_structure || "";
} catch (error) {
    console.error("❌ Missing or invalid email_templates.json:", error);
    process.exit(1);
}

if (!universalTemplate) {
    throw new Error("❌ Missing base_structure inside freelancer_template in email_templates.json");
}

// === Function to generate proposal ===
export async function generateAIProposal(clientName, title, description, name) {
    const prompt = proposalPrompt(clientName, title, description, name);

    try {
        const response = await openai_client.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are an expert in writing natural, confident, and human-like Freelancer proposals.",
                },
                { role: "user", content: prompt },
            ],
            temperature: 0.7,
            max_tokens: 600,
        });

        return {
            status: 200,
            message: "Proposal Generated Successfully",
            data: response.choices[0].message.content.trim()
        };
    } catch (error) {
        console.error("❌ Error generating proposal:", error);
        return {
            status: 500,
            message: "Error in Generating Proposal: " + error?.message,
        };
    }
}

