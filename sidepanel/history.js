// Function to format URL for display
function formatUrl(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname + urlObj.pathname;
    } catch (e) {
        return url;
    }
}

// Function to format timestamp
function formatDate(timestamp) {
    return new Date(timestamp).toLocaleString();
}

// Function to create message element
function createMessageElement(message) {
    const messageDiv = document.createElement('div');
    let className = '';
    let content = '';

    if (message.user) {
        className = 'thread-message user-message';
        content = message.user;
    } else if (message.gemini) {
        className = 'thread-message gemini-message';
        content = message.gemini;
    } else {
        className = 'thread-message system-message';
        content = message;
    }

    messageDiv.className = className;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = content;
    
    const timestampDiv = document.createElement('div');
    timestampDiv.className = 'message-timestamp';
    timestampDiv.textContent = formatDate(message.timestamp);
    
    messageDiv.appendChild(contentDiv);
    messageDiv.appendChild(timestampDiv);
    
    return messageDiv;
}

// Function to create thread element
function createThreadElement(thread) {
    const threadDiv = document.createElement('div');
    threadDiv.className = 'chat-thread';
    
    const headerDiv = document.createElement('div');
    headerDiv.className = 'thread-header';
    
    const contextDiv = document.createElement('div');
    contextDiv.className = 'thread-context';
    contextDiv.textContent = thread.context;
    
    const timestampDiv = document.createElement('div');
    timestampDiv.className = 'thread-timestamp';
    timestampDiv.textContent = formatDate(thread.timestamp);
    
    headerDiv.appendChild(contextDiv);
    headerDiv.appendChild(timestampDiv);
    
    const messagesDiv = document.createElement('div');
    messagesDiv.className = 'thread-messages';
    
    thread.messages.forEach(msg => {
        messagesDiv.appendChild(createMessageElement(msg));
    });
    
    // Toggle messages visibility on header click
    headerDiv.addEventListener('click', () => {
        const isVisible = messagesDiv.classList.contains('show');
        if (isVisible) {
            messagesDiv.classList.remove('show');
        } else {
            messagesDiv.classList.add('show');
        }
    });
    
    threadDiv.appendChild(headerDiv);
    threadDiv.appendChild(messagesDiv);
    
    return threadDiv;
}

// Function to create website section
function createWebsiteSection(url, threads) {
    const sectionDiv = document.createElement('div');
    sectionDiv.className = 'website-section';
    
    const headerDiv = document.createElement('div');
    headerDiv.className = 'website-header';
    headerDiv.innerHTML = `<div class="website-url">${formatUrl(url)}</div>`;
    
    const threadsDiv = document.createElement('div');
    threadsDiv.className = 'website-threads';
    
    // Sort threads by timestamp (newest first)
    threads.sort((a, b) => b.timestamp - a.timestamp);
    
    threads.forEach(thread => {
        threadsDiv.appendChild(createThreadElement(thread));
    });
    
    sectionDiv.appendChild(headerDiv);
    sectionDiv.appendChild(threadsDiv);
    
    return sectionDiv;
}

// Function to render chat history
async function renderChatHistory() {
    const websiteList = document.getElementById('websiteList');
    websiteList.innerHTML = '';
    
    const result = await chrome.storage.local.get('chatHistory');
    const chatHistory = result.chatHistory || {};
    
    if (Object.keys(chatHistory).length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.textContent = 'No chat history yet. Highlight text on any webpage to start chatting with Gemini!';
        websiteList.appendChild(emptyState);
        return;
    }
    
    // Sort websites by most recent thread
    const sortedUrls = Object.entries(chatHistory)
        .sort(([, a], [, b]) => {
            const latestA = Math.max(...a.map(thread => thread.timestamp));
            const latestB = Math.max(...b.map(thread => thread.timestamp));
            return latestB - latestA;
        });
    
    sortedUrls.forEach(([url, threads]) => {
        websiteList.appendChild(createWebsiteSection(url, threads));
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderChatHistory();
});

// Listen for storage changes to update the UI
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.chatHistory) {
        renderChatHistory();
    }
});