# Moon Calendar

A React, Vite, and Three.js moon phase calendar with an interactive 3D moon, local lunar calculations, an illumination chart, animated calendar UI, and responsive layout.

## Features

- Interactive NASA-textured 3D moon with drag rotation, wheel zoom, and keyboard controls
- Local NASA SVS-style moon color, displacement, and starfield textures
- Optional high-accuracy ephemeris mode powered by Astronomy Engine
- Approximate sun/moon longitude calculations available as a fast fallback
- Monthly calendar with mini moon canvases
- Direct month dropdown and year stepper/input controls
- Illumination percentage, lunar age, cycle progress, and waxing/waning data
- Monthly illumination trend chart using Recharts
- Motion-aware UI with reduced-motion handling
- Accessible labels and visible keyboard focus states
- Responsive mobile layout

## Keyboard Controls

- Left arrow: previous day
- Right arrow: next day
- T: today
- Focus the 3D moon, then use arrow keys to rotate it
- Focus the 3D moon, then use plus/minus to zoom
- Focus the 3D moon, then use Home to reset the view

## Tech Stack

- React
- Vite
- Three.js
- Astronomy Engine
- Framer Motion
- Recharts
- Lucide React
- CSS
- Node test runner

## Folder Structure

```txt
selenarium-advanced/
├── public/
├── src/
│   ├── components/
│   │   ├── CalendarGrid.jsx
│   │   ├── IlluminationChart.jsx
│   │   ├── MiniMoon.jsx
│   │   ├── MonthNavigator.jsx
│   │   ├── MoonScene.jsx
│   │   ├── PhasePanel.jsx
│   │   └── StarsBackground.jsx
│   ├── services/
│   │   ├── moonService.js
│   │   └── moonService.test.js
│   ├── styles/
│   │   └── global.css
│   ├── utils/
│   │   └── drawMiniMoon.js
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
└── README.md
```

## Run Locally

```bash
npm install
npm run dev
```

Open:

```txt
http://localhost:5173
```

## Test

```bash
npm test
```

## Build

```bash
npm run build
```

## Deploy on Vercel

1. Upload this folder to GitHub.
2. Open Vercel.
3. Import your GitHub repository.
4. Set build command:

```bash
npm run build
```

5. Set output directory:

```txt
dist
```

6. Deploy.

## Future Upgrades

- Add optional location-based moonrise and moonset
- Add PWA offline support
- Add screenshot/export button
- Add an optional high-accuracy astronomy engine for ephemeris-grade data
