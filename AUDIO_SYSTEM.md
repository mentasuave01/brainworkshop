# Audio System

The Brain Workshop audio system uses the Web Speech API for text-to-speech, with visual fallbacks.

## How It Works

1. **Text-to-Speech**: Uses `SpeechSynthesis` API to speak letters, numbers, and operations
2. **Visual Display**: Shows the current sound/letter on screen (yellow text in center)
3. **Automatic Fallback**: If speech synthesis fails, the app automatically falls back to beep sounds
4. **Voice Loading**: Waits for browser voices to load and prefers English voices
5. **Speech Queue**: Prevents overlapping speech by queuing utterances

## Browser Compatibility

The Web Speech API is supported in:
- ✅ Chrome/Edge (excellent support)
- ✅ Safari (good support)
- ⚠️ Firefox (limited support, may use fallback beeps)

## Fallback Behavior

If speech synthesis fails or is not supported:
- The app will automatically switch to **beep sounds** for the current session
- You'll see a console warning: `"Speech synthesis failed, falling back to beeps"`
- The game will still be fully playable with audio feedback via beeps

## Troubleshooting

### No Sound at All?
- Check your browser volume settings
- Make sure your system volume is not muted
- Try refreshing the page

### Speech Synthesis Not Working?
- The app will automatically fall back to beeps
- Beeps provide audio cues for each trial
- The game remains fully functional

### Want to Disable Audio?
Currently audio is always enabled, but you can mute:
- Your browser tab
- System volume
- Or modify `audioSystem.setEnabled(false)` in the code

## Technical Details

The audio system:
- Speaks letters: C, H, K, L, Q, R, S, T
- Speaks numbers: 0-13
- Speaks NATO alphabet words
- Speaks arithmetic operations
- Plays beeps for feedback (success/error)
- Has a 200ms beep duration for fallback mode

All audio is generated in real-time, no audio files needed!
