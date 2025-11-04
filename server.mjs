import express from "express";
import dotenv from "dotenv";
import { generateAIProposal } from "./src/openai/proposalGenerator.mjs";
import { getSavedBidController, saveBidHistoryController, toggleAutoBidController } from "./src/controller/bid-controller.mjs";
import cors from "cors";
import { createSubUser, getSubUsers, updateSubUserController } from "./src/controller/sub-user-controller.mjs";
import nodeCron from "node-cron";
import { scheduleAutoBidController } from "./src/controller/schedule-controller.mjs";
import { getAllNotificationsController, markNotificationReadController } from "./src/controller/notification-controller.mjs";
import { validateUser } from "./src/validator/auth-validator.mjs";

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


app.post('/save-bid-history', validateUser, saveBidHistoryController);
app.get('/bids', validateUser, getSavedBidController)
app.post('/sub-users', validateUser, createSubUser);
app.get('/sub-users', validateUser, getSubUsers);
app.patch('/sub-users', validateUser, updateSubUserController);
app.post('/toggle-auto-bid', validateUser, toggleAutoBidController);
app.get('/notifications', validateUser, getAllNotificationsController);
app.post('/notifications/mark-read', validateUser, markNotificationReadController);
app.post('/create-access-token',validateUser,)
// app.post('/login', loginController);


// Define the cron schedule (e.g., runs every minute: '*/1 * * * *')
// auto-bid
const schedule = '*/1 * * * *';
nodeCron.schedule(schedule, scheduleAutoBidController)



// === Start the server ===
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Freelancer Proposal API running on port ${PORT}`)
);
