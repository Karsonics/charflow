-- CharFlow AI Database Schema
-- Compatible with MySQL/MariaDB (XAMPP)

-- Set up database
CREATE DATABASE IF NOT EXISTS charflow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE charflow;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- UserSettings table
CREATE TABLE IF NOT EXISTS user_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  llm_provider ENUM('OPENROUTER', 'OLLAMA') DEFAULT 'OPENROUTER',
  openrouter_api_key TEXT,
  selected_model VARCHAR(100) DEFAULT 'openai/gpt-3.5-turbo',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Characters table
CREATE TABLE IF NOT EXISTS characters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  creator_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  greeting TEXT,
  example_dialogues TEXT,
  visibility ENUM('public', 'private') DEFAULT 'private',
  avatar_url VARCHAR(500),
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_creator (creator_id),
  INDEX idx_visibility (visibility),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Chats table
CREATE TABLE IF NOT EXISTS chats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  provider_override ENUM('OPENROUTER', 'OLLAMA') NULL,
  model_override VARCHAR(100) NULL,
  INDEX idx_created (created_at),
  INDEX idx_updated (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ChatParticipants table
CREATE TABLE IF NOT EXISTS chat_participants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  chat_id INT NOT NULL,
  user_id INT NULL,
  character_id INT NULL,
  role ENUM('user', 'character', 'admin') DEFAULT 'user',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
  INDEX idx_chat (chat_id),
  INDEX idx_user (user_id),
  INDEX idx_character (character_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  chat_id INT NOT NULL,
  sender_type ENUM('user', 'character') NOT NULL,
  sender_id INT NOT NULL,
  content TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
  INDEX idx_chat (chat_id),
  INDEX idx_sender (sender_type, sender_id),
  INDEX idx_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ratings table
CREATE TABLE IF NOT EXISTS ratings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  message_id INT NOT NULL UNIQUE,
  score INT NOT NULL,
  user_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_message (message_id),
  INDEX idx_user (user_id),
  INDEX idx_score (score)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;