import WebSocket, { WebSocketServer } from 'ws';
import { parse } from 'cookie';
import jwt from 'jsonwebtoken';
import { redis, initializeRedis } from './lib/redis';
import prisma from './db';


// documentId -> Set of WebSockets
const connectedClients: Map<string, Set<WebSocket>> = new Map();

async function startWebSocketServer() {
  await initializeRedis();

  const wss = new WebSocketServer({ port: 8080, 
    verifyClient: (info, callback) => {
      const origin = info.origin;
      const allowedOrigins = ['*'];
      if (allowedOrigins.includes(origin)) {
        callback(true);
      } else {
        callback(false, 401, 'Unauthorized');
      }
    }
  });

  wss.on('connection', async (ws, req) => {
    console.log("hehe");
    
    try {
      const cookies = parse(req.headers.cookie || '');
      const token = cookies['token'];

      if (!token) {
        ws.close(4001, 'Unauthorized');
        return;
      }

      const decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'secret123') as { userId: string };
      const userId = decodedToken.userId;

      ws.on('message', async (message: string) => {
        try {
          const { documentId, type, payload, row, column } = JSON.parse(message);

          if (!documentId || !type) {
            ws.send(JSON.stringify({ type: 'ERROR', message: 'Invalid message format' }));
            return;
          }

          if (type === 'JOIN') {
            const document = await prisma.document.findUnique({ where: { id: documentId } });
            if (!document) {
              ws.send(JSON.stringify({ type: 'ERROR', message: 'Document not found' }));
              return;
            }

            if (!connectedClients.has(documentId)) {
              connectedClients.set(documentId, new Set());
            }
            connectedClients.get(documentId)?.add(ws);
            ws.send(JSON.stringify({ type: 'JOIN_SUCCESS', message: 'Joined document successfully' }));
            return;
          }

          if (['EDIT', 'CURSOR_MOVE', 'COMMENT'].includes(type)) {
            const event = { documentId, userId, type, payload, row, column, createdAt: new Date().toISOString() };
            await redis.rPush('document_events', JSON.stringify(event));

            connectedClients.get(documentId)?.forEach((client) => {
              if (client !== ws) {
                client.send(JSON.stringify({ type, payload, row, column }));
              }
            });
          }

          if (type === 'SAVE') {
            const saveEvent = { documentId, content: payload.content, createdAt: new Date().toISOString() };
            await redis.rPush('document_save_events', JSON.stringify(saveEvent));
            ws.send(JSON.stringify({ type: 'SAVE_SUCCESS', message: 'Save request enqueued' }));
          }
        } catch (err) {
          console.error('Error handling message:', err);
          ws.send(JSON.stringify({ type: 'ERROR', message: 'Internal server error' }));
        }
      });

      ws.on('close', () => {
        console.log("ho gya");
        connectedClients.forEach((clients, docId) => {
          clients.delete(ws);
          if (clients.size === 0) connectedClients.delete(docId);
        });
      });
    } catch (err) {
      console.error('Connection error:', err);
      ws.close(4000, 'Internal server error');
    }
  });

  console.log('WebSocket server running on port 8080');
}

startWebSocketServer().catch((err) => console.error('WebSocket server initialization error:', err));
