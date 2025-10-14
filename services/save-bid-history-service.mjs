import db from "../config/firebase-config.mjs"

export const saveBidService= (body)=>{

    try{
        db.collection('bids').doc('co-ventech')
        .set({
            ...body
        });
        return {
            status: 200,
            message: "Bid Saved Successfully"
        }
    }catch(e){
        console.log(e)
        return {
            status: 500,
            message: e.message
        }
    }
}