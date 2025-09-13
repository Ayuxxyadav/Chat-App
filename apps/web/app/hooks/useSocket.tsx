import { useEffect,useState } from "react";
import { WS_URL } from "../config";
import { log } from "console";

export function useSocket () {
    const [loading,setLoading] = useState(true);
    const [ socket ,setSocket] = useState<WebSocket>();

    useEffect(()=>{
        const ws = new WebSocket(`${WS_URL}/?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI4MzUyOTA0Ni1kMDFlLTQ5ODAtYTI2Mi05YzJlM2JmMTAxMGYiLCJpYXQiOjE3NTc1Njg2MTIsImV4cCI6MTc1ODE3MzQxMn0.4jJ8xBQXPpzw8RRoZU9r3PqMrWWo377zFVPgQ_NeM0c`);
        ws.onopen = () => {
            setLoading(false);
            setSocket(ws)
        
        }
    },[])

    return {
        loading,
        socket
    }
}