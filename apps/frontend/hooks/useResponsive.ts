import { useEffect, useState } from 'react';

export const breakpoints = {
  mobile: 320,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
  ultrawide: 1536,
};

export type Breakpoint = keyof typeof breakpoints;

export const useResponsive = () => {
  const [screenSize, setScreenSize] = useState<Breakpoint>('desktop');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      
      if (width < breakpoints.tablet) {
        setScreenSize('mobile');
      } else if (width < breakpoints.desktop) {
        setScreenSize('tablet');
      } else if (width < breakpoints.wide) {
        setScreenSize('desktop');
      } else if (width < breakpoints.ultrawide) {
        setScreenSize('wide');
      } else {
        setScreenSize('ultrawide');
      }
    };

    // Set initial size
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    screenSize,
    isMobile: screenSize === 'mobile',
    isTablet: screenSize === 'tablet' || screenSize === 'mobile',
    isDesktop: screenSize === 'desktop' || screenSize === 'wide' || screenSize === 'ultrawide',
  };
};
