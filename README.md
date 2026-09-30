# AI Desktop Assistant

An AI-powered Windows desktop assistant built using Node.js, Express, and the OpenAI API. The assistant supports natural-language conversations and approved desktop actions, such as opening websites, Windows folders, and selected applications.

## Features

* AI-powered chat using the OpenAI API
* Open websites in the default browser
* Open Windows folders, including Downloads, Documents, Desktop, Pictures, and Videos
* Launch approved Windows applications, including Notepad, Calculator, Paint, Command Prompt, and PowerShell
* Web-based chat interface
* Backend API built with Express
* Environment-variable configuration for API key security

## Technologies Used

* Node.js
* Express.js
* OpenAI API
* JavaScript
* HTML, CSS, and JavaScript (frontend, if applicable)

## Prerequisites

* Node.js 18 or later
* npm
* Git
* An OpenAI API key
* Windows operating system for desktop actions

## Installation

1. Clone the repository:

   ```bash
   git clone YOUR_GITHUB_REPOSITORY_URL
   ```

2. Navigate into the project folder:

   ```bash
   cd ai-desktop-assistant
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Create a `.env` file in the project root and add your API key:

   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ```

5. Start the application:

   ```bash
   npm start
   ```

6. Open your browser and visit:

   http://localhost:3000

## Project Structure

```text
ai-desktop-assistant/
├── public/
├── server.js
├── package.json
├── package-lock.json
├── .env.example
├── .gitignore
└── README.md
```

## Security

* Keep your API key private.
* Never commit `.env` to GitHub.
* Use `.env.example` to document required environment variables.
* Do not expose your API key in frontend code.

## Platform

The desktop automation features are designed for Windows. The web interface and AI chat functionality require a running Node.js server and a valid API key.

## License

This project is available for educational and personal use. Add a license if you intend to specify permissions for reuse and distribution.
