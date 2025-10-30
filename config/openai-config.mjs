import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

export const openai_client = new OpenAI({
    apiKey: process.env.OPEN_AI_API_KEY,
}).chat.completions;
