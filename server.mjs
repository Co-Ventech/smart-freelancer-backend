import express from "express";
import dotenv from "dotenv";
import { generateAIProposal } from "./src/openai/proposalGenerator.mjs";
import { getSavedBidController, placeBidController, saveBidHistoryController, toggleAutoBidController } from "./src/controller/bid-controller.mjs";
import cors from "cors";
import { createSubUser, deleteSubuserController, getSubUsers, updateSubUserController } from "./src/controller/sub-user-controller.mjs";
import nodeCron from "node-cron";
import { scheduleAutoBidController } from "./src/controller/schedule-controller.mjs";
import { getAllNotificationsController, markNotificationReadController } from "./src/controller/notification-controller.mjs";
import { validateAdminUser, validateUser, verifyTokenFromFirebase } from "./src/middleware/auth-middleware.mjs";
import { createAccessTokenController } from "./src/controller/token-controller.mjs";
import { getAllUsersController } from "./src/controller/user-controller.mjs";
import { recommendProposalController } from "./src/controller/proposal-controller.mjs";

dotenv.config();

const app = express();
const router= express.Router();

app.use(express.json());
app.use(cors({
  origin: '*'
}));

// === POST route to generate proposal ===
router.post("/generate-proposal", async (req, res) => {
  const { id, title, description, name, client_public_name } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: "Missing title or description." });
  }

  console.log(`🟢 Generating proposal for: ${title}`);

  const result = await generateAIProposal(client_public_name, title, description, name);

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


router.post('/save-bid-history', validateUser, saveBidHistoryController);
router.get('/bids', validateUser, getSavedBidController);
router.post('/bid', validateUser, placeBidController);
router.post('/sub-users', validateUser, createSubUser);
router.get('/sub-users', validateUser, getSubUsers);
router.patch('/sub-users', validateUser, updateSubUserController);
router.delete('/sub-users', validateUser, deleteSubuserController)
router.get('/users', validateAdminUser, getAllUsersController);
router.post('/toggle-auto-bid', validateUser, toggleAutoBidController);
router.get('/notifications', validateUser, getAllNotificationsController);
router.post('/notifications/mark-read', validateUser, markNotificationReadController);
router.post('/access-token', verifyTokenFromFirebase, createAccessTokenController);
router.post('/recommend-proposal', validateUser, recommendProposalController)


app.use('/api',router)

// Define the cron schedule (e.g., runs every minute: '*/1 * * * *')
// auto-bid
const schedule = '*/30 * * * * *';
nodeCron.schedule(schedule, scheduleAutoBidController).start();

// === Start the server ===
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Freelancer Proposal API running on port ${PORT}`)
);
