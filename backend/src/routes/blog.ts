import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { verify } from "hono/jwt";

export const blogRouter = new Hono<{
    Bindings : {
        DATABASE_URL :string,
        JWT_SECRET : string
    },
    Variables :{
        userId : string;
    }
}>();


//MIDDLEWARE
blogRouter.use("/*" , async (c , next) => {
    const authHeader = c.req.header("authorization") || ""
    const user = await verify(authHeader , c.env.JWT_SECRET);
    if(user){
       
        c.set("userId" , user.id);
        await next();
    }else{
        c.status(403);
        return c.json({
            message : "You are not logged in"
        })
    }
    next();
})


//BLOG POST ROUTE
blogRouter.post('/', async (c) => {
    const body = await c.req.json();
    const authorId = c.get("userId");
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())
  
  const blog = await prisma.post.create({
    data : {
        title : body.title,
        content : body.content,
        authorId : authorId
    }
  })

  return c.json({
    id : blog.id
  })

})


//BLOG UPDATE ROUTE
blogRouter.put('/', async(c) => {
    const body = await c.req.json();
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())
  
  const blog = await prisma.post.update({
    where : {
        id : body.id
    },data:{
        title : body.title,
        content : body.content,
    }
  })

  return c.json({
    id : blog.id
  })
})

//FEED ROUTE
blogRouter.get('/bulk' , async (c)=> {
    
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
}).$extends(withAccelerate())

const blog = await prisma.post.findMany()

return c.json({
  blogs : blog
})
})

//BLOG GET ROUTE
blogRouter.get('/:id' , async (c) => {
    const id =  c.req.param("id");
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())
  
  const blog = await prisma.post.findFirst({
    where:{
        id : id
    }
  })

  return c.json({
    id : blog
  })
})


