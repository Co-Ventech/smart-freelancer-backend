// services/freelancer-kpi-service.mjs
import { scoreJob } from "../freelancer/freelancer_kpi_scorer.mjs";

export const scoreJobsArray = (jobsArray) => {
  if (!Array.isArray(jobsArray) || jobsArray.length === 0) {
    throw new Error("No jobs provided for KPI scoring.");
  }

  const scored = jobsArray.map(scoreJob);
  return scored;
};
