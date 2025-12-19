import { calculateBidAmount } from "./calculate-bid-amount.mjs";
import { getOwnerCountry, isExcludedCountry } from "./get-owner-country.mjs";
import { isProjectNew } from "./project-time-threshold.mjs";

export const filterProjects = (resProjects, resUsers, excluded_countries,allowed_currencies = null, clientFilters = {}) => {
    const DEFAULT_MIN_EMPLOYER_RATING = 4; // default: 4 (4+)
    // Filter projects based on the conditions
    const projects = resProjects.filter((project) => {
        const { currency, budget, NDA, title } = project;
        const nowUnix = Math.floor(Date.now() / 1000);

        // owner country exclusion
        const ownerCountry = getOwnerCountry(project, resUsers);
        if (isExcludedCountry(ownerCountry,excluded_countries)) {
            console.log(`Hiding project ${project.id} from UI - owner country: ${ownerCountry}`);
            return false;
        }
        const ownerId = project.owner_id || project.owner?.id || project.user_id || null;
        // normalize owner data from resUsers
        const ownerKey = String(ownerId || '');
        const ownerData = resUsers[ownerKey] || {};

        // payment_verified (existing)
        const paymentVerified = ownerData?.status?.payment_verified || ownerData?.payment_verified || ownerData?.status?.paymentVerified || false;
            // const paymentVerified = ownerData?.status?.payment_verified || ownerData?.payment_verified || ownerData?.status?.paymentVerified || false;

        // const isPaymentVerified = resUsers[String(ownerId)]?.status?.payment_verified === true;
      
        // deposit_made detection: common variants
        const depositMadeFlag = ownerData?.deposit_made
            || ownerData?.has_deposit
            || ownerData?.account?.deposit_made
            || ownerData?.status?.deposit_made
            || false;

        // min_projects detection: number of completed/posted projects
        const ownerCompletedProjects =
            ownerData?.employer_reputation?.entire_history?.complete
            || ownerData?.employer_reputation?.entire_history?.jobs_posted
            || ownerData?.projects_posted
            || ownerData?.project_count
            || 0;

        // DYNAMIC: deposit_made requirement from clientFilters ("yes"/"no" or boolean)
        if (clientFilters?.deposit_made !== undefined && clientFilters?.deposit_made !== null && clientFilters?.deposit_made !== '') {
            const wantDeposit = String(clientFilters.deposit_made).toLowerCase();
            if (wantDeposit === 'yes' && !depositMadeFlag) {
                console.log(`Project ${project.id} skipped: owner ${ownerId} deposit not made`);
                return false;
            }
            if (wantDeposit === 'no' && depositMadeFlag) {
                console.log(`Project ${project.id} skipped: owner ${ownerId} deposit present but filter expects none`);
                return false;
            }
        }

        // DYNAMIC: min_projects requirement from clientFilters (numeric)
        if (clientFilters?.min_projects !== undefined && clientFilters?.min_projects !== null && clientFilters?.min_projects !== '') {
            const minProjects = Number(clientFilters.min_projects) || 0;
            if (Number(ownerCompletedProjects) < minProjects) {
                console.log(`Project ${project.id} skipped: owner ${ownerId} has ${ownerCompletedProjects} completed projects (< ${minProjects})`);
                return false;
            }
        }

          const clientRating = resUsers[String(ownerId)]?.employer_reputation?.entire_history?.overall;

        const minRatingFilter = clientFilters?.min_rating ? Number(clientFilters.min_rating) : DEFAULT_MIN_EMPLOYER_RATING;

    


         // DYNAMIC: payment_verified requirement
        if (clientFilters?.payment_verified) {
            const want = String(clientFilters.payment_verified).toLowerCase();
            // const paymentVerified = resUsers[String(ownerId)]?.status?.payment_verified || resUsers[String(ownerId)]?.payment_verified || resUsers[String(ownerId)]?.status?.paymentVerified || false;
            if (want === 'yes' && !paymentVerified) {
                console.log(`Project ${project.id} skipped: owner ${ownerId} payment not verified`);
                return false;
            }
            if (want === 'no' && paymentVerified) {
                console.log(`Project ${project.id} skipped: owner ${ownerId} payment verified but filter expects no`);
                return false;
            }
        }
        

        // if (typeof clientRating === 'number' //|| isPaymentVerified
        // ) {
        //     // optionally require integer rating (reject 4.5 etc) or accept decimals
        //     const passesRating = parseFloat(clientRating) >= MIN_EMPLOYER_RATING;

        //     if (passesRating) {
        //         console.log(`Auto-bid allowed for project ${project.id} (owner ${ownerId}) — rep ${clientRating}`);
        //         return true;
        //     } else {
        //         console.log(`Owner for project ${project.id} failed rating requirement: ${clientRating}`);
        //         return false;
        //     }
        // }

        // }
        if (clientRating !== undefined && clientRating !== null) {
            const passesRating = parseFloat(clientRating) >= minRatingFilter;
            if (!passesRating) {
                console.log(`Owner for project ${project.id} failed rating requirement: ${clientRating} < ${minRatingFilter}`);
                return false;
            }
            console.log(`Auto-bid allowed for project ${project.id} (owner ${ownerId}) — rep ${clientRating}`);
            return true;
        }


        //filter projects other than english language
        if (/^[^\u0000-\u007F]/.test(title)) {
            return false
        }

        // // Exclude projects with currency = "INR"
        // if ((currency?.code || '').toUpperCase() === 'INR') {
        //     return false;
        // }

         // allowed_currencies handling (from Firestore) 
        const allowedCurrencySet = (() => {
            if (!allowed_currencies) return null;
            if (Array.isArray(allowed_currencies)) return new Set(allowed_currencies.map(c => String(c).toUpperCase()));
            if (typeof allowed_currencies === 'object') {
                const vals = Object.values(allowed_currencies).filter(Boolean).map(v => String(v).toUpperCase());
                return vals.length ? new Set(vals) : null;
            }
            return new Set([String(allowed_currencies).toUpperCase()]);
        })();

        const projectCurrencyCode = (typeof currency === 'string')
            ? currency.toUpperCase()
            : (currency?.code || currency?.id || currency?.currency || '').toString().toUpperCase() || null;
        if (allowedCurrencySet && allowedCurrencySet.size > 0) {
            if (!projectCurrencyCode || !allowedCurrencySet.has(projectCurrencyCode)) {
                console.log(`Project ${project.id} currency ${projectCurrencyCode} not allowed. Skipping.`);
                return false;
            }
        } else {
            // fallback behaviour (existing): exclude INR
            if (projectCurrencyCode === 'INR') return false;
        }


        const bidCount = project.bid_stats?.bid_count || 0;
        console.log(bidCount);
        if (bidCount >= 50) {
            console.log(`Project ${project.id} has 50 or more bids. Skipping.`);
            return false;
        }

        // const isRecent = nowUnix - project.submitdate <= 60; // Projects less than 1 minute old
        const isRecent= isProjectNew(project.submitdate, nowUnix);
        if (isRecent===false) {
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

        if (calculateBidAmount(project) === null) {
            return false;
        }

        return true;
    });

    return projects;
}