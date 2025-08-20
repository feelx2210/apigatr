# APIGATR Logo Font Customization

## How to Change the Logo Font

1. Open `src/config/fonts.ts`
2. Change the `LOGO_FONT` constant to any font from the `GOOGLE_FONTS` object
3. Save the file and the logo will automatically update

## Available Fonts

- **Inter** (modern, clean)
- **Montserrat** (geometric, friendly) - *Currently Active*
- **Poppins** (rounded, approachable)
- **Roboto** (neutral, readable)
- **Open Sans** (humanist, versatile)
- **Playfair Display** (elegant, serif)
- **Merriweather** (readable serif)
- **Oswald** (condensed, strong)
- **Raleway** (sophisticated)
- **Lato** (warm, friendly)

## Quick Change Examples

To change to a different font, simply update the `LOGO_FONT` value in `src/config/fonts.ts`:

```typescript
// For a modern, clean look
export const LOGO_FONT = 'Inter';

// For an elegant, serif style
export const LOGO_FONT = 'Playfair Display';

// For a bold, condensed appearance
export const LOGO_FONT = 'Oswald';
```

## Adding New Google Fonts

If you want to add additional Google Fonts:

1. **Add to Configuration**: Update `GOOGLE_FONTS` in `src/config/fonts.ts`
   ```typescript
   'Your Font Name': { weights: [400, 700], fallback: 'sans-serif' },
   ```

2. **Add to HTML**: Update the Google Fonts URL in `index.html`
   ```html
   &family=Your+Font+Name:wght@400;700
   ```

3. **Add to Tailwind**: Add the font family to `tailwind.config.ts`
   ```typescript
   'your-font': ['Your Font Name', 'sans-serif'],
   ```

## Font Performance

All fonts are loaded with `font-display: swap` for optimal performance. The fonts are preconnected to Google Fonts for faster loading.

## Current Implementation

The font system uses:
- **Configuration**: `src/config/fonts.ts` - Central font management
- **Hook**: `src/hooks/use-logo-font.ts` - React hook for font utilities
- **Component**: `src/components/Header.tsx` - Implementation in the header
- **Styling**: `tailwind.config.ts` - Tailwind font families
- **Loading**: `index.html` - Google Fonts import