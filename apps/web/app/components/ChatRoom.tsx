import axios from "axios"
import { ChatRoomClient } from "./ChatRoomClient"
import { BACKEND_URL } from "../config"
import { log } from "console"

async function getChats (roomId: string) {
    const response = await axios.get(`${BACKEND_URL}/chats/${roomId}`)
    log(response.data.messages)
    return response.data.messages
}



export default async function ChatRoom ({id}: {
    id: string 
}) {
    const messages = await getChats(id)
    return <ChatRoomClient id={id} messages={messages}/>
}