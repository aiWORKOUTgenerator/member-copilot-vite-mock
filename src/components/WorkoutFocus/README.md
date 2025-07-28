# WorkoutFocus Directory

This directory contains the refactored WorkoutFocus page components, organized for better maintainability and future development.

## Structure

```
WorkoutFocus/
├── README.md                    # This documentation
├── index.ts                     # Main exports
├── WorkoutFocusPage.tsx         # Main page component
└── components/
    ├── WorkoutCard.tsx          # Reusable card component
    └── WorkoutSelectionCards.tsx # Container for all selection cards
```

## Components

### WorkoutFocusPage.tsx
The main page component that manages the view modes:
- `selection` - Shows workout type selection cards
- `quick` - Renders QuickWorkoutForm
- `detailed` - Renders DetailedWorkoutWizard
- `exrx` - ExRx exercise prescription (placeholder)
- `modality` - Workout modalities selection (placeholder)
- `variations` - Intelligent variations (placeholder)

### WorkoutCard.tsx
A reusable card component that can be used for any workout type card. Props include:
- `title` - Card title
- `description` - Card description
- `icon` - Lucide icon component
- `gradient` - Tailwind gradient classes
- `features` - Array of feature strings
- `badge` - Badge configuration object
- `onClick` - Click handler

### WorkoutSelectionCards.tsx
Container component that renders all workout selection cards. Currently includes:
- Quick Workout Setup
- Detailed Workout Focus
- ExRx - Exercise Prescription (Medical Grade)
- Workout Modalities (Activity Based)
- Intelligent Variations (AI-Powered)

## Adding New Cards

To add new workout type cards:

1. **Update WorkoutSelectionCards.tsx**:
   - Add a new card object to the `workoutCards` array
   - Add a new handler prop to the component interface
   - Add the handler to the props destructuring

2. **Update WorkoutFocusPage.tsx**:
   - Add a new handler function for the new card
   - Pass the handler to `WorkoutSelectionCards`

3. **Example for adding a "Custom Workout" card**:

```typescript
// In WorkoutSelectionCards.tsx
const workoutCards = [
  // ... existing cards
  {
    title: "Custom Workout",
    description: "Create your own workout from scratch.",
    icon: Settings,
    gradient: "from-orange-500 to-red-500",
    features: [
      "Complete control",
      "Custom exercises",
      "Personalized structure"
    ],
    badge: {
      text: "Expert",
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    onClick: onCustomWorkoutSelect
  }
];

// In WorkoutFocusPage.tsx
const handleCustomWorkoutSelect = () => {
  setViewMode('custom');
  if (onDataUpdate) {
    onDataUpdate(options, 'custom');
  }
};
```

## Benefits of This Structure

1. **Modularity**: Each component has a single responsibility
2. **Reusability**: WorkoutCard can be used for any workout type
3. **Maintainability**: Easy to add new cards without cluttering the main page
4. **Scalability**: Structure supports future enhancements
5. **Consistency**: All cards follow the same design pattern 