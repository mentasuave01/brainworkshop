# Brain Workshop - TypeScript + Solid.js

A modern web-based port of Brain Workshop, an N-Back training application for cognitive enhancement. Built with TypeScript and Solid.js, this version runs entirely in the browser.

## Features

### Game Modes

- **Dual N-Back**: Match position and sound stimuli (default mode)
- **Triple N-Back**: Match position, color, and sound stimuli
- **Position N-Back**: Visual position matching only
- **Audio N-Back**: Audio sound matching only
- **Combination N-Back Modes**: Cross-modal matching with visual and auditory cues
- **Arithmetic N-Back**: Mathematical operations on n-back numbers

### Core Features

- **Adaptive Level Adjustment**: Automatically increases or decreases difficulty based on performance
- **Multiple Profiles**: Support for multiple user profiles with separate statistics
- **Statistics Tracking**: Track your progress with daily statistics and session history
- **Manual Mode**: Customize session parameters for experimentation
- **Jaeggi Mode**: Emulates the protocol from the original research study
- **Local Storage**: All data saved in browser localStorage (no server required)

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) installed on your system

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd brainworkshop

# Install dependencies
bun install

# Start development server
bun run dev
```

The application will be available at `http://localhost:3000`

### Building for Production

```bash
# Build the application
bun run build

# Preview the production build
bun run preview
```

## How to Play

### Controls

- **A**: Position matches n-back position
- **L**: Sound matches n-back sound
- **F**: Color matches n-back color (Triple N-Back only)
- **ESC**: Pause/Quit current session

### Gameplay

1. Select a game mode from the title screen
2. Press "Start Session" to begin
3. Watch and listen to each stimulus
4. Press the corresponding key when you recognize a match from N trials ago
5. Complete the session to see your score and progress

### Level Adjustment

- **Score ≥ 80%**: N-back level increases
- **Score 50-79%**: N-back level maintained
- **Three scores < 50%**: N-back level decreases

## Project Structure

```
brainworkshop/
├── src/
│   ├── components/        # UI components
│   │   ├── TitleScreen.tsx
│   │   ├── GameBoard.tsx
│   │   └── ResultScreen.tsx
│   ├── stores/            # Solid.js stores for state management
│   │   └── gameStore.ts
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/             # Utility functions
│   │   ├── gameEngine.ts  # Core game logic and n-back algorithm
│   │   └── audioSystem.ts # Audio/speech synthesis
│   ├── App.tsx            # Main application component
│   └── index.tsx          # Application entry point
├── public/                # Static assets
├── index.html             # HTML template
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Project dependencies
```

## Technical Details

### Technologies Used

- **TypeScript**: Type-safe development
- **Solid.js**: Reactive UI framework
- **Vite**: Fast development and build tool
- **Web Speech API**: Text-to-speech for audio cues
- **Web Audio API**: Sound effects and feedback
- **LocalStorage API**: Data persistence

### Key Algorithms

#### N-Back Trial Generation

The game generates random sequences with controlled match patterns:
- Standard mode: ~25% match probability per modality
- Jaeggi mode: Fixed 4 visual, 4 audio, 2 simultaneous matches
- Interference mode: Adds trick trials at n±1 positions

#### Scoring System

- **Standard**: Average of all modality scores
- **Jaeggi**: Minimum of position and sound scores
- Non-matches with no input are ignored (standard) or counted as correct (Jaeggi)

#### Adaptive Level Adjustment

Tracks performance across sessions with a "three strikes" system for decreases:
- Maintains strike count between sessions
- Resets on level increase or decrease
- Considers configurable thresholds

## Configuration

Default configuration can be modified in `src/types/index.ts`:

```typescript
export const DEFAULT_CONFIG: GameConfig = {
  trialsPerSession: 20,
  timePerTrial: 3000, // milliseconds
  increaseThreshold: 80, // percentage
  maintainThreshold: 50, // percentage
  decreaseStrikes: 3,
  // ... more options
};
```

## Future Enhancements

### Pending Features

- [ ] Statistics graph visualization
- [ ] Profile management UI (create/switch/delete profiles)
- [ ] Settings panel for configuration
- [ ] Manual mode controls (adjust n-back, trials, speed)
- [ ] Variable N-Back mode
- [ ] Crab Back mode
- [ ] Multi-stimulus mode
- [ ] Responsive design for mobile devices
- [ ] Export statistics to CSV
- [ ] Custom sound sets
- [ ] Background music between sessions

## Development

### Adding a New Game Mode

1. Add the mode to the `GameMode` type in `src/types/index.ts`
2. Add configuration to `GAME_MODE_CONFIGS`
3. Update `generateTrials()` in `src/utils/gameEngine.ts` to handle the new mode
4. Update `calculateSessionScore()` if needed
5. Add UI controls in `GameBoard.tsx` if new input methods are required

### State Management

The application uses Solid.js stores for reactive state management:
- `gameStore`: Current game state, session, trials
- `gameActions`: Actions to modify the game state

All state changes trigger reactive updates in the UI.

### Audio System

The audio system uses the Web Speech API for text-to-speech:
- Speaks letters, numbers, NATO phonetic alphabet
- Plays beep sounds for feedback
- Can be enabled/disabled

## Credits

This is a TypeScript + Solid.js port of the original [Brain Workshop](https://github.com/brain-workshop/brainworkshop) application.

The n-back task is based on research by Jaeggi et al. on working memory training.

## License

MIT License - feel free to use and modify as needed.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## Notes

- All data is stored in browser localStorage
- No server or backend required
- Works offline after initial load
- Compatible with modern browsers supporting Web Speech API
