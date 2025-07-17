import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parser: tseslint.parser,
      parserOptions: {
        project: ['./tsconfig.json', './tsconfig.node.json'],
        tsconfigRootDir: process.cwd(),
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // Base rules
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // TypeScript safety
      '@typescript-eslint/no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      
      // Code organization
      'prefer-const': 'error',
      'no-var': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      
      // FILE SIZE RULES - More realistic for fitness app
      'max-lines': ['warn', { 
        max: 300, 
        skipBlankLines: true, 
        skipComments: true 
      }],
      
      // FUNCTION SIZE - More appropriate for React components
      'max-lines-per-function': ['warn', { 
        max: 120,  // Increased from 60 - allows for complex form logic
        skipBlankLines: true, 
        skipComments: true 
      }],
      
      // COMPLEXITY - Focus on algorithmic complexity, not line count
      'complexity': ['error', 20], // This is more important than line count
      'max-depth': ['error', 4],
      'max-params': ['warn', 6],   // Form components may need more params
      
      // Magic numbers - fitness app appropriate
      'no-magic-numbers': ['warn', { 
        ignore: [0, 1, -1, 2, 3, 4, 5, 7, 10, 30, 60, 365], // Common fitness values
        ignoreArrayIndexes: true,
        ignoreDefaultValues: true
      }]
    },
  },
  
  // FORM COMPONENTS - Most lenient because they're naturally complex
  {
    files: [
      'src/components/**/Section*.{ts,tsx}',
      'src/components/**/Form*.{ts,tsx}',
      'src/components/Profile/**/*.{ts,tsx}',
      'src/components/WorkoutFocus*.{ts,tsx}',
      'src/components/quickWorkout/**/*.{ts,tsx}'
    ],
    rules: {
      'max-lines': ['warn', { max: 350, skipBlankLines: true }],
      'max-lines-per-function': ['warn', { 
        max: 150,  // Form sections can be legitimately long
        skipBlankLines: true 
      }],
      'complexity': ['warn', 25], // Form logic can be complex
      'max-params': 'off' // Form components often need many props
    }
  },
  
  // CUSTOMIZATION COMPONENTS - Moderate limits
  {
    files: [
      'src/components/customization/**/*.{ts,tsx}',
      'src/components/**/Customization*.{ts,tsx}'
    ],
    rules: {
      'max-lines': ['warn', { max: 250, skipBlankLines: true }],
      'max-lines-per-function': ['warn', { max: 100 }],
      'complexity': ['warn', 18]
    }
  },
  
  // SIMPLE COMPONENTS - Stricter limits
  {
    files: [
      'src/components/**/Button*.{ts,tsx}',
      'src/components/**/Input*.{ts,tsx}',
      'src/components/**/Card*.{ts,tsx}',
      'src/components/shared/small-components/**/*.{ts,tsx}'
    ],
    rules: {
      'max-lines': ['error', { max: 100, skipBlankLines: true }],
      'max-lines-per-function': ['error', { max: 50 }],
      'complexity': ['error', 8]
    }
  },
  
  // CONTAINER COMPONENTS - Focus on simplicity
  {
    files: [
      'src/components/**/Container*.{ts,tsx}',
      'src/components/**/Layout*.{ts,tsx}',
      'src/components/**/Wrapper*.{ts,tsx}'
    ],
    rules: {
      'max-lines': ['error', { max: 200, skipBlankLines: true }],
      'max-lines-per-function': ['warn', { max: 80 }],
      'complexity': ['error', 12] // Containers should orchestrate, not compute
    }
  },
  
  // CONFIGURATION FILES - Very lenient
  {
    files: ['src/config/**/*.{ts,tsx}', '**/config*.{ts,tsx}'],
    rules: {
      'max-lines': ['warn', { max: 600, skipBlankLines: true }],
      'max-lines-per-function': 'off',
      'complexity': 'off',
      'no-magic-numbers': 'off'
    }
  },
  
  // TYPE DEFINITION FILES
  {
    files: ['src/types/**/*.{ts,tsx}', '**/*.types.{ts,tsx}'],
    rules: {
      'max-lines': ['warn', { max: 500, skipBlankLines: true }],
      'max-lines-per-function': 'off',
      '@typescript-eslint/no-explicit-any': 'off'
    }
  },
  
  // UTILITIES - Keep focused
  {
    files: ['src/utils/**/*.{ts,tsx}', 'src/lib/**/*.{ts,tsx}'],
    rules: {
      'max-lines': ['error', { max: 200, skipBlankLines: true }],
      'max-lines-per-function': ['error', { max: 80 }],
      'complexity': ['error', 15]
    }
  }
);
