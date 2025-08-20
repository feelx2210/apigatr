import { LOGO_FONT, GOOGLE_FONTS, type GoogleFontName } from '@/config/fonts';

export const useLogoFont = () => {
  const getFontClass = () => {
    const fontName = LOGO_FONT.toLowerCase().replace(/\s+/g, '-');
    return `font-${fontName}`;
  };

  return {
    fontClass: getFontClass(),
    currentFont: LOGO_FONT,
    availableFonts: Object.keys(GOOGLE_FONTS) as GoogleFontName[],
  };
};