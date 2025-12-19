export const calculateBidAmount = (project, budgetConfig = {}) => {
    const DEFAULT_MIN_HOURLY = 8;   // fallback if user not set
    const DEFAULT_MIN_FIXED = 30;   // fallback if user not set

    const { type, budget } = project;

    if (!budget || budget.minimum == null || budget.maximum == null) {
        console.log(`Project ${project.id} has an invalid budget: ${budget.minimum +" "+ String(budget?.maximum)}`);
        return null;
    }

    const minBudget = Number(budget.minimum);
    const maxBudget = Number(budget.maximum);

       // read user-configured thresholds (support multiple key names)
    const minHourlyThreshold = Number(
        budgetConfig.min_hourly_budget ??
        budgetConfig.min_hourly ??
        budgetConfig.minHourly ??
        DEFAULT_MIN_HOURLY
    );

    const minFixedThreshold = Number(
        budgetConfig.min_fixed_budget ??
        budgetConfig.min_fixed ??
        budgetConfig.minFixed ??
        DEFAULT_MIN_FIXED
    );

    console.log(`Calculating bid amount for project ${project.id}:`, { type, minBudget, maxBudget, minHourlyThreshold, minFixedThreshold });

    if (type === 'hourly') {
        // Hourly Projects
        if (minBudget > minHourlyThreshold) {
            console.log(`Project ${project.id} is hourly with rate > ${minHourlyThreshold}/hour. Bidding minimum: ${minBudget}`);
            return minBudget;
        } else {
            console.log(`Project ${project.id} is hourly with rate ≤ ${minHourlyThreshold}/hour. Bidding maximum: ${maxBudget}`);
            return maxBudget;
        }
    } else if (type === 'fixed') {
        // Fixed-Price Projects
        if (minBudget >= minFixedThreshold) {
            console.log(`Project ${project.id} is fixed-price with minimum >= ${minFixedThreshold}. Bidding minimum: ${minBudget}`);
            return minBudget;
        }
        console.log(`Project ${project.id} fixed minimum ${minBudget} < threshold ${minFixedThreshold}. Skipping.`);
        return null;
    }

    console.log(`Project ${project.id} has unknown type "${type}". Skipping.`);
    return null;
};

    // if (type === 'hourly') {
    //     // Hourly Projects
    //     if (minBudget > 10) {
    //         console.log(`Project ${project.id} is hourly with rate > $10/hour. Bidding minimum: ${minBudget}`);
    //         return minBudget; // Bid the minimum amount for rates > $10/hour
    //     } else {
    //         console.log(`Project ${project.id} is hourly with rate ≤ $10/hour. Bidding maximum: ${maxBudget}`);
    //         return maxBudget; // Bid the maximum amount for rates ≤ $10/hour
    //     }
    // }
    // else if (type === 'fixed') {

    //     if (minBudget >= 30) {
    //         return minBudget;
    //     }





    //     // Fixed-Price Projects
        // if (minBudget >= 30 && maxBudget >= 200) {
        //     console.log(`Project ${project.id} is fixed-price with budget between $30 and $250. Bidding minimum: ${minBudget}`);
        //     return minBudget; // Bid the minimum amount for budgets between $30 to >200
        // } else if (minBudget >= 250 && maxBudget <= 900) {
        //     console.log(`Project ${project.id} is fixed-price with budget between $250 and $900. Bidding minimum: ${minBudget}`);
        //     return minBudget; // Bid the minimum amount for budgets between $250 and $900
        // } else if (maxBudget > 1000) {
        //     console.log(`Project ${project.id} is fixed-price with budget > $1,000. Bidding minimum: ${minBudget}`);
        //     return minBudget; // Bid the minimum amount for budgets > $1,000
        // } else {
        //     console.log(`Project ${project.id} is fixed-price with budget < $200. Skipping.`);
        //     return null; // Skip projects with budgets < $200
        // }
    //     return null;
    // }

