// login elements
const login =document.querySelector(".login")
const loginForm =login.querySelector(".login_form")
const loginInput =login.querySelector(".login_input")

// chat elements
const chat =document.querySelector(".chat")
const chatForm =chat.querySelector(".chat_form")
const chatInput =chat.querySelector(".chat_input")
const chatMessagens =chat.querySelector(".chat_messagens")

const colors = [
    "cadetBlue",
    "darkgoldenrod",
    "cornflowerblue",
    "darkkhaki",
    "hotpin",
    "gold"
]


const user = {id: "", name: "", color: ""}

let websocket

const creatMessageSelfElement = (content, time) => {
    const div = document.createElement("div");

    div.classList.add("message_self");
    div.innerHTML = `${content} <span class="message_time>${time}</span`

    return div
}

const creatMessageOtherElement = (content, sender, senderColor, time) => {
    const div = document.createElement("div");
    const span = document.createElement("span");
    const spantime = document.createElement("span");

    div.classList.add("message_other");

    div.classList.add("message_self");
    span.classList.add("message_sender");
    span.style.color = senderColor
    spantime.classList.add("message_time");


    div.appendChild(span);

    span.innerHTML = sender
    spantime.innerHTML = time;

    div.innerHTML += content
    div.appendChild(spantime);
    return div
}


const getRandomColor = () => {
    const randomIndex = Math.floor (Math.random() * colors.length)
    return colors[randomIndex]
}

const scrollScreen = () => {
    window.scrollTo({
    top: document.body.scrollHeight,
        behavior: "smooth"
    })
}

const processMessage = ({data}) => {
    const { userId, userName, userColor, content, time } = JSON.parse(data)
    
    const message = 
    userId == user.id 
    ? creatMessageSelfElement(content, time) 
    :creatMessageOtherElement(content, userName, userColor, time)
    

    chatMessagens.appendChild(message);
    scrollScreen();
}

const handleLogin = (event) => {
    event.preventDefault();

    user.id = crypto.randomUUID();
    user.name = loginInput.value
    user.color = getRandomColor();
    
    login.style.display = "none"
    chat.style.display = "flex"

    websocket = new WebSocket("ws://localhost:8080")
    websocket.onmessage = processMessage

}

const sendMessage = (event) => {
    event.preventDefault();

    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const time = `${hours}:${minutes}`;

    const message = {
        userId: user.id,
        userName: user.name,
        userColor: user.color,
        content: chatInput.value,
        time: time
        
    }

    websocket.send(JSON.stringify(message))

    chatInput.value = ""
}

loginForm.addEventListener("submit", handleLogin)
chatForm.addEventListener("submit", sendMessage)