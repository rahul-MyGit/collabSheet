import { useEffect, useRef, useState } from 'react';

export const useWebSocket = (documentId: string) => {
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [readyState, setReadyState] = useState<number>(WebSocket.CONNECTING);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8080`);
    wsRef.current = ws;

    ws.onopen = () => {
      setReadyState(WebSocket.OPEN);
      ws.send(JSON.stringify({
        type: 'JOIN',
        documentId
      }));
    };

    ws.onmessage = (event) => {
      setLastMessage(event.data);
    };

    ws.onclose = () => {
      setReadyState(WebSocket.CLOSED);
    };

    return () => {
      ws.close();
    };
  }, [documentId]);

  const sendMessage = (message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        ...message,
        documentId
      }));
    }
  };

  return {
    lastMessage,
    readyState,
    sendMessage
  };
};