import { calculateBidAmount } from "./calculate-bid-amount.mjs";
import { getOwnerCountry, isExcludedCountry } from "./get-owner-country.mjs";

export const filterProjects = (resProjects, resUsers) => {
    // Filter projects based on the conditions
    const projects = resProjects.filter((project) => {
        const { currency, budget, NDA, title } = project;
        const nowUnix = Math.floor(Date.now() / 1000);

        // owner country exclusion
        const ownerCountry = getOwnerCountry(project, resUsers);
        if (isExcludedCountry(ownerCountry)) {
            console.log(`Hiding project ${project.id} from UI - owner country: ${ownerCountry}`);
            return false;
        }
        const ownerId = project.owner_id || project.owner?.id || project.user_id || null;        
        const isPaymentVerified= resUsers[String(ownerId)]?.status?.payment_verified === true

        if(!isPaymentVerified){
            console.log("Payment Method is not verified for owner id: ", ownerId)
            return false;
        }

        //filter projects other than english language
        if (/^[^\u0000-\u007F]/.test(title)) {
            return false
        }

        // Exclude projects with currency = "INR"
        if ((currency?.code || '').toUpperCase() === 'INR') {
            return false;
        }

        const bidCount = project.bid_stats?.bid_count || 0;
        if (bidCount >= 50) {
            console.log(`Project ${project.id} has 50 or more bids. Skipping.`);
            return false;
        }

        const isRecent = nowUnix - project.submitdate <= 60; // Projects less than 1 minute old
        if (!isRecent) {
            console.log(`Project ${project.id} is not recent. Skipping.`);
            return false;
        }

        // Exclude projects with hourly rate minimum <= 5
        if (budget?.minimum && Number(budget.minimum) <= 5) {
            return false;
        }

        // Exclude projects with NDA = true
        if (NDA === true || project.upgrades?.NDA === true) {
            console.log(`Project ${project.id} is an NDA project. Skipping.`);
            return false;
        }

        // Exclude projects with NDA, nonpublic, or sealed = true
        const upgrades = project.upgrades || {};
        if (
            NDA === true ||
            upgrades.NDA === true ||
            upgrades.nonpublic === true ||
            upgrades.sealed === true
        ) {
            console.log(`Project ${project.id} is excluded due to NDA/nonpublic/sealed. Skipping.`);
            return false;
        }

        if(calculateBidAmount(project)===null){
            return false;
        }

        return true;
    });

    return projects;
}