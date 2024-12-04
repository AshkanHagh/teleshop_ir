import { useEffect, useRef } from "react"
import { useAuthContext } from "../context/AuthContext"
import { toast } from "sonner"

const useSocket = (
    messageCallback?: (message: MessageEvent) => void,
    errorCallback?: (error: Event) => void
) => {
    const { accessToken } = useAuthContext()
    const socketRef = useRef<WebSocket | null>()

    useEffect(() => {
        if (!accessToken) {
            toast.error('هیچ نشانه دسترسی ارائه نشده است')
            return
        }

        if (socketRef.current?.readyState === WebSocket.OPEN) return;

        const socket = new WebSocket('ws://localhost:6610')
        socket.onopen = () => {
            console.log('Socket is connected')
            const data = {
                accessToken
            }
            socket.send(JSON.stringify(data))
        }
        socket.onmessage = (message) => {
            console.log('updated')
            messageCallback?.(message)
        }
        socket.onerror = (error) => {
            errorCallback?.(error)
        }

        socketRef.current = socket
        return () => {
            if (socketRef.current?.readyState === WebSocket.OPEN) {
                socket.close(1000, 'Component unmounting')
            }
        }
    }, [accessToken, errorCallback, messageCallback])

    return socketRef.current
}

export default useSocket