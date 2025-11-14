# WebSocket Testing Instructions

## Method 1: HTML Test Page (Easiest)

1. Open `test-websocket.html` in your browser
2. Click "Connect" button
3. Type a message and click "Send Message"
4. Watch the terminal for adapter logs

## Method 2: Browser Console

1. Open browser console (F12)
2. Add Socket.IO library first:
```html
<script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
```
Or paste this in console:
```javascript
const script = document.createElement('script');
script.src = 'https://cdn.socket.io/4.5.4/socket.io.min.js';
document.head.appendChild(script);
```

3. Wait a moment, then connect:
```javascript
const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('Connected:', socket.id);
  socket.emit('message', { message: 'Hello from browser!' });
});

socket.on('response', (data) => {
  console.log('Server response:', data);
});
```

## Method 3: Postman

1. Open Postman
2. Create new WebSocket request
3. URL: `ws://localhost:3000/socket.io/?EIO=4&transport=websocket`
4. Click "Connect"
5. Send message (Socket.IO format):
```json
42["message",{"message":"Hello from Postman!"}]
```

## Method 4: Command Line (using wscat)

```bash
npm install -g wscat
wscat -c ws://localhost:3000
```

Note: For Socket.IO, you need Socket.IO client, not plain WebSocket.

## Expected Terminal Logs

When client connects, you should see:
- `[DemoIoAdapter] bindClientConnect() invoked for IoAdapter`
- `[DemoIoAdapter] bindMessageHandlers() | handlers registered: X`
- `[DemoGateway] Client connected: <socket-id>`
- `[DemoGateway] Message received from <socket-id>: {...}`

