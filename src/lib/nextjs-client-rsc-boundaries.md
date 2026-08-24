# React Server Component / Client Component Boundary Issues

## Common Problem
When a component uses hooks like `useState`, `useEffect`, or `useContext` but is rendered from a Server Component (including layouts and pages without "use client"), the build fails with:

```
Error: Attempted to call useMemeGenerator() from the server but useMemeGenerator is on the client.
```

## Root Cause
Next.js 16's App Router distinguishes between:
- **Server Components** (default) - Render on server, no hooks allowed
- **Client Components** (with "use client") - Render on client, can use React hooks

## Solutions

### 1. Global Event Pattern (Recommended for modals/dialogs)
Use `CustomEvent` for cross-boundary communication without hooks:

```typescript
// Component file: "use client"
const EVENT_NAME = "myapp-modal-open";

// Provider (client component)
useEffect(() => {
  const handler = (e: CustomEvent<{type: string}>) => {
    if (e.detail.type === "open") setIsOpen(true);
    if (e.detail.type === "close") setIsOpen(false);
  };
  window.addEventListener(EVENT_NAME, handler as EventListener);
  return () => window.removeEventListener(EVENT_NAME, handler as EventListener);
}, []);

// Helper function (can be imported in server components)
export function openModal() {
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { type: "open" } }));
}
```

### 2. Lift State Up
Move the provider to `layout.tsx` and ensure all pages import it correctly.

### 3. Make Page a Client Component
Add `"use client"` at the top of `page.tsx` if it needs hooks.

### 4. Use callback ref pattern
For parent-child communication without hooks.

## Security Note
NEVER expose API keys or secrets in client components. All API calls should go through server-side routes.

## Rate Limiting Considerations
When using global events, remember to debounce rapid dispatches to prevent abuse:

```typescript
let lastDispatch = 0;
export function safeOpenModal() {
  const now = Date.now();
  if (now - lastDispatch > 500) { // 500ms cooldown
    lastDispatch = now;
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { type: "open" } }));
  }
}
```

## Common Pitfall: "use client" in Wrong Place
Placing `"use client"` in a file that's imported by multiple server components can cause hydration mismatches. Keep client code isolated.