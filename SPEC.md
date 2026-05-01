# Character.AI Clone - Technical Specification

## 1. Project Overview

**Project Name**: CharFlow AI  
**Type**: Full-stack web application  
**Core Functionality**: A platform where users can create, discover, and interact with AI-driven characters capable of human-like conversation, roleplay, and storytelling.  
**Target Users**: Creative writers, roleplay enthusiasts, AI hobbyists, and developers interested in LLM-powered character interactions.

---

## 2. Technical Architecture

### Stack
- **Frontend**: React 18 with Vite
- **Backend**: Node.js + Express.js
- **Database**: MySQL/MariaDB (XAMPP compatible)
- **LLM Providers**: OpenRouter (cloud), Ollama (local)

### Directory Structure
```
charflow-ai/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── database/
│   │   └── migrations/
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── styles/
│   └── package.json
└── README.md
```

---

## 3. Database Schema

### Tables

#### Users
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email)
) ENGINE=InnoDB;
```

#### UserSettings
```sql
CREATE TABLE user_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  llm_provider ENUM('OPENROUTER', 'OLLAMA') DEFAULT 'OPENROUTER',
  openrouter_api_key TEXT,
  selected_model VARCHAR(100) DEFAULT 'openai/gpt-3.5-turbo',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
```

#### Characters
```sql
CREATE TABLE characters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  creator_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  greeting TEXT,
  example_dialogues TEXT,
  visibility ENUM('public', 'private') DEFAULT 'private',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_creator (creator_id),
  INDEX idx_visibility (visibility)
) ENGINE=InnoDB;
```

#### Chats
```sql
CREATE TABLE chats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  provider_override ENUM('OPENROUTER', 'OLLAMA') NULL,
  model_override VARCHAR(100) NULL,
  INDEX idx_created (created_at)
) ENGINE=InnoDB;
```

#### ChatParticipants
```sql
CREATE TABLE chat_participants (
  chat_id INT NOT NULL,
  user_id INT NULL,
  character_id INT NULL,
  PRIMARY KEY (chat_id, user_id, character_id),
  FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_character (character_id)
) ENGINE=InnoDB;
```

#### Messages
```sql
CREATE TABLE messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  chat_id INT NOT NULL,
  sender_type ENUM('user', 'character') NOT NULL,
  sender_id INT NOT NULL,
  content TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
  INDEX idx_chat (chat_id),
  INDEX idx_timestamp (timestamp)
) ENGINE=InnoDB;
```

#### Ratings
```sql
CREATE TABLE ratings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  message_id INT NOT NULL UNIQUE,
  score INT NOT NULL CHECK (score >= 1 AND score <= 4),
  FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
) ENGINE=InnoDB;
```

---

## 4. API Endpoints

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
- `GET /api/characters/user/:userId` - Get user's characters

### Chat
- `POST /api/chat/start` - Start new chat with character
- `POST /api/chat/message` - Send message to chat
- `GET /api/chat/:id` - Get chat messages
- `GET /api/chat/history` - Get user's chat history
- `DELETE /api/chat/:id` - Delete chat

### Ratings
- `POST /api/rate` - Rate a message

### Settings
- `POST /api/settings/llm` - Update LLM settings
- `GET /api/settings/llm` - Get LLM settings

### Models
- `GET /api/models/openrouter` - List OpenRouter models
- `GET /api/models/ollama` - List Ollama models

---

## 5. UI/UX Specification

### Pages

1. **Home Page** (`/`)
   - Hero section with tagline
   - Featured public characters grid
   - Quick actions: Login, Register, Browse Characters

2. **Login/Register** (`/login`, `/register`)
   - Simple form with username/email/password
   - Toggle between modes

3. **Character Discovery** (`/characters`)
   - Search bar
   - Filter by category/popularity
   - Grid of character cards
   - Click to start chat

4. **Character Creation** (`/characters/create`, `/characters/:id/edit`)
   - Form: name, description, greeting, example dialogues
   - Visibility toggle (public/private)
   - Preview pane

5. **Chat** (`/chat/:id`)
   - Message thread (user right, character left)
   - Input area with send button
   - Regenerate button
   - Character info sidebar

6. **Chat History** (`/chats`)
   - List of user's chats
   - Last message preview
   - Created date
   - Click to resume

7. **Profile** (`/profile`)
   - User info
   - My characters
   - Statistics

8. **Settings** (`/settings`)
   - LLM Provider toggle (OpenRouter/Ollama)
   - OpenRouter API key input
   - Model selection dropdown
   - Display Ollama models

### Components

- `Navbar` - Logo, navigation links, user menu
- `CharacterCard` - Avatar, name, description preview
- `MessageBubble` - Avatar, content, timestamp, rating
- `ChatInput` - Textarea, send button
- `Modal` - Overlay dialog
- `Button` - Primary/secondary variants
- `Input` - Text, textarea, select variants

### Color Palette
- **Primary**: `#6366f1` (Indigo)
- **Secondary**: `#8b5cf6` (Violet)
- **Background**: `#0f0f23` (Dark)
- **Surface**: `#1a1a2e` (Dark surface)
- **Text Primary**: `#f1f5f9` (Slate 100)
- **Text Secondary**: `#94a3b8` (Slate 400)
- **Success**: `#10b981` (Emerald)
- **Warning**: `#f59e0b` (Amber)
- **Error**: `#ef4444` (Red)

### Typography
- **Font Family**: Inter (headings), system-ui (body)
- **Headings**: 2rem (h1), 1.5rem (h2), 1.25rem (h3)
- **Body**: 1rem
- **Small**: 0.875rem

---

## 6. LLM Integration

### Interface
```typescript
interface LLMProvider {
  generateResponse(prompt: string, config: GenerationConfig): Promise<string>
  listModels(): Promise<Model[]>
}
```

### Prompt Construction
```
System: {character_description}
User personality: {character_personality}
Examples: {example_dialogues}
History: {recent_messages}
Input: {user_message}
```

### Providers

**OpenRouterProvider**
- Endpoint: `https://openrouter.ai/api/v1/chat/completions`
- Auth: Bearer token
- Models: openai/gpt-3.5-turbo, etc.

**OllamaProvider**
- Endpoint: `http://localhost:11434/api/generate`
- Models: llama2, mistral, etc.

---

## 7. Security

### Authentication
- JWT tokens with 7-day expiry
- Passwords hashed with bcrypt
- API keys encrypted with AES-256

### Validation
- All inputs sanitized
- SQL injection prevention (parameterized queries)
- XSS prevention (React escaping)

---

## 8. Acceptance Criteria

- [ ] Users can register and login
- [ ] Characters persist in database
- [ ] Chat messages save and reload
- [ ] Resume previous conversations
- [ ] Switch between OpenRouter and Ollama
- [ ] Rate messages 1-4
- [ ] Public character discovery works
- [ ] Group chat supports multiple participants
- [ ] API keys encrypted in database
- [ ] Responsive UI on all devices