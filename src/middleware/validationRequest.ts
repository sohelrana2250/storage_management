
import { NextFunction, Request, Response } from "express";
import { AnyZodObject } from "zod";
import catchAsync from "../utility/catchAsync";



const validationRequest=(schema:AnyZodObject)=>{

    return catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
 
        //validation checking 
          await schema.parseAsync({
              body:req.body,
              cookies:req.cookies
          })
          next();
      });
}

export default validationRequest;