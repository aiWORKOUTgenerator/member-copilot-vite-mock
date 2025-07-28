import React from 'react';

export const EnvironmentDebug: React.FC = () => {
  const envCheck = {
    hasProcessEnv: typeof process !== 'undefined' && !!process.env,
    hasImportMetaEnv: typeof import.meta !== 'undefined' && !!import.meta.env,
    processEnvApiKey: typeof process !== 'undefined' && process.env ? process.env.VITE_OPENAI_API_KEY : 'undefined',
    importMetaEnvApiKey: typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_OPENAI_API_KEY : 'undefined',
    apiKeyLength: typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_OPENAI_API_KEY 
      ? import.meta.env.VITE_OPENAI_API_KEY.length 
      : 0,
    isProduction: typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.MODE === 'production' : false
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: '#f0f0f0', 
      padding: '10px', 
      border: '1px solid #ccc',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <h4>Environment Debug</h4>
      <pre>{JSON.stringify(envCheck, null, 2)}</pre>
    </div>
  );
}; 