async function getApiKey() {
    const result = await chrome.storage.local.get('apiKey');
    return result.apiKey;
}

async function generateContent(prompt) {
    const apiKey = await getApiKey();
    
    if (!apiKey) {
        throw new Error('Please set your API key in the extension settings');
    }

    const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=' + apiKey, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: prompt
                }]
            }]
        })
    });

    if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            throw new Error('Invalid API key. Please check your API key in the extension settings.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}