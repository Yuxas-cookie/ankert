# Ticket 02-03: Survey Builder UI Components

## Overview
Implement the core UI components for the survey builder interface, including drag-and-drop functionality, question configuration panels, and real-time preview capabilities.

## Goals
- Create an intuitive drag-and-drop survey builder interface
- Implement reusable question configuration components
- Build a responsive design that works across all device sizes
- Provide real-time feedback during survey construction

## Detailed Task Breakdown

### 1. Core Builder Components
- [ ] **SurveyBuilder** - Main container component
  - Layout with sidebar for question types and main canvas
  - State management for survey data
  - Integration with drag-and-drop context
- [ ] **QuestionTypesPanel** - Sidebar with available question types
  - Question type cards with icons and descriptions
  - Drag handles for question types
  - Search/filter functionality
- [ ] **SurveyCanvas** - Main building area
  - Drop zones for questions
  - Question ordering and reordering
  - Visual feedback for drag operations

### 2. Question Configuration Components
- [ ] **QuestionEditor** - Base question editing interface
  - Question title and description fields
  - Required/optional toggle
  - Delete and duplicate actions
- [ ] **MultipleChoiceEditor** - Configuration for multiple choice questions
  - Option management (add/remove/reorder)
  - Single vs multiple selection toggle
  - Other option configuration
- [ ] **TextInputEditor** - Configuration for text input questions
  - Input type selection (short text, long text, email, number)
  - Validation rules setup
  - Character limits configuration
- [ ] **RatingScaleEditor** - Configuration for rating questions
  - Scale range selection (1-5, 1-10, etc.)
  - Custom scale labels
  - Display style options (stars, numbers, emojis)

### 3. Drag and Drop Implementation
- [ ] **DragDropProvider** - Context provider for drag operations
  - Integration with @dnd-kit
  - Drag sensors configuration
  - Collision detection setup
- [ ] **DraggableQuestionType** - Draggable question type components
  - Drag overlay styling
  - Preview during drag
- [ ] **DroppableQuestion** - Drop targets for questions
  - Visual feedback for drop zones
  - Question insertion logic

### 4. Survey Structure Management
- [ ] **SurveyStructure** - Component for managing survey sections
  - Page breaks and sections
  - Question grouping
  - Logic flow visualization
- [ ] **QuestionList** - List view of all questions
  - Collapsible question items
  - Quick edit capabilities
  - Bulk actions (delete, duplicate, move)

### 5. UI Enhancement Components
- [ ] **ToolbarActions** - Builder toolbar
  - Save/auto-save functionality
  - Undo/redo operations
  - Preview toggle
  - Export options
- [ ] **QuestionCounter** - Progress indicator
  - Question count display
  - Completion percentage
  - Estimated completion time

## Completion Criteria

### Functional Requirements
- [ ] Users can drag question types from sidebar to canvas
- [ ] Questions can be reordered within the survey
- [ ] Each question type has appropriate configuration options
- [ ] Real-time validation of question settings
- [ ] Auto-save functionality works correctly
- [ ] Undo/redo operations function properly

### Technical Requirements
- [ ] All components are fully typed with TypeScript
- [ ] Proper error boundaries and error handling
- [ ] Responsive design works on mobile, tablet, and desktop
- [ ] Accessibility features (keyboard navigation, screen readers)
- [ ] Performance optimized for large surveys (100+ questions)

### UI/UX Requirements
- [ ] Intuitive drag-and-drop interactions
- [ ] Clear visual feedback during operations
- [ ] Consistent styling with design system
- [ ] Loading states for all async operations
- [ ] Confirmation dialogs for destructive actions

## Test Cases

### Unit Tests
```typescript
// Example test structure
describe('SurveyBuilder', () => {
  it('should render question types panel', () => {});
  it('should handle drag and drop operations', () => {});
  it('should validate question configurations', () => {});
  it('should auto-save changes', () => {});
});

describe('QuestionEditor', () => {
  it('should update question title', () => {});
  it('should toggle required status', () => {});
  it('should delete question with confirmation', () => {});
});

describe('MultipleChoiceEditor', () => {
  it('should add/remove options', () => {});
  it('should reorder options', () => {});
  it('should toggle selection type', () => {});
});
```

### Integration Tests
- [ ] Complete survey creation workflow
- [ ] Drag and drop between different sections
- [ ] Real-time preview updates
- [ ] Data persistence across page refreshes

### E2E Tests
- [ ] User can create a complete survey
- [ ] Survey builder works across different browsers
- [ ] Mobile drag-and-drop functionality
- [ ] Performance with large surveys

## Dependencies

### Internal Dependencies
- Ticket 02-01: Survey Creation API (for data persistence)
- Ticket 02-02: Survey Question Types (for question schemas)

### External Dependencies
- @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities
- @radix-ui components for modals, dropdowns, etc.
- react-hook-form for form management
- zod for validation schemas

### Database Requirements
- Survey schema from ticket 02-01
- Question types from ticket 02-02

## Technical Implementation Notes

### State Management
```typescript
interface SurveyBuilderState {
  survey: Survey;
  selectedQuestion: string | null;
  isDragging: boolean;
  history: Survey[];
  historyIndex: number;
}
```

### Drag and Drop Configuration
```typescript
const sensors = useSensors(
  useSensor(PointerSensor),
  useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  })
);
```

### Performance Considerations
- Implement virtualization for large question lists
- Use React.memo for question components
- Debounce auto-save operations
- Lazy load question type configurations

## File Structure
```
components/survey/builder/
├── SurveyBuilder.tsx
├── QuestionTypesPanel.tsx
├── SurveyCanvas.tsx
├── question-editors/
│   ├── QuestionEditor.tsx
│   ├── MultipleChoiceEditor.tsx
│   ├── TextInputEditor.tsx
│   └── RatingScaleEditor.tsx
├── drag-drop/
│   ├── DragDropProvider.tsx
│   ├── DraggableQuestionType.tsx
│   └── DroppableQuestion.tsx
└── toolbar/
    ├── ToolbarActions.tsx
    └── QuestionCounter.tsx
```

## References
- [dnd-kit Documentation](https://dndkit.com/)
- [Radix UI Components](https://www.radix-ui.com/)
- [React Hook Form](https://react-hook-form.com/)
- [Survey Builder UX Best Practices](https://www.nngroup.com/articles/survey-design/)