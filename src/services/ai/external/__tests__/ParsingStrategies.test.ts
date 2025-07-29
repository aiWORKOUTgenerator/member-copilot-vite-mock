import { StringJSONStrategy } from '../features/quick-workout-setup/workflow/parsing/strategies/StringJSONStrategy';
import { MarkdownExtractorStrategy } from '../features/quick-workout-setup/workflow/parsing/strategies/MarkdownExtractorStrategy';
import { GeneratedWorkout } from '../types/external-ai.types';

describe('Parsing Strategies', () => {
  describe('StringJSONStrategy', () => {
    let strategy: StringJSONStrategy;

    beforeEach(() => {
      strategy = new StringJSONStrategy();
    });

    it('should handle malformed JSON with unescaped quotes', async () => {
      const malformedJson = `{
        "id": "test_workout",
        "title": "Test Workout with "quotes" inside",
        "description": "A workout with problematic "quotes" that need escaping",
        "totalDuration": 1800,
        "estimatedCalories": 200,
        "difficulty": "some experience",
        "equipment": [],
        "warmup": {
          "duration": 300,
          "exercises": []
        },
        "mainWorkout": {
          "duration": 1200,
          "exercises": []
        },
        "cooldown": {
          "duration": 300,
          "exercises": []
        }
      }`;

      const result = await strategy.parse(malformedJson);
      
      expect(result).toBeDefined();
      expect(result.id).toBe('test_workout');
      expect(result.title).toContain('Test Workout');
    });

    it('should handle JSON with trailing commas', async () => {
      const jsonWithTrailingCommas = `{
        "id": "test_workout",
        "title": "Test Workout",
        "description": "A test workout",
        "totalDuration": 1800,
        "estimatedCalories": 200,
        "difficulty": "some experience",
        "equipment": [],
        "warmup": {
          "duration": 300,
          "exercises": [],
        },
        "mainWorkout": {
          "duration": 1200,
          "exercises": [],
        },
        "cooldown": {
          "duration": 300,
          "exercises": [],
        },
      }`;

      const result = await strategy.parse(jsonWithTrailingCommas);
      
      expect(result).toBeDefined();
      expect(result.id).toBe('test_workout');
    });

    it('should handle JSON with single quotes', async () => {
      const jsonWithSingleQuotes = `{
        'id': 'test_workout',
        'title': 'Test Workout',
        'description': 'A test workout',
        'totalDuration': 1800,
        'estimatedCalories': 200,
        'difficulty': 'some experience',
        'equipment': [],
        'warmup': {
          'duration': 300,
          'exercises': []
        },
        'mainWorkout': {
          'duration': 1200,
          'exercises': []
        },
        'cooldown': {
          'duration': 300,
          'exercises': []
        }
      }`;

      const result = await strategy.parse(jsonWithSingleQuotes);
      
      expect(result).toBeDefined();
      expect(result.id).toBe('test_workout');
    });
  });

  describe('MarkdownExtractorStrategy', () => {
    let strategy: MarkdownExtractorStrategy;

    beforeEach(() => {
      strategy = new MarkdownExtractorStrategy();
    });

    it('should extract and parse JSON from markdown code blocks', async () => {
      const markdownContent = `Here's your workout:

\`\`\`json
{
  "id": "test_workout",
  "title": "Test Workout",
  "description": "A test workout",
  "totalDuration": 1800,
  "estimatedCalories": 200,
  "difficulty": "some experience",
  "equipment": [],
  "warmup": {
    "duration": 300,
    "exercises": []
  },
  "mainWorkout": {
    "duration": 1200,
    "exercises": []
  },
  "cooldown": {
    "duration": 300,
    "exercises": []
  }
}
\`\`\`

Enjoy your workout!`;

      const result = await strategy.parse(markdownContent);
      
      expect(result).toBeDefined();
      expect(result.id).toBe('test_workout');
      expect(result.title).toBe('Test Workout');
    });

    it('should handle malformed JSON in markdown code blocks', async () => {
      const markdownWithMalformedJson = `Here's your workout:

\`\`\`json
{
  "id": "test_workout",
  "title": "Test Workout with "quotes"",
  "description": "A test workout",
  "totalDuration": 1800,
  "estimatedCalories": 200,
  "difficulty": "some experience",
  "equipment": [],
  "warmup": {
    "duration": 300,
    "exercises": [],
  },
  "mainWorkout": {
    "duration": 1200,
    "exercises": [],
  },
  "cooldown": {
    "duration": 300,
    "exercises": [],
  },
}
\`\`\`

Enjoy your workout!`;

      const result = await strategy.parse(markdownWithMalformedJson);
      
      expect(result).toBeDefined();
      expect(result.id).toBe('test_workout');
    });
  });
});