export const GOOGLE_FONTS = {
  // Popular Google Fonts for logos/branding
  'Inter': { weights: [400, 700, 900], fallback: 'sans-serif' },
  'Montserrat': { weights: [400, 700, 900], fallback: 'sans-serif' },
  'Poppins': { weights: [400, 700, 900], fallback: 'sans-serif' },
  'Roboto': { weights: [400, 700, 900], fallback: 'sans-serif' },
  'Open Sans': { weights: [400, 700, 800], fallback: 'sans-serif' },
  'Playfair Display': { weights: [400, 700, 900], fallback: 'serif' },
  'Merriweather': { weights: [400, 700, 900], fallback: 'serif' },
  'Oswald': { weights: [400, 700], fallback: 'sans-serif' },
  'Raleway': { weights: [400, 700, 900], fallback: 'sans-serif' },
  'Lato': { weights: [400, 700, 900], fallback: 'sans-serif' },
} as const;

// Current active font selection - Change this to any font from GOOGLE_FONTS
export const LOGO_FONT = 'Montserrat';

export type GoogleFontName = keyof typeof GOOGLE_FONTS;