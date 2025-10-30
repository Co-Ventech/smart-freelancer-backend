export const calculateBidAmount = (project) => {
    const { type, budget } = project;

    if (!budget || !budget.minimum || !budget.maximum) {
        console.log(`Project ${project.id} has an invalid budget.`);
        return null;
    }

    const minBudget = budget.minimum;
    const maxBudget = budget.maximum;

    console.log(`Calculating bid amount for project ${project.id}:`, { type, minBudget, maxBudget });

    if (type === 'hourly') {
        // Hourly Projects
        if (minBudget > 10) {
            console.log(`Project ${project.id} is hourly with rate > $10/hour. Bidding minimum: ${minBudget}`);
            return minBudget; // Bid the minimum amount for rates > $10/hour
        } else {
            console.log(`Project ${project.id} is hourly with rate ≤ $10/hour. Bidding maximum: ${maxBudget}`);
            return maxBudget; // Bid the maximum amount for rates ≤ $10/hour
        }
    }
    else if (type === 'fixed') {

        if (minBudget >= 30) {
            return minBudget;
        }
        // Fixed-Price Projects
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
        return null;
    }

};