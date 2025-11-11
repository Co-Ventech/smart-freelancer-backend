import { getAllUsers } from "../services/user-service.mjs"

export const getAllUsersController= async(req,res)=>{
    const result= await getAllUsers();
    res.status(result.status)
    .send({...result});
}