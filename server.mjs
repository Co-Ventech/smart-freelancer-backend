import express from "express";
import dotenv from "dotenv";
import { generateProposal } from "./openai/proposalGenerator.mjs";
import { getSavedBidController, saveBidHistoryController } from "./controller/bid-controller.mjs";
import { applyKpisToSavedBids } from "./controller/freelancer-kpi-controller.mjs";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: '*'
}));

// === POST route to generate proposal ===
app.post("/generate-proposal", async (req, res) => {
  const { id, title, description, name } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: "Missing title or description." });
  }

  console.log(`🟢 Generating proposal for: ${title}`);

  const proposalText = await generateProposal(title, description, name);

  res.json({
    id: id || null,
    title,
    description,
    proposal: proposalText,
  });
});


app.post('/save-bid-history', saveBidHistoryController);
app.get('/bids', getSavedBidController)
app.get("/kpis/score-saved-bids", applyKpisToSavedBids);



// === Start the server ===
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Freelancer Proposal API running on port ${PORT}`)
);
