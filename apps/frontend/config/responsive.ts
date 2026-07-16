/**
 * Responsive Design Configuration
 * This ensures consistent sizing and spacing across all devices
 */

export const responsiveConfig = {
  // Font sizes that adapt to screen size
  fontSize: {
    heading1: 'text-3xl sm:text-4xl lg:text-5xl xl:text-6xl', // Hero main title
    heading2: 'text-2xl sm:text-3xl lg:text-4xl', // Section title
    heading3: 'text-xl sm:text-2xl lg:text-3xl', // Subsection title
    body: 'text-base sm:text-base lg:text-lg', // Body text
    small: 'text-sm sm:text-sm lg:text-base', // Small text
    tiny: 'text-xs sm:text-xs lg:text-sm', // Tiny text
  },

  // Spacing that adapts to screen size
  spacing: {
    containerPadding: 'px-4 sm:px-6 lg:px-8 xl:px-12',
    sectionPadding: 'py-8 sm:py-12 lg:py-16 xl:py-20',
    gapSmall: 'gap-3 sm:gap-4 lg:gap-6',
    gapMedium: 'gap-4 sm:gap-6 lg:gap-8',
    gapLarge: 'gap-6 sm:gap-8 lg:gap-12',
  },

  // Grid layouts for different sections
  grid: {
    features: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3',
    testimonials: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    cards: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    twoColumn: 'grid-cols-1 lg:grid-cols-2',
    threeColumn: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  },

  // Common container widths
  maxWidth: {
    full: 'max-w-full',
    container: 'max-w-6xl',
    wide: 'max-w-7xl',
    ultrawide: 'max-w-8xl',
  },

  // Icon sizes
  icon: {
    small: 'w-5 h-5 sm:w-6 sm:h-6',
    medium: 'w-6 h-6 sm:w-8 sm:h-8',
    large: 'w-8 h-8 sm:w-10 sm:h-10',
    xlarge: 'w-10 h-10 sm:w-12 sm:h-12',
  },

  // Common breakpoint values (in pixels)
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  },
};

/**
 * Helper function to combine responsive classes
 */
export const combineResponsive = (...classes: (string | undefined)[]): string => {
  return classes.filter(Boolean).join(' ');
};
