const express = require('express');
const socketIO = require('socket.io');
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Статические файлы
app.use(express.static(path.join(__dirname, 'public')));

// Мок ML-ядра (заглушка)
function mockMLCore(input) {
  console.log("Получены требования:", input);
  return {
    elements: [
      { data: { id: 'client', label: 'Клиентское приложение', type: 'person' } },
      { data: { id: 'server', label: 'Сервер', type: 'server' } },
      { data: { id: 'edge1', source: 'client', target: 'server', label: 'Запросы' } }
    ],
    code: `C4Context {
      Person(client, "Клиентское приложение")
      System(server, "Сервер")
      
      Rel(client, server, "Отправляет запросы")
    }`
  };
}

// WebSocket обработчик
io.on('connection', (socket) => {
  console.log('Клиент подключен');

  socket.on('generate', (requirements) => {
    console.log("Генерация диаграммы для:", requirements);
    const result = mockMLCore(requirements);
    socket.emit('diagram', result);
  });

  socket.on('ai-edit', (data) => {
    console.log("ИИ-редактирование:", data);
    // Здесь будет интеграция с реальным ML-ядром
    const updated = {
      ...data,
      updated: true,
      timestamp: new Date().toISOString()
    };
    socket.emit('diagram-update', updated);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});