document.addEventListener('DOMContentLoaded', async () => {
    const apiKeyInput = document.getElementById('apiKey');
    const saveButton = document.getElementById('saveBtn');
    const statusDiv = document.getElementById('status');

    // Load existing API key
    const { apiKey } = await chrome.storage.local.get('apiKey');
    if (apiKey) {
        apiKeyInput.value = apiKey;
    }

    // Save API key
    saveButton.addEventListener('click', async () => {
        const apiKey = apiKeyInput.value.trim();
        
        if (!apiKey) {
            showStatus('Please enter an API key', 'error');
            return;
        }

        try {
            // Verify the API key works
            const isValid = await verifyApiKey(apiKey);
            
            if (isValid) {
                await chrome.storage.local.set({ apiKey });
                showStatus('API key saved successfully!', 'success');
                
                // Notify background script that API key has changed
                chrome.runtime.sendMessage({ action: 'apiKeyUpdated', apiKey });
            } else {
                showStatus('Invalid API key. Please check and try again.', 'error');
            }
        } catch (error) {
            showStatus('Error validating API key. Please try again.', 'error');
        }
    });

    function showStatus(message, type) {
        statusDiv.textContent = message;
        statusDiv.className = `status ${type}`;
        setTimeout(() => {
            statusDiv.className = 'status';
        }, 3000);
    }

    async function verifyApiKey(apiKey) {
        try {
            const response = await fetch(
                'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=' + apiKey,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: 'Test'
                            }]
                        }]
                    })
                }
            );
            
            return response.ok;
        } catch (error) {
            return false;
        }
    }
});