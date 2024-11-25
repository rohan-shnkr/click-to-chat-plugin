(function () {
  'use strict';

  (function () {

    (function () {

      (function () {

        (function () {

          (function () {

            (function () {

              (function () {

                importScripts('gemini-api.js');

                // Initialize side panel behavior
                chrome.sidePanel
                  .setPanelBehavior({ openPanelOnActionClick: false })
                  .catch((error) => console.error(error));

                // Handle commands (keyboard shortcuts)
                chrome.commands.onCommand.addListener((command) => {
                  if (command === 'toggleSidePanel') {
                    chrome.sidePanel.open();
                  }
                });

                // Handle messages from content script
                chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
                    if (request.action === 'askGemini') {
                        handleGeminiRequest(request, sender.tab.id);
                        sendResponse({ status: 'processing' });
                        return false;
                    }
                });

                async function handleGeminiRequest(request, tabId) {
                    try {
                        console.log('Processing request:', request);
                        
                        // Create prompt with context
                        const prompt = `Context: "${request.context}"\n\nQuestion: ${request.message}\n\nPlease provide a clear and concise explanation.`;
                        
                        console.log('Sending prompt to Gemini:', prompt);
                        
                        // Get response from Gemini
                        const reply = await generateContent(prompt);
                        
                        console.log('Received response from Gemini:', reply);
                        
                        // Save to history
                        await saveChatHistory(request.url, request.context, request.message, reply);
                        
                        // Send response back to content script
                        chrome.tabs.sendMessage(tabId, {
                            action: 'geminiResponse',
                            messageId: request.messageId,
                            response: { reply }
                        });
                    } catch (error) {
                        console.error('Gemini API Error:', error);
                        chrome.tabs.sendMessage(tabId, {
                            action: 'geminiResponse',
                            messageId: request.messageId,
                            error: error.message || 'Failed to get response from Gemini'
                        });
                    }
                }

                async function saveChatHistory(url, context, message, reply) {
                    try {
                        const result = await chrome.storage.local.get('chatHistory');
                        const history = result.chatHistory || {};
                        const urlHistory = history[url] || [];
                        
                        // Find existing thread for this context or create new one
                        let thread = urlHistory.find(t => t.context === context);
                        if (!thread) {
                            thread = {
                                context,
                                messages: [],
                                timestamp: Date.now()
                            };
                            urlHistory.push(thread);
                        }
                        
                        // Add new message pair
                        thread.messages.push({
                            user: message,
                            gemini: reply,
                            timestamp: Date.now()
                        });
                        
                        // Update storage
                        history[url] = urlHistory;
                        await chrome.storage.local.set({ chatHistory: history });
                        
                        console.log('Chat history updated successfully');
                    } catch (error) {
                        console.error('Error saving chat history:', error);
                    }
                }

              })();

            })();

          })();

        })();

      })();

    })();

  })();

})();
