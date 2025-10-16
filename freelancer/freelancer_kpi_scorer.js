import fs from "fs";
import path from "path";

// === File Paths ===
const __dirname = path.resolve();
const inputPath = path.join(__dirname, "freelancer", "data", "freelancer_jobs_raw.json");
const outputPath = path.join(__dirname, "freelancer", "output", "freelancer_scored_jobs.json");

// === Helper: Safe Extract ===
const safeGet = (obj, path, fallback = null) => {
  try {
    return path.split('.').reduce((acc, key) => acc[key], obj) ?? fallback;
  } catch {
    return fallback;
  }
};

// === KPI Scoring Functions ===
const scoreBidCount = (bidCount) => Math.max(0.1, 1 - (bidCount || 0) / 100);

const scoreBudgetRange = (budget) => {
  const min = budget?.minimum || 0;
  const max = budget?.maximum || 0;
  if (min === 0 && max === 0) return 0.1;
  const avg = (min + max) / 2;
  let score = Math.min(1.0, avg / 1000);
  if (max - min > 1000) score *= 0.9;
  return score;
};

const scoreDescriptionQuality = (description) => {
  if (!description) return 0.2;

  const lengthScore = Math.min(1.0, description.length / 1000);
  const keywordMatches = (description.match(/\b(react|python|ai|testing|api|frontend|backend|qa|ml|automation)\b/gi) || []).length;
  const keywordScore = Math.min(1.0, keywordMatches / 10);
  const structureScore = /[.!?]/.test(description) ? 1.0 : 0.5;

  return (0.4 * lengthScore) + (0.3 * keywordScore) + (0.3 * structureScore);
};

const scoreProjectType = (type) => (type === "hourly" ? 1.0 : 0.7);

const scoreKYC = (buyer, seller) => {
  if (buyer && seller) return 1.0;
  if (buyer || seller) return 0.8;
  return 0.6;
};

const scoreUrgency = (urgent) => urgent ? 1.0 : 0.7;

const scoreFeatured = (featured) => featured ? 1.0 : 0.7;

const scoreEnterprise = (enterprise) => enterprise ? 1.0 : 0.7;

// === Main Scoring Function ===
const scoreJob = (job) => {
  const bidCount = safeGet(job, "bid_stats.bid_count", 0);
  const budget = safeGet(job, "budget", {});
  const description = safeGet(job, "description", "");
  const type = safeGet(job, "type", "fixed");
  const buyerKYC = safeGet(job, "is_buyer_kyc_required", false);
  const sellerKYC = safeGet(job, "is_seller_kyc_required", false);
  const urgent = safeGet(job, "upgrades.urgent", false);
  const featured = safeGet(job, "upgrades.featured", false);
  const enterprise = safeGet(job, "upgrades.enterprise", false);

  const scores = {
    bid_count_kpi: scoreBidCount(bidCount),
    budget_range_kpi: scoreBudgetRange(budget),
    description_quality_kpi: scoreDescriptionQuality(description),
    project_type_kpi: scoreProjectType(type),
    client_seller_kyc_kpi: scoreKYC(buyerKYC, sellerKYC),
    project_urgency_kpi: scoreUrgency(urgent),
    featured_project_kpi: scoreFeatured(featured),
    enterprise_project_kpi: scoreEnterprise(enterprise),
  };

  const finalScore = Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length;

  return {
    id: job.id,
    title: job.title,
    description: job.description,
    scores,
    final_average_score: parseFloat(finalScore.toFixed(2))
  };
};

// === Pipeline Execution ===
const runScoringPipeline = () => {
  if (!fs.existsSync(inputPath)) {
    console.error("❌ Input file not found:", inputPath);
    return;
  }

  const jobs = JSON.parse(fs.readFileSync(inputPath, "utf-8"));
  const scoredJobs = jobs.map(scoreJob);

  fs.writeFileSync(outputPath, JSON.stringify(scoredJobs, null, 2));
  console.log(`✅ Scoring completed for ${scoredJobs.length} jobs.`);
  console.log(`📁 Output saved at: ${outputPath}`);
};

// === Run Script ===
runScoringPipeline();
