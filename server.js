const WebSocket = require('ws');
const express = require('express');
const http = require('http');
const cors = require('cors'); // Optional

// สร้าง Express server
const app = express();
app.use(cors()); // Optional: ถ้าคุณใช้ API หรือหน้าเว็บร่วมกับ WebSocket

const server = http.createServer(app);

// สร้าง WebSocket server และเชื่อมกับ HTTP server
const wss = new WebSocket.Server({ server });

let userSocket = null;
let adminSocket = null;

wss.on('connection', (ws, req) => {
    console.log('New client connected.');

    ws.on('message', (message) => {
        try {
            const parsedMessage = JSON.parse(message);
            if (parsedMessage.role === 'user') {
                userSocket = ws;
                console.log('User connected.');
            } else if (parsedMessage.role === 'admin') {
                adminSocket = ws;
                console.log('Admin connected.');
            }
        } catch (error) {
            console.log('Received non-JSON message:', message);
        }

        // ส่งข้อมูลจาก User ไปยัง Admin
        if (userSocket && adminSocket && ws === userSocket) {
            adminSocket.send(message);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected.');
        if (ws === userSocket) {
            userSocket = null;
            console.log('User disconnected.');
        } else if (ws === adminSocket) {
            adminSocket = null;
            console.log('Admin disconnected.');
        }
    });
});

// กำหนดให้เซิร์ฟเวอร์ HTTP รันที่พอร์ต 8080
server.listen(8080, () => {
    console.log('Server is listening on port 8080');
});
