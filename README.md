# Click-to-Chat Plugin

Welcome to **Click-to-Chat**, a Google Chrome extension that allows you to interact with Gemini AI using highlighted text on any webpage. Simply highlight text, ask questions about it, and keep track of your chat history seamlessly.

## Features

- **Gemini API Integration**: Connect your Gemini API key to enable AI-powered interactions.
- **Highlight Text to Ask Questions**: Highlight any text on any website and ask Gemini questions about the highlighted content.
- **Chat History**: View chat history per website to easily refer back to previous discussions and interactions.

## Installation

1. **Clone the Repository**
   ```sh
   git clone https://github.com/rohan-shnkr/click-to-chat-plugin.git
   ```

2. **Install Dependencies**
   ```sh
   cd click-to-chat-plugin
   npm install
   ```

3. **Build the Extension**
   ```sh
   npm run build
   ```

4. **Load the Extension**
   - Open Google Chrome and go to `chrome://extensions/`
   - Enable **Developer mode** (toggle switch in the top right corner)
   - Click on **Load unpacked** and select the `dist` folder from the cloned repository

## Getting Started

1. **API Key Setup**
   - Once the extension is loaded, click on the extension icon in the Chrome toolbar.
   - You will be prompted to enter your **Gemini API key** to enable interaction.

2. **Highlight and Chat**
   - Visit any website.
   - Highlight text that you would like to inquire about.
   - Right-click and select **"Ask Gemini"** to start a conversation.

3. **View Chat History**
   - Chats are saved per website.
   - To view your chat history, click on the extension icon while browsing the respective website.

## Permissions

This extension requires the following permissions:
- **ActiveTab**: To access the content of the tab you are on and enable context-specific interactions.

## Contributing

Contributions are welcome! If you have suggestions for improvements or new features, please:
- Fork the repository
- Create a new branch (`git checkout -b feature/YourFeature`)
- Commit your changes (`git commit -m 'Add some feature'`)
- Push to the branch (`git push origin feature/YourFeature`)
- Open a pull request

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Contact

For questions, suggestions, or feedback, feel free to open an issue on [GitHub](https://github.com/rohan-shnkr/click-to-chat-plugin/issues).

Happy chatting with Gemini! 🚀
