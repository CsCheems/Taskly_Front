'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Splash from '@/components/Splash';
const Home = dynamic(() => import('@/components/Home'), {
  ssr: false,
});

export default function Page() {
  const [isLoading, setIsLoading] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const initialLoadTimer = setTimeout(() => {
      setIsFadingOut(true);

      const fadeOutTimer = setTimeout(() => {

        setIsLoading(false);
      }, 500); 

    
      return () => clearTimeout(fadeOutTimer);
    }, 1500); 

    return () => clearTimeout(initialLoadTimer);
  }, []);

  return (
    <main>
      {isLoading ? <Splash isFadingOut={isFadingOut} /> : <Home />}
    </main>
  );
}
