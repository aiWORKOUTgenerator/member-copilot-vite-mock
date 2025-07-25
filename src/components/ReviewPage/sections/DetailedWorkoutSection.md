# DetailedWorkoutSection Component

## Overview

The `DetailedWorkoutSection` component is a specialized section for displaying detailed workout configuration data in the ReviewPage. It follows the same patterns as the existing `WorkoutSection` but is specifically designed to handle the comprehensive data structure of detailed workout setups.

## Features

### Data Display Sections

1. **Training Structure**
   - Workout Focus
   - Duration
   - Equipment
   - Focus Areas

2. **Physical State Assessment**
   - Energy Level
   - Muscle Soreness
   - Sleep Duration
   - Stress Level

3. **Training Details**
   - Rest Periods
   - Intensity Preference
   - Include/Exclude Exercises

### Key Features

- **Flexible Data Formatting**: Handles both simple values and complex objects
- **Conditional Rendering**: Only shows sections when data is available
- **Consistent Styling**: Uses the same design patterns as other ReviewPage sections
- **Comprehensive Summary**: Provides a visual summary card with key metrics

## Usage

```tsx
import { DetailedWorkoutSection } from './sections/DetailedWorkoutSection';

<DetailedWorkoutSection 
  profileData={profileData}
  workoutFocusData={workoutFocusData}
/>
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `profileData` | `ProfileData` | User profile information |
| `workoutFocusData` | `PerWorkoutOptions` | Detailed workout configuration data |

## Data Formatting

The component includes helper functions to format various data types:

- `formatDuration()`: Handles both number and object duration formats
- `formatFocus()`: Displays workout focus from string or object
- `formatEnergyLevel()`: Shows energy level with rating
- `formatSoreness()`: Formats soreness areas with intensity levels
- `formatEquipment()`: Lists selected equipment
- `formatFocusAreas()`: Shows target focus areas
- `formatRestPeriods()`: Maps rest period values to readable text
- `formatSleepQuality()`: Displays sleep duration
- `formatStressLevel()`: Shows stress level with rating

## Integration with ReviewPage

The ReviewPage component automatically chooses between `WorkoutSection` and `DetailedWorkoutSection` based on the `workoutType` prop:

```tsx
{workoutType === 'detailed' ? (
  <DetailedWorkoutSection 
    profileData={profileData}
    workoutFocusData={workoutFocusData}
  />
) : (
  <WorkoutSection 
    profileData={profileData}
    displayWorkoutFocus={displayWorkoutFocus}
  />
)}
```

## Styling

The component uses:
- Tailwind CSS classes for styling
- Lucide React icons for visual elements
- Gradient backgrounds for section headers
- Consistent spacing and typography

## Accessibility

- Proper semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Screen reader friendly content

## Future Enhancements

- Add data validation indicators
- Include progress tracking
- Add edit functionality for individual sections
- Support for custom themes 