import express from 'express';
import { Temple } from './TempleModel.js';
import mongoose from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import  cors  from 'cors';
import { ERROR_MESSAGE, INSERT_SUCCESS, INVALID_PASSWORD, LOIN_SUCCESS, UPDATE_SUCCESS } from './constants.js';
import { Admin } from './AdminModel.js';
import  jwt  from 'jsonwebtoken';
import bcrypt from 'bcrypt';


function verifyToken(req,response,next){
   const header =req?.get('Authorization')
    if(header){
        const token = header.split(" ")[1];
        jwt.verify(token , "secret1234",(error,payload)=>{
            if (error) {
                response.status(StatusCodes.UNAUTHORIZED).send({message: "Invalid "})
            } else {
                next();
            }
        });
    }else{
        response.status(StatusCodes.UNAUTHORIZED).send({message:"please Login first"})
    }
}

const app = express();
app.use(cors()) ;
app.use(express.json());

const connectDb = async()=>{
    try{
        await mongoose.connect('mongodb://127.0.0.1:27017/TempleDb')
        console.log("DataBase connection created ");
    } catch (error){
        console.log(error);
    }
}

app.post("/admin",async(request , response)=>{
    try{
        const reqData = request.body;
        reqData['password'] = bcrypt.hashSync(reqData.password, 10);
        const admin = new Admin(reqData);
        await admin.save();
        response.status(StatusCodes.CREATED).send({message: INSERT_SUCCESS })
    }catch(error){
        response.send({message : ERROR_MESSAGE})
    }
});

app.post("/admin/login" ,async(request , response)=>{
    try{
      const admin = await Admin.findOne({email: request.body.email});
        if (admin) {
                if (bcrypt.compareSync(request.body.password , admin.password)) {
                   const token = jwt.sign({adminEmail : admin.email},"secret1234");             
                   response.status(StatusCodes.OK).send({message : LOIN_SUCCESS , token});
                }else{
                    response.status(StatusCodes.BAD_REQUEST).send({message : INVALID_PASSWORD});
                }
        }else{
        response.status(StatusCodes.BAD_REQUEST).send({message: INVALID_PASSWORD})
    }
}catch(error){
        response.status(StatusCodes.BAD_GATEWAY).send({message : INVALID_PASSWORD})
    }
});

app.post("/temple" , verifyToken ,async(request , response)=>{
    try{
        const reqData = request.body;
        const temple = new Temple(reqData);
        await temple.save();
        response.send({message: INSERT_SUCCESS })

    }catch(error){
        response.send({message : ERROR_MESSAGE})
    }
});

app.get("/temple/:temple_name", verifyToken , async(request , response)=>{
    try {
        const temple = await Temple.findOne({temple_name:request.params.temple_name});
        if(temple == null){
         response.status(StatusCodes.NOT_FOUND).send({message:"temple not found"});
        }else{
            response.send({temple:temple});
        }
    } catch (error) {
        response.send({message: ERROR_MESSAGE});    
    }
})

app.delete("/temple/:temple_name",verifyToken ,async(request , response)=>{
    try {
         await Temple.deleteOne({temple_name:request.params.temple_name});
            response.status(StatusCodes.GONE).send({message:"temple removed from list"});
    } catch (error) {
        response.status(StatusCodes.INTERNAL_SERVER_ERROR).send({message: ERROR_MESSAGE});      
    }
});

app.put("/temple/:temple_name",async (request, response) => {
    try {  
       await Temple.updateOne({temple_name:request.params.temple_name},request.body,(error, result) => {
            if (error) {    
                response.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: ERROR_MESSAGE });
            } else {   
                response.send({ message: UPDATE_SUCCESS });
            }
        });
    } catch (error) {  
        response.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: ERROR_MESSAGE });
    }
});


app.get("/temple", async (request , response)=>{
    try {
        const temples = await Temple.find();
        response.send({temples : temples});
        console.log("inserted");
    } catch (error) {
        response.send({message:"something went wrong"})
    }
})

app.listen(5454 ,()=>{
    console.log("server has started on 5454");
    connectDb();
})