import React from 'react';

export default function useTimeSeconds() {
  const [t, setT] = React.useState(Math.floor(Date.now() / 1000));
  React.useEffect(() => {
    const interval = setInterval(() => {
      setT(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);
  return t;
}
