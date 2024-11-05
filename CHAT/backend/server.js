const { WebSocketServer } = require("ws")
const dotenv = require("dotenv")
const mongoose = require("mongoose")

dotenv.config()

// Conectar ao MongoDB
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/chatdb", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("Conectado ao MongoDB"))
  .catch((err) => console.error("Erro ao conectar ao MongoDB:", err))

// Definir o modelo de mensagem
const messageSchema = new mongoose.Schema({
  content: String,
  timestamp: { type: Date, default: Date.now }
})

const Message = mongoose.model("Message", messageSchema)

// Iniciar o servidor WebSocket
const wss = new WebSocketServer({ port: process.env.PORT || 8080 })

wss.on("connection", (ws) => {
    ws.on("error", console.error)

    // Quando o cliente se conecta, envie as mensagens antigas
    Message.find().sort({ timestamp: 1 }).then((messages) => {
        messages.forEach((message) => ws.send(message.content))
    }).catch((err) => console.error("Erro ao carregar mensagens antigas:", err))

    // Quando uma mensagem é recebida, salvar e enviar para todos os clientes
    ws.on("message", (data) => {
        const messageContent = data.toString()

        // Salvar a mensagem no banco de dados
        const newMessage = new Message({ content: messageContent })
        newMessage.save()
            .then(() => console.log("Mensagem salva no banco de dados"))
            .catch((err) => console.error("Erro ao salvar mensagem:", err))

        // Enviar a mensagem para todos os clientes conectados
        wss.clients.forEach((client) => {
            if (client.readyState === ws.OPEN) {
                client.send(messageContent)
            }
        })
    })

    console.log("Cliente conectado")
})
