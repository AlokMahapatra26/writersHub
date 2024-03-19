import { Hono } from "hono";

import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { User } from '@prisma/client/edge';
import { sign } from 'hono/jwt'

export const userRouter = new Hono<{
    Bindings:{
        DATABASE_URL : string,
        JWT_SECRET : string
    }
}>();


//SIGNUP ROUTE
userRouter.post('/signup', async (c) => {
    const body = await c.req.json();
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())
  
    //Zod and hashing password
  
    try{
      const user = await prisma.user.create({
        data : {
          name : body.username,
          email : body.email,
          password : body.password
        }
      })
      const jwt = await sign({
        id : user.id
      } , c.env.JWT_SECRET)
  
      return c.text(jwt)
  
    }catch(e){
      c.status(411);
      return c.text("something went wrong")
    }
  
      
  })
  
  
  // SIGNIN ROUTE
  userRouter.post('/api/v1/user/signin', async (c) => {
    const body = await c.req.json();
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())
  
    //Zod and hashing password
  
    try{
      const user = await prisma.user.findFirst({
        where : {
          email : body.email,
          password : body.password
        }
      })
  
      if(!user){
        c.status(403); //unauthorized
        return c.text("User not exist")
      }
      const jwt = await sign({
        id : user.id
      } , c.env.JWT_SECRET)
  
      return c.json({
        "message" : "signin successfully" ,
        "jwt" : jwt,
      })
      
  
    }catch(e){
      c.status(411);
      return c.text("something went wrong")
    }
  
  })
  