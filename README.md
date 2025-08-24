# Kichwa Learning App

A Duolingo-like mobile application for learning Kichwa (Quechua) from Ecuador, built with React Native and Expo.

## Features

### 🎯 Core Learning Features

- **Flashcards**: Interactive card-based learning with flip animations
- **Multiple Choice Quiz**: Test your knowledge with randomized questions
- **Category-based Learning**: Organized vocabulary by topics (Numbers, Colors, Family, etc.)
- **Progress Tracking**: Monitor your learning journey with statistics

### 📱 User Experience

- **Beautiful UI**: Modern design with gradients and smooth animations
- **Intuitive Navigation**: Tab-based navigation with clear sections
- **Responsive Design**: Works on both iOS and Android
- **Offline Support**: All vocabulary data is bundled with the app

### 📊 Progress System

- **Word Count Tracking**: See how many words you've learned
- **Streak Counter**: Maintain daily learning streaks
- **Category Progress**: Track completion for each vocabulary category
- **Achievements**: Unlock badges for learning milestones

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS) or Android Emulator (for Android)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd rimanashun
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm start
   ```

4. **Run on device/simulator**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your phone

## Project Structure

```
rimanashun/
├── src/
│   ├── components/          # Reusable UI components
│   ├── screens/            # Main app screens
│   │   ├── HomeScreen.tsx
│   │   ├── FlashcardScreen.tsx
│   │   ├── QuizScreen.tsx
│   │   ├── CategoriesScreen.tsx
│   │   └── ProgressScreen.tsx
│   ├── data/               # Data and categories
│   │   └── categories.ts
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts
│   └── utils/              # Utility functions
│       └── dataLoader.ts
├── assets/
│   ├── data.json           # Kichwa vocabulary data (~3,000 words)
│   ├── icon.png            # App icon
│   ├── splash-icon.png     # Splash screen icon
│   └── favicon.png         # Favicon
├── App.tsx                 # Main app component with navigation
├── tsconfig.json           # TypeScript configuration
├── package.json            # Dependencies and scripts
└── app.json               # Expo configuration
```

## Vocabulary Data

The app includes a comprehensive Kichwa-Spanish dictionary with:

- **~3,000 vocabulary entries**
- **10 organized categories**:
  - Numbers (shuk, ishkay, kimsa, etc.)
  - Colors (yurak, yana, puka, etc.)
  - Family (mama, tayta, wawa, etc.)
  - Food & Drinks (mikuna, yaku, tanta, etc.)
  - Animals (allku, kuchi, wakra, etc.)
  - Body Parts (uma, ñawi, rinri, etc.)
  - Nature (allpa, mayu, kucha, etc.)
  - House & Objects (wasi, uku, mesa, etc.)
  - Actions (rina, shamuna, rikuna, etc.)
  - Greetings (alli puncha, alli chishi, etc.)

## Learning Features

### Flashcards

- Tap to flip cards and reveal translations
- Swipe left/right or use buttons to mark words as known/unknown
- Progress tracking with visual feedback
- Support for category-specific practice

### Quiz Mode

- Multiple choice questions with 4 options
- Random question types (Kichwa→Spanish or Spanish→Kichwa)
- Immediate feedback with correct/incorrect animations
- Score tracking and completion results

### Categories

- Browse vocabulary by topic
- See word counts for each category
- Quick access to flashcards and quizzes per category
- Visual progress indicators

### Progress Tracking

- Overall learning statistics
- Daily streak maintenance
- Category completion tracking
- Achievement system

## Technology Stack

- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and build tools
- **TypeScript**: Type-safe JavaScript
- **React Navigation**: Navigation between screens
- **Expo Linear Gradient**: Beautiful gradient backgrounds
- **Ionicons**: Icon library

## Development

### Adding New Features

1. Create new components in `src/components/`
2. Add new screens in `src/screens/`
3. Update navigation in `App.tsx`
4. Add types in `src/types/index.ts`

### Data Management

- Vocabulary data is stored in `assets/data.json` (~3,000 Kichwa-Spanish word pairs)
- Categories are defined in `src/data/categories.ts`
- Data loading utilities are in `src/utils/dataLoader.ts`

### Styling

- Uses React Native StyleSheet for styling
- Consistent color scheme and spacing
- Responsive design patterns

## Future Enhancements

### Planned Features

- **Audio Pronunciation**: Add sound for Kichwa words
- **Spaced Repetition**: Smart review scheduling
- **User Accounts**: Save progress across devices
- **Social Features**: Share achievements and compete with friends
- **Advanced Quizzes**: Sentence completion, fill-in-the-blank
- **Offline Mode**: Download vocabulary for offline use

### Technical Improvements

- **State Management**: Add Redux or Context API for better state management
- **Persistence**: Implement AsyncStorage for saving progress
- **Analytics**: Track user learning patterns
- **Accessibility**: Improve screen reader support

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Kichwa vocabulary data compiled from various sources
- Inspired by Duolingo's learning methodology
- Built with love for preserving and promoting Kichwa language

## Support

For support, email [your-email] or create an issue in the repository.

---

**¡Alli puncha!** (Good day!) - Start your Kichwa learning journey today! 🌟
