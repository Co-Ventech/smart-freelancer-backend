import express from "express";
import dotenv from "dotenv";
import { generateAIProposal } from "./src/openai/proposalGenerator.mjs";
import { getSavedBidController, saveBidHistoryController, toggleAutoBidController } from "./src/controller/bid-controller.mjs";
import { applyKpisToSavedBids } from "./src/controller/freelancer-kpi-controller.mjs";
import cors from "cors";
import { createSubUser, getSubUsers } from "./src/controller/sub-user-controller.mjs";
import nodeCron from "node-cron";
import { scheduleAutoBidController } from "./src/controller/schedule-controller.mjs";
import { getAllNotificationsController, markNotificationReadController } from "./src/controller/notification-controller.mjs";

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

  const result = await generateAIProposal(title, description, name);

  if (result.status === 200) {
    res.status(result?.status).json({
      id: id || null,
      title,
      description,
      proposal: result.data,
      message: result?.message
    });
  }
  res.status(result?.status).json({
    message: result?.message
  });
});


app.post('/save-bid-history', saveBidHistoryController);
app.get('/bids', getSavedBidController)
app.post('/sub-users', createSubUser);
app.get('/sub-users', getSubUsers);
app.post('/toggle-auto-bid', toggleAutoBidController);
app.get('/notifications', getAllNotificationsController);
app.post('/notifications/mark-read', markNotificationReadController)


// Define the cron schedule (e.g., runs every minute: '*/1 * * * *')
// auto-bid
const schedule = '*/1 * * * *';
nodeCron.schedule(schedule, scheduleAutoBidController)



// === Start the server ===
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Freelancer Proposal API running on port ${PORT}`)
);
