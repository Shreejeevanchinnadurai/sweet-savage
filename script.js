const loginScreen = document.getElementById("login-screen");
const chatScreen = document.getElementById("chat-screen");

const providerSelect = document.getElementById("provider-select");
const apiKeyInput = document.getElementById("api-key-input");

const loginBtn = document.getElementById("login-btn");

const chatArea = document.getElementById("chat-area");

const chatInput = document.getElementById("chat-input");
const sendBtn = document.getElementById("send-btn");

const settingsBtn = document.getElementById("settings-btn");

const popup = document.getElementById("settings-popup");

const cancelSettings = document.getElementById("cancel-settings");
const confirmSettings = document.getElementById("confirm-settings");

const newChatBtn = document.getElementById("new-chat-btn");

let conversationHistory = [];

let isTyping = false;

/* INIT */

window.onload = () => {

    const savedKey = sessionStorage.getItem("api_key");

    if (savedKey) {

        showChat();

        addBotMessage(
            "Macha 😎 Sweet Savage online da!"
        );
    }
};

/* LOGIN */

loginBtn.addEventListener("click", () => {

    const apiKey = apiKeyInput.value.trim();

    const provider = providerSelect.value;

    if (!apiKey) {

        alert("Dei 😭 API key kudu da!");

        return;
    }

    sessionStorage.setItem("api_key", apiKey);

    sessionStorage.setItem("provider", provider);

    showChat();

    addBotMessage(
        "Sweet Savage ready da macha 🔥"
    );
});

/* SHOW CHAT */

function showChat() {

    loginScreen.classList.add("hidden");

    chatScreen.classList.remove("hidden");
}

/* SEND MESSAGE */

sendBtn.addEventListener("click", sendMessage);

chatInput.addEventListener("keypress", (e) => {

    if (e.key === "Enter") {

        sendMessage();
    }
});

async function sendMessage() {

    const text = chatInput.value.trim();

    if (!text || isTyping) return;

    addUserMessage(text);

    conversationHistory.push({
        role: "user",
        parts: [{ text }]
    });

    chatInput.value = "";

    const typingElement = showTyping();

    isTyping = true;

    try {

        const apiKey = sessionStorage.getItem("api_key");

        const provider = sessionStorage.getItem("provider");

        const systemPrompt =
            "You are Sweet Savage, a fun and energetic AI chatbot who talks like a best Tamil friend. Always respond in Tanglish.";

        let endpoint = "";

        let headers = {};

        let body = {};

        /* GEMINI */

        if (provider === "gemini") {

            endpoint =
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            headers = {
                "Content-Type": "application/json"
            };

            body = {
                system_instruction: {
                    parts: [{
                        text: systemPrompt
                    }]
                },
                contents: conversationHistory
            };
        }

        /* OPENAI */

        else if (provider === "openai") {

            endpoint =
                "https://api.openai.com/v1/chat/completions";

            headers = {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            };

            body = {
                model: "gpt-4o-mini",

                messages: [

                    {
                        role: "system",
                        content: systemPrompt
                    },

                    ...conversationHistory.map(msg => ({
                        role:
                            msg.role === "model"
                                ? "assistant"
                                : "user",

                        content:
                            msg.parts[0].text
                    }))
                ]
            };
        }

        /* CLAUDE */

        else if (provider === "claude") {

            endpoint =
                "https://api.anthropic.com/v1/messages";

            headers = {
                "Content-Type": "application/json",
                "x-api-key": apiKey,
                "anthropic-version": "2023-06-01"
            };

            body = {
                model: "claude-3-5-sonnet-20241022",

                max_tokens: 1024,

                system: systemPrompt,

                messages:
                    conversationHistory.map(msg => ({

                        role:
                            msg.role === "model"
                                ? "assistant"
                                : "user",

                        content:
                            msg.parts[0].text
                    }))
            };
        }

        /* OPENROUTER */

        else if (provider === "openrouter") {

            endpoint =
                "https://openrouter.ai/api/v1/chat/completions";

            headers = {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            };

            body = {
                model: "openai/gpt-4o-mini",

                messages: [

                    {
                        role: "system",
                        content: systemPrompt
                    },

                    ...conversationHistory.map(msg => ({
                        role:
                            msg.role === "model"
                                ? "assistant"
                                : "user",

                        content:
                            msg.parts[0].text
                    }))
                ]
            };
        }

        /* GROQ */

        else if (provider === "groq") {

            endpoint =
                "https://api.groq.com/openai/v1/chat/completions";

            headers = {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            };

            body = {
                model: "llama-3.3-70b-versatile",

                messages: [

                    {
                        role: "system",
                        content: systemPrompt
                    },

                    ...conversationHistory.map(msg => ({
                        role:
                            msg.role === "model"
                                ? "assistant"
                                : "user",

                        content:
                            msg.parts[0].text
                    }))
                ]
            };
        }

        const response = await fetch(endpoint, {

            method: "POST",

            headers,

            body: JSON.stringify(body)
        });

        const data = await response.json();

        typingElement.remove();

        let reply = "";

        if (provider === "gemini") {

            reply =
                data.candidates[0].content.parts[0].text;
        }

        else if (
            provider === "openai" ||
            provider === "openrouter" ||
            provider === "groq"
        ) {

            reply =
                data.choices[0].message.content;
        }

        else if (provider === "claude") {

            reply =
                data.content[0].text;
        }

        addBotMessage(reply);

        conversationHistory.push({

            role: "model",

            parts: [{ text: reply }]
        });

    }

    catch (error) {

        typingElement.remove();

        addBotMessage(
            "Aiyo 😭 API issue da macha!"
        );

        console.error(error);
    }

    finally {

        isTyping = false;
    }
}

/* UI */

function addUserMessage(text) {

    const div = document.createElement("div");

    div.className = "message user";

    div.innerHTML = `
        <div class="message-wrapper">
            <div class="bubble">${text}</div>
        </div>
    `;

    chatArea.appendChild(div);

    scrollBottom();
}

function addBotMessage(text) {

    const div = document.createElement("div");

    div.className = "message bot";

    div.innerHTML = `
        <div class="message-wrapper">

            <div class="bot-label">
                SWEET SAVAGE
            </div>

            <div class="bubble">
                ${text}
            </div>

        </div>
    `;

    chatArea.appendChild(div);

    scrollBottom();
}

function showTyping() {

    const div = document.createElement("div");

    div.className = "message bot";

    div.innerHTML = `
        <div class="message-wrapper">

            <div class="bot-label">
                SWEET SAVAGE
            </div>

            <div class="bubble">

                <div class="typing">

                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>

                </div>

            </div>

        </div>
    `;

    chatArea.appendChild(div);

    scrollBottom();

    return div;
}

function scrollBottom() {

    chatArea.scrollTop =
        chatArea.scrollHeight;
}

/* SETTINGS */

settingsBtn.addEventListener("click", () => {

    popup.classList.remove("hidden");
});

cancelSettings.addEventListener("click", () => {

    popup.classList.add("hidden");
});

confirmSettings.addEventListener("click", () => {

    sessionStorage.clear();

    location.reload();
});

/* NEW CHAT */

newChatBtn.addEventListener("click", () => {

    conversationHistory = [];

    chatArea.innerHTML = "";

    addBotMessage(
        "Fresh start da thalaiva 😎"
    );
});