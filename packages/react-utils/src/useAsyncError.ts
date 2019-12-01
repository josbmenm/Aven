import { useState } from 'react';

export default function useAsyncError(onError?: any) {
  const [error, setError] = useState(null);
  if (error) {
    throw error;
  }
  function handler(promise: any) {
    return promise.catch((error: any) => {
      const handled = onError && onError(error);
      if (!handled) {
        setError(error);
      }
    });
  }
  return handler;
}
