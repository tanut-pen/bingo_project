# Role & Context
You are an expert Frontend Developer and UI/UX Designer specializing in gamified web applications. 
We are building a web-based "Celebrity Bingo" board game helper. 

# Core Objective
Create a Single Page Application (SPA) using React, Tailwind CSS, and Lucide React icons. 
The app must allow users to upload or load a pre-defined list of categories/items (like "Chef names", "Bald people", "Thai citizens") from a CSV or JSON file, and then use that data to play a Bingo game.

# Tech Stack & Guidelines
- Framework: React (with Vite or Next.js Client Components)
- Styling: Tailwind CSS
- State Management: React useState / useMemo
- Theme: Board Game Aesthetic (Warm tones, playful typography, card-like containers, clear borders, tactile buttons, sound-effect-like visual feedback).

# Key Features & Requirements

## 1. Data Ingestion
- Support uploading a CSV or JSON file.
- Provide a "Use Default Data" button that pre-loads the following 20 sample categories:
  ["คนที่มีบริษัทเป็นของตัวเอง", "พิธีกรรายการทีวี", "ชื่อตัวเอง", "คนที่ผมยาวเกินไหล่", "ชื่อตัวร้าย", "ชื่อเชฟ", "ตัวละครในหนังผี", "บุคคลที่อยู่ในหนังสือเรียน", "ชื่อตัวการตูนที่เป็นชื่อเดียวกับชื่อเรื่อง", "ตัวละครที่มีรอยแผลเป็น", "คนที่เคยเดินทางไปต่างประเทศอย่างน้อยสองคครั้ง", "คนไทย", "หัวโล้น", "ตัวละครที่มีหนังเกินสามภาค", "ชื่อผี", "นักแสดงชาวอังกฤษ", "คนจีน", "คน หรือ ตัวละครที่ใส่เครื่องแบบ", "ใส่แว่น", "นักกีฬา"]

## 2. Dashboard UI (Split into 2 Main Modes)

### Mode A: Host Screen (The "Caller")
- A large, prominent "Random Spin" button with a playful, arcade-like animation.
- A "Current Item" display area showing the drawn category in giant text.
- A "History Log" sidebar showing previously drawn categories so the host can verify.

### Mode B: Player Screen (The "Bingo Card Generator")
- A 4x4 or 5x5 Grid Board representing the Bingo card.
- A "Generate New Board" button that shuffles the loaded data and populates the grid randomly.
- Interactivity: Clicking a grid cell toggles its state (Changes background color to indicate it is "Marked" or "Stamped" with a board game token style).

## 3. UI/UX & Board Game Vibe
- Use a color palette like Amber, Emerald, and Slate (`bg-amber-50` for background, `bg-amber-100` for cards, `border-amber-800` for thick board-game-style borders).
- Use `shadow-md` and active states like `active:translate-y-1 active:shadow-sm` to give buttons a physical, clickable feel.
- Ensure proper responsive layout (Grid scales down nicely on mobile phones).

# Code Quality Rules
- Write clean, modular components.
- Include JSDoc comments for complex logic (e.g., shuffling algorithm).
- Add developer-friendly English comments explaining state management transitions.
- Ensure absolute zero data mutation during arrays shuffling (Use pure functions).