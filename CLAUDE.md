# Typing Speed App - Development Guidelines

## Tech Stack

- **Runtime:** Bun
- **Language:** TypeScript (strict mode)
- **Formatter:** oxfmt
- **Core Library:** Effect JS
- **Testing:** Bun test with TDD approach

## Development Principles

### Test-Driven Development (TDD)

This project uses TDD because coding agents perform best with failure loops:

1. Write a failing test first
2. Write minimal code to make it pass
3. Refactor while keeping tests green

### Test Output Rules

**CRITICAL:** Tests must only output to stdout on failure to avoid blowing up agent context windows.

```bash
# Run tests quietly - only shows output on failure
bun test
```

Configure tests to be silent on success - only show output when something fails.

### Code Style

- Use `oxfmt` for formatting: `bunx oxfmt --write .`
- Prefer Effect JS patterns for error handling and async operations
- Use functional programming patterns where appropriate
- Keep functions small and composable

## Bun Best Practices

Default to using Bun instead of Node.js.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun build <file.html|file.ts|file.css>` instead of `webpack` or `esbuild`
- Use `bun install` instead of `npm install`
- Use `bunx <package> <command>` instead of `npx <package> <command>`
- Bun automatically loads .env, so don't use dotenv.

### Bun APIs

- `Bun.serve()` supports WebSockets, HTTPS, and routes. Don't use `express`.
- `bun:sqlite` for SQLite. Don't use `better-sqlite3`.
- Prefer `Bun.file` over `node:fs`'s readFile/writeFile
- `WebSocket` is built-in. Don't use `ws`.

### Frontend with Bun

Use HTML imports with `Bun.serve()`. Don't use `vite`. HTML imports fully support React, CSS, Tailwind.

```ts
import index from "./index.html"

Bun.serve({
  routes: {
    "/": index,
  },
  development: {
    hmr: true,
    console: true,
  }
})
```

HTML files can import .tsx, .jsx or .js files directly and Bun's bundler will transpile & bundle automatically.

## Project Structure

```
/home/user/Typing/
├── src/
│   ├── core/           # Core business logic
│   │   ├── keyboard/   # Keyboard layout and finger mappings
│   │   ├── words/      # Word lists and filtering
│   │   └── timing/     # WPM calculation
│   ├── components/     # UI components
│   └── main.ts         # Entry point
├── tests/              # Test files
├── public/             # Static assets
└── index.html          # Main HTML file
```

## Features

1. **Single-hand word lists** - Words typed entirely with left or right hand
2. **Keyboard visualization** - Color-coded by finger responsibility
3. **Finger hints** - Visual pairing of letters with fingers in word display
4. **WPM timing** - Track typing speed

## UX Guidelines

Reference: [MonkeyType](https://monkeytype.com/)

- Clean, minimal interface
- Focus on the typing experience
- Minimal distractions
- Dark theme friendly

## Commands

```bash
# Install dependencies
bun install

# Run development server
bun run dev

# Run tests (quiet on success)
bun test

# Format code
bunx oxfmt --write .

# Type check
bun run typecheck
```

## Keyboard Layout Reference

### Left Hand Keys (QWERTY)
- Pinky: Q, A, Z, 1, `
- Ring: W, S, X, 2
- Middle: E, D, C, 3
- Index: R, T, F, G, V, B, 4, 5

### Right Hand Keys (QWERTY)
- Index: Y, U, H, J, N, M, 6, 7
- Middle: I, K, , (comma), 8
- Ring: O, L, . (period), 9
- Pinky: P, ;, /, 0, -, =, [, ], \, '

### Finger Color Scheme
- Pinky: Red (#ef4444)
- Ring: Orange (#f97316)
- Middle: Yellow (#eab308)
- Index: Green (#22c55e)
- Thumb: Blue (#3b82f6)
