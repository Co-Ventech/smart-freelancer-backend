// freelancer/freelancer_kpi_scorer.mjs
// --- No file I/O, pure scoring logic ---

// Helper: Safe Extract
const safeGet = (obj, path, fallback = null) => {
  try {
    return path.split(".").reduce((acc, key) => acc[key], obj) ?? fallback;
  } catch {
    return fallback;
  }
};

// === KPI Scoring Functions ===

// 1️⃣ Bid Count KPI (Tier-based)
const scoreBidCount = (bidCount = 0) => {
  if (bidCount < 5) return 1.0;
  if (bidCount < 10) return 0.9;
  if (bidCount < 15) return 0.8;
  if (bidCount < 20) return 0.7;
  if (bidCount < 25) return 0.6;
  if (bidCount < 30) return 0.5;
  if (bidCount < 35) return 0.4;
  if (bidCount < 40) return 0.3;
  if (bidCount < 45) return 0.2;
  if (bidCount < 50) return 0.1;
  return 0.0; // Above 50 bids
};


// 2️⃣ Budget Range KPI (Separate for Hourly vs Fixed)
const scoreBudgetRange = (budget = {}, type = "fixed") => {
  const min = budget.minimum || 0;
  const max = budget.maximum || 0;
  if (min === 0 && max === 0) return 0.1;

  const avg = (min + max) / 2;
  let score = 0.1; // default floor

  if (type === "hourly") {
    if (avg >= 100) score = 1.0;
    else if (avg >= 75) score = 0.9;
    else if (avg >= 50) score = 0.8;
    else if (avg >= 30) score = 0.7;
    else if (avg >= 20) score = 0.6;
    else if (avg >= 10) score = 0.5;
    else if (avg >= 5) score = 0.4;
    else score = 0.3;
  } else { // fixed project
    if (avg >= 5000) score = 1.0;
    else if (avg >= 3000) score = 0.9;
    else if (avg >= 2000) score = 0.8;
    else if (avg >= 1000) score = 0.7;
    else if (avg >= 500) score = 0.6;
    else if (avg >= 250) score = 0.5;
    else if (avg >= 100) score = 0.4;
    else if (avg >= 50) score = 0.3;
    else score = 0.2;
  }

  // Apply small penalty if range is too wide
  if (max - min > 1000) score *= 0.9;

  return parseFloat(score.toFixed(1));
};
            
const scoreDescriptionQuality = (description) => {
  if (!description) return 0.2;

  const lengthScore = Math.min(1.0, description.length / 1000);
  const keywordMatches =
    (description.match(
      /\b(react|python|ai|testing|api|frontend|backend|qa|ml|automation)\b/gi
    ) || []).length;
  const keywordScore = Math.min(1.0, keywordMatches / 10);
  const structureScore = /[.!?]/.test(description) ? 1.0 : 0.5;

  return 0.4 * lengthScore + 0.3 * keywordScore + 0.3 * structureScore;
};

const scoreProjectType = (type) => (type === "hourly" ? 1.0 : 0.7);

const scoreKYC = (buyer, seller) => {
  if (buyer && seller) return 1.0;
  if (buyer || seller) return 0.8;
  return 0.6;
};

const scoreUrgency = (urgent) => (urgent ? 1.0 : 0.7);
const scoreFeatured = (featured) => (featured ? 1.0 : 0.7);
const scoreEnterprise = (enterprise) => (enterprise ? 1.0 : 0.7);

const scorePaymentVerified = (isVerified) => (isVerified ? 1.0 : 0.0);

const scoreEmployerReputation = (rating) => {
  if (rating == null) return 0.3;
  if (rating >= 4.5) return 1.0;
  if (rating >= 4.0 && rating < 4.5) return 0.7;
  return 0.5;
};

// === Main Scoring Function ===
export const scoreJob = (job) => {
  const bidCount = safeGet(job, "bid_stats.bid_count", 0);
  const budget = safeGet(job, "budget", {});
  const description = safeGet(job, "description", "");
  const type = safeGet(job, "type", "fixed");
  const buyerKYC = safeGet(job, "is_buyer_kyc_required", false);
  const sellerKYC = safeGet(job, "is_seller_kyc_required", false);
  const urgent = safeGet(job, "upgrades.urgent", false);
  const featured = safeGet(job, "upgrades.featured", false);
  const enterprise = safeGet(job, "upgrades.enterprise", false);
  const paymentVerified = safeGet(job, "user.status.payment_verified", false);
  const employerRating = safeGet(job, "user.employer_reputation.entire_history.overall", null);


  const scores = {
    bid_count_kpi: scoreBidCount(bidCount),
    budget_range_kpi: scoreBudgetRange(budget),
    description_quality_kpi: scoreDescriptionQuality(description),
    project_type_kpi: scoreProjectType(type),
    client_seller_kyc_kpi: scoreKYC(buyerKYC, sellerKYC),
    project_urgency_kpi: scoreUrgency(urgent),
    featured_project_kpi: scoreFeatured(featured),
    enterprise_project_kpi: scoreEnterprise(enterprise),
    client_payment_verified_kpi: scorePaymentVerified(paymentVerified),
    employer_reputation_kpi: scoreEmployerReputation(employerRating),
  };

  const finalScore =
    Object.values(scores).reduce((a, b) => a + b, 0) /
    Object.values(scores).length;

  return {
    id: job.id,
    title: job.title,
    description: job.description,
    scores,
    final_average_score: parseFloat(finalScore.toFixed(2)),
  };
};
