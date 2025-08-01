# TeamBoard - Collaborative Planning Tool

A simple collab tool, built with React, TypeScript, and Tailwind CSS.

## Installation

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn** package manager
- **Git** for version control

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/teamboard.git
   cd teamboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔧 Development

### Available Scripts

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Eject from Create React App (not recommended)
npm run eject

# Deploy to GitHub Pages
npm run deploy
```

### Project Structure

```
teamboard/
├── public/
│   ├── index.html          # Main HTML template
│   ├── favicon.ico         # App icon
│   └── manifest.json       # PWA manifest
├── src/
│   ├── components/         # React components
│   │   ├── Login.tsx       # Authentication component
│   │   ├── Dashboard.tsx   # Main dashboard layout
│   │   ├── DocumentManager.tsx  # Document management
│   │   ├── CommentSystem.tsx    # Comments and forum
│   │   ├── PlanningBoard.tsx    # Kanban board
│   │   ├── UserSettings.tsx     # User preferences
│   │   └── EmbeddedComments.tsx # Embedded comments
│   ├── contexts/
│   │   └── AuthContext.tsx      # Authentication context
│   ├── services/           # API services (future)
│   ├── App.tsx            # Main app component
│   ├── index.tsx          # App entry point
│   └── index.css          # Global styles
├── package.json           # Dependencies and scripts
├── tailwind.config.js    # Tailwind configuration
├── tsconfig.json         # TypeScript configuration
└── README.md            # This file
```
