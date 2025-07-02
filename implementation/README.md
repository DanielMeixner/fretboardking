
# FretboardKing & Logo

The app is now called **FretboardKing** everywhere (no more 'Trainer').
The app heading displays a new logo next to the name.

# Settings Modal & Customization

You can now open a settings modal (gear icon, top left) to:
- View your stats (last 30 days bar chart)
- Toggle string name display on the fretboard
- Change the fretboard background color (color picker)
All settings are persisted in your browser.

### Reviewer Instructions
- Confirm the app heading says 'FretboardKing' and shows the logo
- Open the settings modal (gear icon)
- Test toggling string names on/off and confirm the fretboard updates
- Test changing the fretboard color and confirm the update
- Confirm settings persist after reload
- Confirm stats (bar chart) are visible in the modal
# FretboardKing Implementation

This is the implementation folder for the Guitar Fretboard Learning Application (MVP) using React + TypeScript and Vite.

## Setup

1. Install dependencies:
   ```sh
   npm install
   ```
2. Start the development server:
   ```sh
   npm run dev
   ```

## Features
- Minimal React + TypeScript setup
- Ready for PWA enhancements
- See project root for further instructions and planning


## Usage & Testing

### Running the App
1. Install dependencies:
   ```sh
   npm install
   ```
2. Start the development server:
   ```sh
   npm run dev
   ```
3. Open the local URL shown in the terminal (usually http://localhost:5173) in your browser.

### Features to Review
- Interactive fretboard (6 strings, 12 frets, markers at 3, 5, 7, 9, 12)
- Quiz mode: random fret flashes, user selects correct note from 3 options
- Timer and immediate feedback
- Score and yesterday's score display
- Responsive layout (fretboard uses 80% of width)
- Fret markers: one dot per marked fret, centered

### Reviewer Instructions
- Test the quiz by answering questions and observing score updates
- Confirm fretboard and markers render correctly on different screen sizes
- Check that the highlighted fret matches the quiz question
- Test the settings modal and all customization features

---

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
