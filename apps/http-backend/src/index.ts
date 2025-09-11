import express from "express";
import { prismaClient } from "@repo/db/client";
import { JWT_SECRET } from "@repo/backend-common/config";
import { createRoomSchema, CreateUserSchema, loginUserSchema } from "@repo/common/type";
import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { middleware } from "./middleware";

const app = express();
app.use(express.json());

app.post("/signup", async (req, res) => {
  const parsedData = CreateUserSchema.safeParse(req.body);
  if (!parsedData.success) {
    return res.status(400).json({
      message: "Invalid input"
    });
  }

  const hashedPassword = await bcrypt.hash(parsedData.data.password, 10);

  try {
    const user = await prismaClient.user.create({
      data: {
        email: parsedData.data.username,
        password: hashedPassword,
        name: parsedData.data.name
      }
    });

    res.json({
      userId: user.id
    });

  } catch (error) {
    res.status(411).json({
      message: "User already exists with this email"
    });
  }
});

app.post("/signin", async (req, res) => {
  const parsedData = loginUserSchema.safeParse(req.body);
  if (!parsedData.success) {
    return res.status(400).json({
      message: "Fill all fields"
    });
  }

  try {
    const user = await prismaClient.user.findUnique({
      where: { email: parsedData.data.username }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(parsedData.data.password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const token = jwt.sign({
       userId: user?.id
      },JWT_SECRET,{
         expiresIn: "7d" 
        }
    );

    res.json({ token });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/room" ,middleware,async (req,res) =>{
  const parsedData= createRoomSchema.safeParse(req.body);
  if(!parsedData.success) {
    res.json({
      message:'Incorrect Input'
    })
    return
  }
 // @ts-ignore
  const userId= req.userId;

try {
  const room = await prismaClient.room.create({
  data:{
    slug:parsedData.data.name,
    adminId: userId
  }
})
res.json({
  roomId: room.id
})
} catch (error) {
  res.json({
    message:"Room already create with this name"
  })
}

})

app.get ("/chats/:roomId",async (req,res) => {
  const roomId = Number(req.params.roomId)
  const message =await prismaClient.chat.findMany({
    where:{
       roomId
    },
    orderBy:{
      id:"desc"
    },
    take:50
  })
  res.json({
    message
  })
})

app.listen(3001, () => {
  console.log(`✅ Server running at http://localhost:3001`);
});
