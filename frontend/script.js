const input = document.querySelector('#input');
const chatContainer = document.querySelector('#chat-container');
const askBtn = document.querySelector('#ask');

const messages = [];

askBtn.addEventListener('click', handleAsk);
input.addEventListener('keydown', handleEnter);

function handleAsk() {

    const text = input.value.trim();

    if (!text) return;

    generate(text);
}

function handleEnter(e) {

    if (e.key === 'Enter' && !e.shiftKey) {

        e.preventDefault();

        const text = input.value.trim();

        if (!text) return;

        generate(text);
    }
}

async function generate(text) {

    const userMessage = document.createElement('div');

    userMessage.className =
        'my-4 bg-neutral-800 p-3 rounded-xl ml-auto max-w-[75%] w-fit';

    userMessage.textContent = text;

    chatContainer.appendChild(userMessage);

    userMessage.scrollIntoView({
        behavior: 'smooth'
    });

    messages.push({
        role: 'user',
        content: text
    });

    input.value = '';

    try {

        askBtn.disabled = true;

        const loading = document.createElement('div');

        loading.className =
            'my-4 bg-neutral-700 p-3 rounded-xl mr-auto max-w-[75%] w-fit';

        loading.innerHTML = `
            <div class="flex gap-1">
                <span class="animate-bounce">.</span>
                <span class="animate-bounce">.</span>
                <span class="animate-bounce">.</span>
            </div>
        `;

        chatContainer.appendChild(loading);

        const assistantResponse = await callServer();

        loading.remove();

        const assistantText = assistantResponse.message;

        messages.push({
            role: 'assistant',
            content: assistantText
        });

        const assistantDiv = document.createElement('div');

        assistantDiv.className =
            'my-4 bg-neutral-700 p-3 rounded-xl mr-auto max-w-[75%] w-fit';

        assistantDiv.textContent = assistantText;

        chatContainer.appendChild(assistantDiv);

        assistantDiv.scrollIntoView({
            behavior: 'smooth'
        });

    } catch (error) {

        console.error(error);

        const errorDiv = document.createElement('div');

        errorDiv.className =
            'my-4 bg-red-600 p-3 rounded-xl mr-auto max-w-[75%] w-fit';

        errorDiv.textContent = 'Something went wrong';

        chatContainer.appendChild(errorDiv);

    } finally {

        askBtn.disabled = false;
        input.focus();

    }
}

async function callServer() {

    const recentMessages = messages.slice(-20);

    const response = await fetch('/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            messages: recentMessages
        })
    });

    if (!response.ok) {
        throw new Error('Server Error');
    }

    return await response.json();
}