// controller/kpi-controller.mjs
import { getSavedBidsService } from "../services/bid-service.mjs";
import { scoreJobsArray } from "../services/freelancer-kpi-service.mjs";

export const applyKpisToSavedBids = async (req, res) => {
  try {
    // Fetch bids directly from DB
    const fetchResult = await getSavedBidsService(req.query);

    if (!fetchResult || fetchResult.status !== 200) {
      return res.status(500).json({
        status: 500,
        message: fetchResult?.message || "Failed to fetch saved bids.",
      });
    }

    const jobs = fetchResult.data;

    if (!Array.isArray(jobs)) {
      return res.status(400).json({
        status: 400,
        message: "Expected an array of jobs from the database.",
      });
    }

    // Apply KPI Scoring
    const scoredJobs = scoreJobsArray(jobs);

    return res.status(200).json({
      status: 200,
      message: "KPI scoring successful",
      count: scoredJobs.length,
      data: scoredJobs,
    });
  } catch (error) {
    console.error("❌ KPI Scoring Error:", error);
    return res.status(500).json({ status: 500, message: error.message });
  }
};
