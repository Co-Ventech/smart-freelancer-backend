import db from "../../config/firebase-config.mjs"

const userCollection = db.collection('users')

export const getAllUsers= async()=>{
    const querySnapshot=await userCollection.get();
    if(querySnapshot?.empty){
        return {
            status: 404,
            message: "Users Not found"
        }
    }

    const data= [];
    querySnapshot?.forEach(doc=>{
        if(doc?.data()["role"]==="admin"){ 
            return;
        }
        data?.push({...doc.data()})
    });

    return {
        status: 200,
        message: "Users fetched successfully",
        data:{
            users: data
        }
    }
}