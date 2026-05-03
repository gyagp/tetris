# Tetris

A modern Tetris game built with Next.js and React, featuring single-player and two-player modes with mobile touch support.

## Features

- Classic Tetris gameplay with scoring and levels
- Two-player local multiplayer (split keyboard)
- Mobile-friendly touch controls
- High score persistence via localStorage
- Next piece preview
- Pause and restart support

## Controls

### Keyboard (Single Player)

| Action       | Key          |
|-------------|-------------|
| Move Left   | Arrow Left  |
| Move Right  | Arrow Right |
| Soft Drop   | Arrow Down  |
| Rotate CW   | Arrow Up    |
| Rotate CCW  | Z           |
| Hard Drop   | Space        |
| Pause       | P           |

### Keyboard (Two-Player)

| Action       | Player 1     | Player 2 |
|-------------|-------------|----------|
| Move Left   | Arrow Left  | A        |
| Move Right  | Arrow Right | D        |
| Soft Drop   | Arrow Down  | S        |
| Rotate CW   | Arrow Up    | E        |
| Hard Drop   | Space        | Shift    |
| Pause       | P           | O        |

### Touch Controls (Mobile)

| Action     | Gesture    |
|-----------|-----------|
| Move Left | Swipe Left |
| Move Right| Swipe Right|
| Soft Drop | Swipe Down |
| Hard Drop | Swipe Up   |
| Rotate    | Tap        |

## Getting Started

### Prerequisites

- Node.js 18+

### Install Dependencies

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

### Run Tests

```bash
npm test
```

### Lint

```bash
npm run lint
```