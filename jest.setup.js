// Mock import.meta
global.import = {
  meta: {
    env: {
      VITE_OPENAI_API_KEY: 'test-api-key',
      VITE_OPENAI_MODEL: 'gpt-3.5-turbo',
      VITE_OPENAI_MAX_TOKENS: '1000',
      VITE_OPENAI_TEMPERATURE: '0.7',
      VITE_OPENAI_BASE_URL: 'https://api.openai.com/v1'
    }
  }
};

// Mock process.env
process.env = {
  ...process.env,
  NODE_ENV: 'test',
  VITE_OPENAI_API_KEY: 'test-api-key',
  VITE_OPENAI_MODEL: 'gpt-3.5-turbo',
  VITE_OPENAI_MAX_TOKENS: '1000',
  VITE_OPENAI_TEMPERATURE: '0.7',
  VITE_OPENAI_BASE_URL: 'https://api.openai.com/v1'
}; 