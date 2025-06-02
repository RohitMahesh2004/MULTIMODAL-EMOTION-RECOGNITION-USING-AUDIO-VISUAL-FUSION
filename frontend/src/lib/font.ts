import { Orbitron } from 'next/font/google';
import { Roboto } from 'next/font/google';

export const orbitron = Orbitron({
  subsets: ['latin'],
  weight: '700',
});

export const roboto = Roboto({
    subsets: ['latin'],
    weight: ['400'], // or add '300', '500', etc. if needed
  });
  
