# CharFlow AI - rawr

A full-stack application for creating, discovering, and interacting with AI-driven characters capable of human-like conversation, roleplay, and storytelling.

## Features

- **Chat System**: Real-time messaging with AI characters using LLM
- **Character Creation**: Create custom characters with name, description, greeting, and example dialogues
- **Character Discovery**: Browse and search public characters
- **LLM Provider Switching**: Use OpenRouter (cloud) or Ollama (local)
- **Ratings**: Rate AI responses on a 1-4 scale
- **Persistent Storage**: All data stored in MySQL/MariaDB (XAMPP compatible)

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: MySQL/MariaDB
- **LLM Providers**: OpenRouter, Ollama

## Getting Started

### Prerequisites

- Node.js 18+
- MySQL/MariaDB
- (Optional) Ollama for local inference
- (Optional) OpenRouter API key for cloud inference

### Database Setup

The database schema is automatically created when you run the migrations:

```bash
cd backend
npm install
node src/db/migrate.js
```

### Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your settings
npm start
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

```env
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=charflow

JWT_SECRET=your-secret-key
ENCRYPTION_KEY=your-32-char-encryption-key

# Optional: OpenRouter API key
OPENROUTER_API_KEY=

# Optional: Ollama URL (default: http://localhost:11434)
OLLAMA_URL=http://localhost:11434
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Characters
- `GET /api/characters` - List public characters
- `POST /api/characters` - Create character
- `GET /api/characters/:id` - Get character details
- `PUT /api/characters/:id` - Update character
- `DELETE /api/characters/:id` - Delete character
- `GET /api/characters/my` - Get user's characters

### Chat
- `POST /api/chat/start` - Start new chat
- `POST /api/chat/message` - Send message
- `GET /api/chat/:id` - Get chat messages
- `GET /api/chat/history` - Get chat history
- `DELETE /api/chat/:id` - Delete chat
- `POST /api/chat/rate` - Rate message

### Settings
- `GET /api/settings/llm` - Get LLM settings
- `POST /api/settings/llm` - Update LLM settings

### Models
- `GET /api/models/openrouter` - List OpenRouter models
- `GET /api/models/ollama` - List Ollama models

## User Flows

1. **Register/Login** - Create account and login
2. **Create Character** - Build custom character with personality
3. **Discover** - Browse public characters
4. **Chat** - Start conversation with any character
5. **Settings** - Configure LLM provider and API keys

## License

MIT
