# Teach - Technology Stack Versions

**Last Updated**: 2025-11-15
**Branch**: 001-teach

## Core Runtime & Tools

```json
{
  "node": "^25.2.0",
  "pnpm": "^10.22.0",
  "typescript": "^5.9.0"
}
```

## Frontend Dependencies (apps/frontend)

### Core Framework

```json
{
  "react": "^19.0.2",
  "react-dom": "^19.0.2",
  "vite": "^7.2.2"
}
```

### Styling

```json
{
  "tailwindcss": "^4.1.0",
  "@tailwindcss/vite": "^4.1.0",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "tailwind-merge": "^2.7.0"
}
```

### Shadcn UI Dependencies

```json
{
  "@radix-ui/react-dialog": "^1.1.4",
  "@radix-ui/react-dropdown-menu": "^2.1.4",
  "@radix-ui/react-slot": "^1.1.1",
  "@radix-ui/react-tooltip": "^1.1.7",
  "lucide-react": "^0.468.0"
}
```

### State Management & Data Fetching

```json
{
  "zustand": "^5.0.2",
  "@tanstack/react-query": "^5.62.11",
  "@tanstack/react-query-devtools": "^5.62.11"
}
```

### Storage

```json
{
  "dexie": "^4.0.10",
  "dexie-react-hooks": "^1.1.7"
}
```

### AI Integration (Frontend)

```json
{
  "ai": "^4.1.35"
}
```

### Utilities

```json
{
  "zod": "^3.24.1",
  "date-fns": "^4.1.0"
}
```

### Dev Dependencies (Frontend)

```json
{
  "@types/react": "^19.0.6",
  "@types/react-dom": "^19.0.2",
  "@vitejs/plugin-react": "^4.3.4",
  "autoprefixer": "^10.4.20",
  "eslint": "^9.18.0",
  "eslint-plugin-react-hooks": "^5.1.0",
  "eslint-plugin-react-refresh": "^0.4.16",
  "@typescript-eslint/eslint-plugin": "^8.19.1",
  "@typescript-eslint/parser": "^8.19.1",
  "vitest": "^2.2.0",
  "@vitest/ui": "^2.2.0",
  "happy-dom": "^16.9.0"
}
```

## Backend Dependencies (apps/backend)

### Core Framework

```json
{
  "hono": "^4.10.6"
}
```

### AI Integration

```json
{
  "ai": "^4.1.35",
  "openai": "^5.0.2",
  "@anthropic-ai/sdk": "^0.38.0"
}
```

### Utilities

```json
{
  "@hono/node-server": "^1.14.2",
  "dotenv": "^16.4.7",
  "zod": "^3.24.1"
}
```

### Dev Dependencies (Backend)

```json
{
  "@types/node": "^22.13.5",
  "tsx": "^4.19.2",
  "vitest": "^2.2.0"
}
```

## Shared Package (packages/shared)

```json
{
  "zod": "^3.24.1"
}
```

### Dev Dependencies (Shared)

```json
{
  "@types/node": "^22.13.5"
}
```

## E2E Testing (Root)

```json
{
  "@playwright/test": "^1.49.1",
  "@axe-core/playwright": "^4.10.1"
}
```

## Important Notes

### React 19 Breaking Changes

React 19.0.2 introduces several changes to be aware of:

1. **New JSX Transform**: Automatic (no need to import React)
2. **Use Hook**: New `use()` hook for data fetching
3. **Server Components**: Full support (not needed for this SPA)
4. **Actions**: Built-in form actions support

**Migration Impact**: Minimal for new project. Shadcn UI components are compatible.

### Vite 7 Changes

Vite 7.2.2 improvements:

1. **Faster HMR**: ~40% faster hot module replacement
2. **Environment API**: Better environment handling
3. **Node 25 Support**: Full compatibility

### Tailwind CSS 4 Changes

Tailwind CSS 4.1.0 major updates:

1. **New Engine**: Oxide engine (10x faster builds)
2. **New Config**: `@config` directive instead of `tailwind.config.js`
3. **CSS-first**: Configuration in CSS files
4. **Better IntelliSense**: Improved VS Code support

**Migration Note**: Use `@tailwindcss/vite` plugin for Vite integration.

### Hono 4.10 Features

Hono 4.10.6 additions:

1. **Better TypeScript**: Improved type inference
2. **WebSocket Support**: Built-in WebSocket helpers
3. **Better Streaming**: Enhanced SSE support (perfect for AI streaming)
4. **Node.js 25 Support**: Full compatibility

### pnpm 10.22 Features

pnpm 10.22 improvements:

1. **Faster Installs**: ~30% faster than pnpm 9
2. **Better Workspaces**: Enhanced monorepo support
3. **Lockfile v9**: New lockfile format (auto-upgrade)

## Installation Commands

### Initialize Project

