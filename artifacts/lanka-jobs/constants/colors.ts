/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: '#14213D',
    tint: '#176B87',

    // Core surfaces
    background: '#F7FAFC',
    foreground: '#14213D',

    // Cards / elevated surfaces
    card: '#FFFFFF',
    cardForeground: '#14213D',

    // Primary action color (buttons, links, active states)
    primary: '#176B87',
    primaryForeground: '#FFFFFF',

    // Secondary / less-emphasis interactive surfaces
    secondary: '#E7F2F4',
    secondaryForeground: '#176B87',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#EEF3F5',
    mutedForeground: '#657486',

    // Accent highlights (badges, selected items, focus rings)
    accent: '#F7E6C5',
    accentForeground: '#8B5E16',

    // Destructive actions (delete, error states)
    destructive: '#C94A4A',
    destructiveForeground: '#FFFFFF',

    // Borders and input outlines
    border: '#D9E3E8',
    input: '#D9E3E8',
  },

  // Border radius (in px). Sync from the sibling web artifact's --radius
  // CSS variable. This value applies to cards, buttons, inputs, and modals.
  radius: 16,
};

export default colors;
