document.addEventListener('DOMContentLoaded', async () => {
    const apiKeyInput = document.getElementById('apiKey');
    const saveButton = document.getElementById('saveBtn');
    const historyButton = document.getElementById('historyBtn');
    const statusDiv = document.getElementById('status');

    console.log('Popup script loaded');

    // Load existing API key
    try {
        const { apiKey } = await chrome.storage.local.get('apiKey');
        console.log('Existing API key found:', apiKey ? 'Yes' : 'No');
        if (apiKey) {
            apiKeyInput.value = apiKey;
        }
    } catch (error) {
        console.error('Error loading API key:', error);
    }

    // Save API key
    saveButton.addEventListener('click', async () => {
        console.log('Save button clicked');
        const apiKey = apiKeyInput.value.trim();
        
        if (!apiKey) {
            showStatus('Please enter an API key', 'error');
            return;
        }

        try {
            // Test the API key before saving
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: 'Test message'
                            }]
                        }]
                    })
                }
            );

            console.log('API test response status:', response.status);

            if (response.ok) {
                // Save the API key
                await chrome.storage.local.set({ apiKey });
                console.log('API key saved successfully');
                showStatus('API key saved successfully!', 'success');
                
                // Notify background script
                try {
                    await chrome.runtime.sendMessage({ 
                        action: 'apiKeyUpdated', 
                        apiKey 
                    });
                    console.log('Background script notified');
                } catch (error) {
                    console.error('Error notifying background script:', error);
                }
            } else {
                const errorData = await response.json();
                console.error('API validation failed:', errorData);
                showStatus('Invalid API key. Please check and try again.', 'error');
            }
        } catch (error) {
            console.error('Error saving API key:', error);
            showStatus('Error saving API key. Please try again.', 'error');
        }
    });

    // Open chat history
    if (historyButton) {
        historyButton.addEventListener('click', () => {
            console.log('History button clicked');
            // Send message to background script to open side panel
            chrome.runtime.sendMessage({ action: 'openSidePanel' })
                .then(() => {
                    window.close(); // Close the popup
                })
                .catch(error => {
                    console.error('Error opening side panel:', error);
                });
        });
    }

    function showStatus(message, type) {
        console.log('Showing status:', message, type);
        statusDiv.textContent = message;
        statusDiv.className = `status ${type}`;
        statusDiv.style.display = 'block'; // Make sure it's visible
        
        // Keep error messages visible longer
        if (type === 'error') {
            setTimeout(() => {
                statusDiv.style.display = 'none';
            }, 5000);
        } else {
            setTimeout(() => {
                statusDiv.style.display = 'none';
            }, 3000);
        }
    }
});