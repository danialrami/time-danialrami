# ⏳ TIME – A Temporal Mandala Clock

**TIME** is an interactive, meditative visualization of time using concentric rings that represent different temporal scales. It displays time simultaneously across milliseconds, seconds, minutes, hours, days, weeks, months, quarters, halves, and years—all rendered as animated circular arcs with a flowing ROYGBIV spectral color scheme. ✨

## ✨ Features

### 🔄 Dual View Modes
- **Year View** (default): Displays a 24-hour clock integrated with annual cycles, showing all temporal rings in vibrant spectral colors
- **Day View**: A clean, meditative 12-hour clock layout with minimalist white aesthetics and traditional clock proportions

### 🎨 Temporal Visualization
- **Concentric Rings**: Each ring represents a different time scale (milliseconds through years)
- **Real-time Animation**: Smooth, continuous progress indicators show your position within each temporal cycle
- **Spectral Colors**: Year View uses a flowing rainbow palette (red → orange → yellow → green → cyan → blue → purple)
- **Position Indicators**: Animated dots with connecting lines mark your exact position on each ring

### 🔐 Temporal Code
Custom temporal encoding format: `Y25-H1-Q2-M06-W26-D1` (Year-Half-Quarter-Month-Week-Day)

### 📊 Display Information
- Current timezone detection 🌍
- Conventional date and time (YYYY-MM-DD HH:MM:SS AM/PM)
- Temporal code in custom notation

### 🎭 Visual Design
- Dark theme with cosmic background (geometric network patterns and pulsing nodes)
- Smooth transitions between view modes (1-second cubic easing)
- Responsive layout adapts to all screen sizes
- Soft glows and text shadows for refined aesthetics

## 🚀 Usage

1. Open `index.html` in a web browser
2. Click **Year View** or **Day View** buttons to toggle between modes
3. Watch the rings animate in real-time as seconds, minutes, hours, and longer cycles progress

## 🏗️ Technical Architecture

### 🧩 Classes

**TemporalEngine** (`script.js:2-165`)
- Calculates temporal positions for all time scales
- Generates custom temporal codes
- Formats conventional time (12-hour format)
- Detects user timezone

**ColorSystem** (`script.js:167-248`)
- Manages LUFS color palette (teal, red, yellow, blue, white, black)
- Provides spectral colors for each temporal ring
- Handles color transitions between view modes
- Supports HSL color space with dynamic intensity

**AnimationController** (`script.js:250-349`)
- Manages view transitions with easing functions
- Tracks scale and rotation state
- Controls ring sizing for Day View
- Handles smooth 1-second transitions

**RenderingEngine** (`script.js:351-758`)
- Handles all canvas rendering
- Manages ring labels and positioning
- Draws cosmic background with constellation patterns
- Updates labels based on view mode
- Renders temporal rings with progress indicators

### 🧮 Key Algorithms

- **ISO Week Calculation** (`getISOWeekNumber`): Accurate ISO 8601 week numbering
- **Leap Year Detection**: Properly handles leap years for day-in-year calculations
- **Smooth Transforms**: Cubic easing for smooth view transitions
- **Device Pixel Scaling**: Crisp rendering on high-DPI displays

## 📁 File Structure

```
time-danialrami/
├── index.html       # HTML structure with canvas and controls
├── script.js        # Main application logic (4 core classes)
├── styling.css      # Styling and animations
├── favicon.svg      # Temporal Mandala icon
└── LICENSE          # Project license
```

## 🎨 Code Style

- **JavaScript**: Classes in PascalCase; methods, constants in camelCase/UPPER_SNAKE_CASE
- **CSS**: BEM-inspired naming (`.ring-label`, `.control-btn`, `.day-view`)
- **HTML**: Semantic structure with data attributes for JavaScript targeting
- **Colors**: LUFS palette (#78BEBA teal, #2069af blue, #E7B225 yellow) + spectral HSL colors

## 📦 Dependencies

None—vanilla JavaScript using only native Browser APIs:
- Canvas 2D API for rendering
- `Date` and `Intl` for time calculations
- `requestAnimationFrame` for animation loop
- `performance.now()` for precise timing

## 🌐 Browser Compatibility

Works on all modern browsers supporting:
- Canvas 2D
- `Intl.DateTimeFormat()`
- `requestAnimationFrame`

## 🎯 Getting Started

```bash
# Clone or download the project
cd time-danialrami

# Open in browser (no build step required)
open index.html
```

---

Enjoy visualizing the flow of time! 🌀✨🕐
