# Frog Game Widget (plain JavaScript)

This folder is a portable React component for JavaScript-based Vite apps. Its CSS is already compiled, so the destination app does **not** need TypeScript or Tailwind CSS.

## Install

1. Copy this entire `frog-widget` folder into the destination app's `src/` folder.
2. In the destination app, install the one additional runtime dependency:

```bash
npm install lucide-react
```

React and React DOM are supplied by the destination app.

## Use

```jsx
import FrogGameWidget from './frog-widget';

export default function App() {
  return (
    <>
      {/* The rest of your site */}
      <FrogGameWidget />
    </>
  );
}
```

The widget is fixed to the bottom-right corner by default. It can also be configured:

```jsx
<FrogGameWidget
  defaultOpen={false}
  position="bottom-left"
  size="compact"
/>
```

Supported props:

- `defaultOpen`: `true` or `false`
- `position`: `"bottom-right"` or `"bottom-left"`
- `size`: `"default"` or `"compact"`

The high score and mute preference are stored in the visitor's browser using `localStorage`.

## Updating this folder

After editing the main frog-game project, regenerate this folder from the project root:

```bash
npm run build:portable
```

The build command automatically copies every file from `src/assets/`.
