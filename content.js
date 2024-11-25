let chatContainer = null;
let selectedText = '';
let pendingMessages = new Map();

// Listen for responses from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'geminiResponse') {
        const resolve = pendingMessages.get(message.messageId);
        if (resolve) {
            pendingMessages.delete(message.messageId);
            if (message.error) {
                resolve({ error: message.error });
            } else {
                resolve(message.response);
            }
        }
    }
    return false;
});

// Create and inject chat UI
function createChatUI(x, y) {
    if (chatContainer) {
        document.body.removeChild(chatContainer);
    }

    chatContainer = document.createElement('div');
    chatContainer.className = 'gemini-chat-container';
    chatContainer.innerHTML = `
        <div class="gemini-chat-header">
            <span>Chat with Gemini</span>
            <button class="gemini-close-btn">×</button>
        </div>
        <div class="gemini-chat-messages"></div>
        <div class="gemini-chat-input">
            <input type="text" placeholder="Type your message...">
            <button class="gemini-send-btn">Send</button>
        </div>
    `;

    // Position the chat container
    chatContainer.style.left = `${x}px`;
    chatContainer.style.top = `${y}px`;
    
    document.body.appendChild(chatContainer);

    // Add event listeners
    const closeBtn = chatContainer.querySelector('.gemini-close-btn');
    const input = chatContainer.querySelector('input');
    const sendBtn = chatContainer.querySelector('.gemini-send-btn');

    closeBtn.addEventListener('click', () => {
        document.body.removeChild(chatContainer);
        chatContainer = null;
    });

    sendBtn.addEventListener('click', async () => {
        const message = input.value.trim();
        if (message) {
            // Disable input and button while processing
            input.disabled = true;
            sendBtn.disabled = true;
            
            addMessage('user', message);
            const thinkingId = addMessage('system', 'Thinking...');
            
            try {
                const response = await sendToGemini(message, selectedText);
                removeMessage(thinkingId);
                
                if (response.error) {
                    throw new Error(response.error);
                }
                if (response.reply) {
                    addMessage('gemini', response.reply);
                }
            } catch (error) {
                console.error('Error sending to Gemini:', error);
                removeMessage(thinkingId);
                addMessage('system', 'Error: ' + (error.message || 'Could not get response from Gemini'));
            } finally {
                // Re-enable input and button
                input.disabled = false;
                sendBtn.disabled = false;
                input.value = '';
                input.focus();
            }
        }
    });

    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey && !input.disabled) {
            sendBtn.click();
        }
    });

    // Add initial context message
    addMessage('system', `Context: "${selectedText}"`);
}

function addMessage(sender, text) {
    if (!chatContainer) return null;
    
    const messagesContainer = chatContainer.querySelector('.gemini-chat-messages');
    const messageDiv = document.createElement('div');
    const messageId = Date.now().toString();
    messageDiv.id = `message-${messageId}`;
    messageDiv.className = `${sender}-message`;
    messageDiv.textContent = text;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    return messageId;
}

function removeMessage(messageId) {
    if (!chatContainer || !messageId) return;
    
    const message = chatContainer.querySelector(`#message-${messageId}`);
    if (message) {
        message.remove();
    }
}

async function sendToGemini(message, context) {
    return new Promise((resolve, reject) => {
        const messageId = Date.now().toString();
        
        // Store the promise resolve function
        pendingMessages.set(messageId, resolve);
        
        // Send message to background script
        chrome.runtime.sendMessage({
            action: 'askGemini',
            messageId,
            message,
            context,
            url: window.location.href
        }).catch(error => {
            pendingMessages.delete(messageId);
            reject(error);
        });
        
        // Set a timeout to clean up if no response is received
        setTimeout(() => {
            if (pendingMessages.has(messageId)) {
                pendingMessages.delete(messageId);
                reject(new Error('Response timeout'));
            }
        }, 30000); // 30 second timeout
    });
}

// Create floating "Ask Gemini" button
function createAskButton(x, y) {
    const button = document.createElement('button');
    button.className = 'gemini-ask-button';
    button.textContent = 'Ask Gemini';
    button.style.left = `${x}px`;
    button.style.top = `${y}px`;

    button.addEventListener('click', (e) => {
        document.body.removeChild(button);
        createChatUI(x, y);
    });

    document.body.appendChild(button);
    
    // Remove button when clicking elsewhere
    setTimeout(() => {
        const clickHandler = (e) => {
            if (e.target !== button) {
                if (document.body.contains(button)) {
                    document.body.removeChild(button);
                }
                document.removeEventListener('click', clickHandler);
            }
        };
        document.addEventListener('click', clickHandler);
    }, 0);
}

// Handle text selection
document.addEventListener('mouseup', (e) => {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    
    if (text && text.length > 0) {
        selectedText = text;
        createAskButton(
            e.pageX + 5,
            e.pageY + 5
        );
    }
});