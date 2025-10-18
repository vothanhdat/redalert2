# Vite + TypeScript Migration Guide

This document explains the migration of the Red Alert 2 game project from plain JavaScript to Vite + TypeScript.

## What Changed

### Before Migration
- Plain JavaScript files loaded via `<script>` tags
- Dependencies (PixiJS, jQuery, SoundJS) loaded from CDN or local files
- No build process
- No module system
- Manual file ordering in HTML

### After Migration
- Modern ES modules with TypeScript support
- npm package management
- Vite build system for development and production
- Hot module replacement (HMR) in development
- Optimized production builds

## Directory Structure Changes

### Old Structure
```
redalert2/
├── JS/              # JavaScript source files
├── Scripts/         # External libraries
├── IMG/             # Images
├── Audio/           # Audio files
├── Data/            # Game data
└── index.html       # Entry point with inline scripts
```

### New Structure
```
redalert2/
├── src/             # Source code
│   ├── JS/          # Game logic (mixed JS/TS)
│   ├── lib/         # Helper libraries
│   ├── main.ts      # Module entry point
│   └── game-init.ts # Game initialization
├── public/          # Static assets (served as-is)
│   ├── IMG/         # Images
│   ├── Audio/       # Audio files
│   ├── Data/        # Game data
│   └── lib/         # Non-module libraries (SoundJS)
├── dist/            # Build output (gitignored)
├── node_modules/    # npm dependencies (gitignored)
└── index.html       # HTML entry point
```

## How Libraries are Loaded

### PixiJS (v7.4.2)
- **Method**: npm package, ES module import
- **Usage**: `import * as PIXI from 'pixi.js'`
- **Global**: Available as `window.PIXI` for legacy code
- **Note**: v7 is used for compatibility; v8 migration will be in a separate PR

### jQuery (v3.7.1)
- **Method**: npm package, ES module import
- **Usage**: `import $ from 'jquery'`
- **Global**: Available as `window.$` and `window.jQuery` for legacy code

### SoundJS (v1.0.1)
- **Method**: Script tag (legacy)
- **Why**: No ES module support
- **Location**: `public/lib/soundjs.min.js`
- **Global**: Available as `window.createjs`

## TypeScript Conversion Strategy

### Gradual Migration
Files can be converted from `.js` to `.ts` incrementally. Both work side-by-side.

### Example Conversion

**Before (JavaScript):**
```javascript
var LOADER_SCREEN = new (function () {
    this.div = null;
    this.on_start = function () {
        this.div = $("#loader")[0];
    }
})();
```

**After (TypeScript):**
```typescript
class LoaderScreen {
    private div: HTMLElement | null = null;
    
    on_start(): void {
        this.div = document.getElementById("loader");
    }
}

const LOADER_SCREEN = new LoaderScreen();
(window as any).LOADER_SCREEN = LOADER_SCREEN;
```

### Key Principles
1. **Maintain Global Variables**: Legacy code expects globals
2. **Preserve Method Names**: Even if they have typos (for compatibility)
3. **Add Types Gradually**: Start with `any`, refine over time
4. **Document Decisions**: Comment why certain patterns are used

## Development Workflow

### Starting Development
```bash
npm install          # Install dependencies
npm run dev          # Start dev server (http://localhost:3000)
```

### Building for Production
```bash
npm run build        # Build to dist/ folder
npm run preview      # Preview production build locally
```

### Type Checking
```bash
npm run build:check  # Build with TypeScript type checking
```

## Common Tasks

### Adding a New Dependency
```bash
npm install package-name
npm install --save-dev @types/package-name  # If types available
```

### Converting a File to TypeScript
1. Rename `file.js` to `file.ts`
2. Add type annotations
3. Export/import properly
4. Update imports in other files
5. Test build: `npm run build`

### Debugging Build Issues
- Check browser console for errors
- Run `npm run build` to see compilation errors
- Check Vite dev server output for warnings

## Backward Compatibility

### Global Variables
Most game objects are still exposed globally for compatibility:
- `window.PIXI`
- `window.$` / `window.jQuery`
- `window.createjs`
- `window.LOADER_SCREEN`
- `window.mainstage`
- `window.graphics`
- etc.

### Legacy Code Support
- Old JavaScript files work without modification
- Triple-slash references (e.g., `/// <reference path="...">`) are ignored
- Missing files in references don't break the build

## Performance

### Development
- Fast HMR (Hot Module Replacement)
- Instant server start
- On-demand compilation

### Production
- **Bundle Size**: ~1 MB (288 KB gzipped)
- **Modules**: 706 transformed
- **Build Time**: ~5 seconds

### Optimization Opportunities
1. Code splitting with dynamic imports
2. Lazy loading for game assets
3. Tree shaking (automatic with Vite)
4. Asset optimization

## Troubleshooting

### Build Fails
- Check `tsconfig.json` - strict mode might be too strict
- Verify all imports are correct
- Check for circular dependencies

### Assets Not Loading
- Ensure assets are in `public/` folder
- Use absolute paths from root: `/IMG/file.png`
- Check browser network tab

### Global Variable Not Found
- Verify it's exported: `(window as any).VAR_NAME = value`
- Check import order in `main.ts`
- Ensure file is imported before use

## Best Practices

### For New Code
1. Write in TypeScript
2. Use ES modules
3. Add proper types
4. Avoid globals when possible

### For Legacy Code
1. Keep as-is initially
2. Convert when modifying
3. Maintain API compatibility
3. Document breaking changes

### For Testing
1. Test in development mode first
2. Test production build
3. Test in multiple browsers
4. Check console for errors

## Resources

- [Vite Documentation](https://vitejs.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [PixiJS v8 Docs](https://pixijs.com/8.x/guides)

## Support

For issues specific to this migration:
1. Check build output for errors
2. Verify node_modules are installed
3. Try deleting `node_modules` and `package-lock.json`, then `npm install`
4. Check this guide for common solutions
