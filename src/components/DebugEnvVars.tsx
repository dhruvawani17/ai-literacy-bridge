'use client';

import { useEffect, useState } from 'react';

export default function DebugEnvVars() {
  const [envVars, setEnvVars] = useState<Record<string, string>>({});

  useEffect(() => {
    // Check which environment variables are available on the client side
    const clientEnvVars = {
      NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'NOT_FOUND',
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'NOT_FOUND',
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'NOT_FOUND',
      NODE_ENV: process.env.NODE_ENV || 'NOT_FOUND',
    };
    
    setEnvVars(clientEnvVars);
    console.log('Client-side environment variables:', clientEnvVars);
  }, []);

  return (
    <div className="fixed top-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded max-w-md z-50">
      <h3 className="font-bold mb-2">Debug: Environment Variables</h3>
      {Object.entries(envVars).map(([key, value]) => (
        <div key={key} className="text-xs mb-1">
          <strong>{key}:</strong> {value.length > 30 ? `${value.substring(0, 30)}...` : value}
        </div>
      ))}
    </div>
  );
}