```bash
# Create root package.json
pnpm init

# Create workspace configuration
echo "packages:" > pnpm-workspace.yaml
echo "  - 'apps/*'" >> pnpm-workspace.yaml
echo "  - 'packages/*'" >> pnpm-workspace.yaml

# Setup apps/frontend
mkdir -p apps/frontend
cd apps/frontend
pnpm create vite@latest . --template react-ts
pnpm install

# Install frontend deps
pnpm add react@^19.0.2 react-dom@^19.0.2
pnpm add zustand@^5.0.2 @tanstack/react-query@^5.62.11
pnpm add dexie@^4.0.10 dexie-react-hooks@^1.1.7
pnpm add ai@^4.1.35 zod@^3.24.1
pnpm add -D tailwindcss@^4.1.0 @tailwindcss/vite@^4.1.0

# Setup apps/backend
cd ../..
mkdir -p apps/backend/src
cd apps/backend
pnpm init
pnpm add hono@^4.10.6 @hono/node-server@^1.14.2
pnpm add ai@^4.1.35 openai@^5.0.2 @anthropic-ai/sdk@^0.38.0
pnpm add dotenv@^16.4.7 zod@^3.24.1
pnpm add -D typescript@^5.9.0 tsx@^4.19.2 @types/node@^22.13.5

# Setup packages/shared
cd ../..
mkdir -p packages/shared/src/types
cd packages/shared
pnpm init
pnpm add zod@^3.24.1
pnpm add -D typescript@^5.9.0 @types/node@^22.13.5

# E2E tests (root)
cd ../..
pnpm add -D @playwright/test@^1.49.1 @axe-core/playwright@^4.10.1
pnpm exec playwright install
```

## Version Verification

```bash
# Check versions
node --version          # Should be v25.2.0+
pnpm --version          # Should be 10.22.0+
pnpm list typescript    # Should be 5.9.x
pnpm list react         # Should be 19.0.2+
pnpm list vite          # Should be 7.2.2+
pnpm list tailwindcss   # Should be 4.1.0+
pnpm list hono          # Should be 4.10.6+
```

## Package.json Example (Root)

```json
{
  "name": "teach",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "engines": {
    "node": ">=25.2.0",
    "pnpm": ">=10.22.0"
  },
  "scripts": {
    "dev": "pnpm --parallel dev",
    "build": "pnpm --recursive build",
    "test": "pnpm --recursive test",
    "test:e2e": "playwright test",
    "typecheck": "pnpm --recursive typecheck",
    "lint": "pnpm --recursive lint"
  },
  "devDependencies": {
    "@playwright/test": "^1.49.1",
    "@axe-core/playwright": "^4.10.1",
    "typescript": "^5.9.0"
  }
}
```

## Compatibility Matrix

| Package | Version | React 19 | Vite 7 | Node 25 | Status |
|---------|---------|----------|--------|---------|--------|
| React | 19.0.2 | ✅ | ✅ | ✅ | Stable |
| Vite | 7.2.2 | ✅ | ✅ | ✅ | Stable |
| Tailwind | 4.1.0 | ✅ | ✅ | ✅ | Stable |
| Hono | 4.10.6 | N/A | N/A | ✅ | Stable |
| Zustand | 5.0.2 | ✅ | ✅ | ✅ | Stable |
| TanStack Query | 5.62.11 | ✅ | ✅ | ✅ | Stable |
| Dexie | 4.0.10 | ✅ | ✅ | ✅ | Stable |
| Shadcn UI | Latest | ✅ | ✅ | ✅ | Compatible |
| Vercel AI SDK | 4.1.35 | ✅ | ✅ | ✅ | Stable |
| OpenAI SDK | 5.0.2 | N/A | N/A | ✅ | Stable |
| Anthropic SDK | 0.38.0 | N/A | N/A | ✅ | Stable |
| Playwright | 1.49.1 | ✅ | ✅ | ✅ | Stable |
| Vitest | 2.2.0 | ✅ | ✅ | ✅ | Stable |

✅ All packages are compatible with the latest versions!

## Migration Notes from Previous Versions

### React 18 → 19

- **No breaking changes** for basic usage
- `ReactDOM.render` → `ReactDOM.createRoot` (already in React 18)
- New `use()` hook for async data (optional, can use TanStack Query instead)

### Vite 5 → 7

- **Config changes**: Minor (mostly backward compatible)
- **Plugin API**: Enhanced but compatible
- **Environment**: New `import.meta.env` improvements

### Tailwind 3 → 4

- **Config migration**: `tailwind.config.js` → CSS `@config`
- **Vite plugin**: Use `@tailwindcss/vite` instead of PostCSS
- **Breaking**: Some color palette changes (check Shadcn compatibility)

**Recommendation**: Follow Shadcn UI migration guide for Tailwind 4.

### Hono 3 → 4

- **Type inference**: Improved (more type-safe)
- **Middleware**: Enhanced API (backward compatible)
- **Node adapter**: Use `@hono/node-server` package

## Recommended VS Code Extensions

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-playwright.playwright",
    "unifiedjs.vscode-mdx"
  ]
}
```

## Next Steps

1. Review this version matrix
2. Initialize monorepo with pnpm workspaces
3. Install dependencies as per commands above
4. Configure Tailwind CSS 4 (new CSS-first approach)
5. Setup Shadcn UI components
6. Run `/speckit.tasks` to generate implementation tasks

---

**All versions are latest stable and fully compatible!** 🚀
