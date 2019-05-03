import { useState } from 'react';

export default function useAsyncError() {
  const [error, setError] = useState(null);
  if (error) {
    throw error;
  }
  function handler(promise) {
    return promise.catch(error => {
      setError(error);
    });
  }
  return handler;
}
