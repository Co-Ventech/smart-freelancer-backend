import db from "../config/firebase-config.mjs"
import { v4 } from 'uuid'
import { scoreJob } from "../freelancer/freelancer_kpi_scorer.mjs";

const bidCollection = db.collection('bids')

export const saveBidService = async (body) => {

    try {
        const scoredJobs = scoreJob(...body);
        const generatedUUID = v4();
        await bidCollection.doc(generatedUUID)
            .set({
                ...body,
                ...scoredJobs
            });

        const data = (await bidCollection.doc(generatedUUID).get()).data();
        return {
            status: 200,
            message: "Bid Saved Successfully",
            data: data
        }


    } catch (e) {
        console.log(e)
        return {
            status: 500,
            message: e.message
        }
    }
}

export const getSavedBidsService = async (query) => {

    try {
        let snapshot = bidCollection;
        if (query?.bid_id) {
            const data = (await snapshot.doc(query?.bid_id).get()).data();
            return {
                status: 200,
                message: "Bids fetched successfully",
                data: data
            }
        }
        if (query?.bid_type) {
            snapshot = snapshot.where('bid_type', '==', query?.bid_type); //eg: manual, auto
        }
        if (query?.bidder_id) {
            const bidderId = isNaN(query.bidder_id)
                ? query.bidder_id              // e.g. "MANUAL_BIDDER"
                : Number(query.bidder_id);     // e.g. 88454359 as number

            snapshot = snapshot.where('bidder_id', '==', bidderId); //bidded from zameer, zubair, co-ventech, ahsan's bidder id
        }

        const querySnapshot = await snapshot.get();
        const data = []
        querySnapshot.forEach((doc) => {
            console.log(doc.id, " => ", doc.data());
            data.push({ ...doc.data(), document_id: doc.id });
        });

        return {
            status: 200,
            message: "Bids fetched successfully",
            data: data
        }
    } catch (e) {
        console.log(e)
        return {
            status: 500,
            message: e.message
        }
    }
}