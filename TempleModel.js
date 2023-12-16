import mongoose , {Schema} from "mongoose";

const templeSchema = new Schema ({
    temple_name : String ,
    phone : Number ,
    city : String ,
    state : String ,
    pincode : Number ,
    add : String,
    desc : String
}) ;

export const Temple = mongoose.model("temple" , templeSchema);