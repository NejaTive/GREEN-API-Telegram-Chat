# GREEN-API Telegram Chat

React-чат для отправки и получения текстовых сообщений через GREEN-API (Telegram).

## API

- [SendMessage](https://green-api.com/telegram/docs/api/sending/SendMessage/)
- [HTTP API](https://green-api.com/telegram/docs/api/receiving/technology-http-api/) (`ReceiveNotification` + `DeleteNotification`)
- `CheckAccount` — имя и `chatId` при создании чата по номеру

## Запуск

```bash
npm install
npm run dev
```

В консоли GREEN-API: авторизованный Telegram-инстанс, пустой `webhookUrl`, включены входящие уведомления.

## Docker

```bash
docker compose up -d --build
```

Приложение: `http://<VPS_IP>:8089`

Остановить:
```bash
docker compose down
```
