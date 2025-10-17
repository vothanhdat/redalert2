# Red Alert 2 - Game Clone

A Command & Conquer: Red Alert 2 game clone built with TypeScript, Vite, and PixiJS.

## Project Migration

This project has been migrated from plain JavaScript to TypeScript with Vite as the build tool.

### Technology Stack

- **TypeScript** - For type safety and better development experience
- **Vite** - Fast build tool and development server
- **PixiJS v8** - 2D rendering engine
- **jQuery** - DOM manipulation
- **SoundJS** - Audio management

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm

### Installation

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The game will be available at `http://localhost:3000/`

### Building for Production

Build the project:

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

## Project Structure

```
redalert2/
├── public/           # Static assets (images, audio, data files)
│   ├── IMG/          # Game graphics and sprites
│   ├── Audio/        # Sound effects and music
│   └── Data/         # Map and game data
├── src/              # Source code
│   ├── JS/           # Game logic (JavaScript)
│   ├── lib/          # Helper libraries
│   ├── main.ts       # Main entry point
│   └── game-init.ts  # Game initialization
├── index.html        # Entry HTML file
├── vite.config.ts    # Vite configuration
├── tsconfig.json     # TypeScript configuration
└── package.json      # Project dependencies
```

## Migration Notes

- The original JavaScript files are kept in `src/JS/` directory
- External libraries (PixiJS, jQuery) are now managed via npm
- SoundJS is loaded via script tag due to lack of ES module support
- Build output goes to `dist/` directory
- Assets are served from `public/` directory

## Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run build:check` - Build with TypeScript type checking

## License

MIT
