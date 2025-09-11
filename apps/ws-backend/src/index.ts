import WebSocket ,{ WebSocketServer } from "ws";
import jwt from "jsonwebtoken"
import {JWT_SECRET } from "@repo/backend-common/config"
import {prismaClient} from "@repo/db/client"

// Port 8080 par WebSocket server start karte hain
const wss = new WebSocketServer({ port: 8080 });

interface User {
  ws: WebSocket,
  rooms : string[],
  userId: string
}
const users : User[] = []



function checkUser (token:string): string | null {
try {
   const decoded = jwt.verify(token,JWT_SECRET);

 if(typeof decoded =="string") {
  return null
 }

 if (!decoded || !decoded.userId) {
  return null
 }
 return decoded.userId;


} catch (e) {
 return null 
}
}


wss.on("connection",function connection (ws,request){
  const url = request.url
  if(!url){
    return
  }
  const queryParams = new URLSearchParams(url.split("?")[1]);
  const token = queryParams.get('token') || ""
  const userId = checkUser(token)

  if(!userId){
    ws.close()
    return
  }
  
users.push({
  userId,
  rooms: [],
  ws
})

  ws.on("message",async function message (data){ // This data is string convert in json 
    const parsedData = JSON.parse(data as unknown as string)
    if ( parsedData.type ==="join_room") {
      const user = users.find(x => x.ws === ws);    // process of joining room 
      user?.rooms.push(parsedData.roomId)
    }
     
    if ( parsedData.type ==="leave_room") {
      const user = users.find(x => x.ws === ws);
      if(!user){
        return;
      }
      user.rooms = user?.rooms.filter(x =>x ===parsedData.room) // process of leaving room
    }
    
    if(parsedData.type ==="chat"){
      const roomId = parsedData.roomId
      const message = parsedData.message

    await prismaClient.chat.create({
      data:{
        roomId,            // this is not the optimal way use quoe 
        message,
        userId
      }
    })


     users.forEach(user => {
      if (user.rooms.includes(roomId)) {
        user.ws.send(JSON.stringify({            // who have include room get the message     
          type:"chat", 
          message: message,
          roomId
        }))
      }
     })
    }


  })
})

