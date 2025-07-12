// tailwind-theme-static.js

// This file contains pre-resolved static values for your Tailwind theme.
// It removes the need for a dynamic parser but requires manual updates
// if your source design tokens (JSON files) change.

module.exports = {
  colors: {
    // MAPPED.json -> ALIAS.json -> BRAND.json Color Resolutions
    text: {
      headings: '#292f33', // MAPPED.colour.Text.headings -> neutral.Default -> Colour.grey.900
      body: '#1c2124',     // MAPPED.colour.Text.body -> neutral.1000 -> Colour.grey.1000
      action: '#4CAF50',   // MAPPED.colour.Text.action -> Primary.default -> Colour.Green.600
      'action-hover': '#388E3C', // MAPPED.colour.Text.action-hover -> Primary.800 -> Colour.Green.800
      disabled: '#AAB2B8', // MAPPED.colour.Text.disabled -> neutral.400 -> Colour.grey.400
      information: '#2196F3', // MAPPED.colour.Text.information -> information.default -> Colour.blue.500
      success: '#4CAF50',   // MAPPED.colour.Text.success -> success.default -> Colour.Green.600
      warning: '#FFC107',   // MAPPED.colour.Text.warning -> warning.default -> Colour.amber.500
      error: '#F44336',     // MAPPED.colour.Text.error -> Error.default -> Colour.red.500
      'on-action': '#FFFFFF', // MAPPED.colour.Text.on-action -> neutral.white -> Colour.white
      'on-disabled': '#292f33', // MAPPED.colour.Text.on-disabled -> neutral.Default -> Colour.grey.900
      'body-white': '#f3faf3', // MAPPED.colour.Text.body white -> Primary.50 -> Colour.Green.50
    },
    surface: {
      page: '#FFFFFF', // MAPPED.colour.surface.page -> neutral.white -> Colour.white
      primary: '#4CAF50', // MAPPED.colour.surface.primary -> Primary.default -> Colour.Green.600
      'primary-subtle': '#f3faf3', // MAPPED.colour.surface.primary-subtle -> Primary.50 -> Colour.Green.50
      'primary-pressed': '#2e7d32', // MAPPED.colour.surface.primary-pressed -> Primary.800 -> Colour.Green.900
      secondary: '#2196F3', // MAPPED.colour.surface.secondary -> Secondary.default -> Colour.blue.500
      'secondary-subtle': '#e3f2fd', // MAPPED.colour.surface.secondary-subtle -> Secondary.50 -> Colour.blue.50
      'secondary-pressed': '#1976D2', // MAPPED.colour.surface.secondary-pressed -> Secondary.800 -> Colour.blue.700
      tertiary: '#FFC107', // MAPPED.colour.surface.tertiary -> Tertiary.default -> Colour.amber.500
      'tertiary-subtle': '#FFF3E0', // MAPPED.colour.surface.tertiary-subtle -> Tertiary.50 -> Colour.amber.50
      'tertiary-pressed': '#FFA000', // MAPPED.colour.surface.tertiary-pressed -> Tertiary.800 -> Colour.amber.800
      info: '#BBDEFB',     // MAPPED.colour.surface.info -> information.100 -> Colour.blue.100
      success: '#C8E6C9',   // MAPPED.colour.surface.success -> success.100 -> Colour.Green.200
      warning: '#FFECB3',   // MAPPED.colour.surface.warning -> warning.100 -> Colour.amber.100
      error: '#FFCDD2',     // MAPPED.colour.surface.error -> Error.100 -> Colour.red.100
      disabled: '#E0E0E0',  // MAPPED.colour.surface.disabled -> neutral.200 -> Colour.grey.200
      pressed: '#f7f8f8',   // MAPPED.colour.surface.pressed -> neutral.50 -> Colour.grey.50
    },
    icon: {
      primary: '#292f33',   // MAPPED.colour.icon.primary -> neutral.Default -> Colour.grey.900
      information: '#2196F3', // MAPPED.colour.icon.information -> information.default -> Colour.blue.500
      success: '#4CAF50',   // MAPPED.colour.icon.success -> success.default -> Colour.Green.600
      warning: '#FFC107',   // MAPPED.colour.icon.warning -> warning.default -> Colour.amber.500
      error: '#F44336',     // MAPPED.colour.icon.error -> Error.default -> Colour.red.500
    },
    border: {
      primary: '#1c2124',   // MAPPED.colour.border.primary -> neutral.1000 -> Colour.grey.1000
      'secondary-p': '#4CAF50', // MAPPED.colour.border.secondary P -> Primary.default -> Colour.Green.600
      information: '#2196F3', // MAPPED.colour.border.information -> information.default -> Colour.blue.500
      success: '#4CAF50',   // MAPPED.colour.border.success -> success.default -> Colour.Green.600
      error: '#F44336',     // MAPPED.colour.border.error -> Error.default -> Colour.red.500
      warning: '#FFC107',   // MAPPED.colour.border.warning -> warning.default -> Colour.amber.500
      disabled: '#AAB2B8',  // MAPPED.colour.border.disabled -> neutral.400 -> Colour.grey.400
    },
    // ALIAS.json Direct Color Palettes
    primary: { // From ALIAS.Primary -> Colour.Green scale
      50: '#f3faf3', 100: '#e6f4e6', 200: '#c8e6c9', 300: '#a5d6a7',
      400: '#81c784', 500: '#66bb6a', 600: '#4CAF50', 700: '#43A047',
      800: '#388E3C', 900: '#2E7D32', 1000: '#1B5E20',
      DEFAULT: '#4CAF50', // ALIAS.Primary.default -> Colour.Green.600
    },
    secondary: { // From ALIAS.Secondary -> Colour.blue scale
      50: '#e3f2fd', 100: '#bbdefb', 200: '#90caf9', 300: '#64b5f6',
      400: '#42a5f5', 500: '#2196F3', 600: '#1E88E5', 700: '#1976D2',
      800: '#1565C0', 900: '#0D47A1', 1000: '#002E76',
      DEFAULT: '#2196F3', // ALIAS.Secondary.default -> Colour.blue.500
    },
    neutral: { // From ALIAS.neutral -> Colour.grey scale
      50: '#f7f8f8', 100: '#edf0f0', 200: '#e0e4e4', 300: '#d1d6d6',
      400: '#aab2b8', 500: '#828e99', 600: '#5c6d7d', 700: '#475666',
      800: '#34404a', 900: '#292f33', 1000: '#1c2124',
      white: '#ffffff', // Assuming this is also a neutral color from BRAND.Colour.white
      DEFAULT: '#292f33', // ALIAS.neutral.Default -> Colour.grey.900
    },
    information: { DEFAULT: '#2196F3' }, // ALIAS.information.default -> Colour.blue.500
    success: { DEFAULT: '#4CAF50' },     // ALIAS.success.default -> Colour.Green.600
    warning: { DEFAULT: '#FFC107' },     // ALIAS.warning.default -> Colour.amber.500
    error: { DEFAULT: '#F44336' },       // ALIAS.Error.default -> Colour.red.500
  },
  spacing: { // From RESPONSIVE.spacing -> BRAND.scale
    '3xs': '0.125rem',  // scale.50
    '2xs': '0.25rem',   // scale.100
    'xs': '0.5rem',     // scale.200
    'sm': '0.75rem',    // scale.300
    'md': '1rem',       // scale.400
    'lg': '1.25rem',    // scale.500
    'xlg': '1.5rem',    // scale.600
    '2xlg': '1.75rem',  // scale.700
    '3xlg': '2rem',     // scale.800
    '4xlg': '2.5rem',   // scale.1000
    '5xlg': '3rem',     // scale.1200
    '6xlg': '4rem',     // scale.1600
    '7xlg': '5rem',     // scale.2000
    '8xlg': '6rem',     // scale.2400
  },
  borderWidth: { // From ALIAS['border width'] -> BRAND.scale
    'none': '0rem',    // scale.0
    'xs': '0.062rem',  // scale.25
    'md': '0.25rem',   // scale.100
    'lg': '0.375rem',  // scale.150
    'sm': '0.125rem',  // scale.50
    'x-lg': '0.5rem',  // scale.200
    'xxs': '0.031rem', // scale.15
    'DEFAULT': '0.25rem', // assuming ALIAS['border width'].default maps to scale.100
  },
  borderRadius: { // From ALIAS['border radius'] -> BRAND.scale
    'none': '0rem',    // scale.0
    'xs': '0.062rem',  // scale.25
    'md': '0.25rem',   // scale.100
    'lg': '0.375rem',  // scale.150
    'sm': '0.125rem',  // scale.50
    'x-lg': '0.5rem',  // scale.200
    'xxs': '0.031rem', // scale.15
    'DEFAULT': '0.25rem', // assuming ALIAS['border radius'].default maps to scale.100
  },
  fontSize: { // From RESPONSIVE['font size']
    'body-md': '1rem',
    'body-xs': '0.625rem',
    'body-lg': '1.25rem',
    'body-sm': '0.75rem',
    'heading-h6': '1.25rem',
    'heading-h5': '1.5rem',
    'heading-h4': '2rem',
    'heading-h3': '2.5rem',
    'heading-h2': '3rem',
    'heading-h1': '3.75rem',
  },
  lineHeight: { // From RESPONSIVE['line height']
    'body-md': '1.375rem',
    'body-sm': '1.125rem',
    'body-lg': '1.75rem',
    'body-xs': '0.875rem',
    'heading-h6': '1.5rem',
    'heading-h5': '1.75rem',
    'heading-h4': '2rem',
    'heading-h3': '3rem',
    'heading-h2': '3.5rem',
    'heading-h1': '4.5rem',
  },
  fontWeight: { // From BRAND.type['font weight']
    'regular': '400',
    'medium': '500',
    'bold': '700',
    'semibold': '600',
    'light': '300',
  },
  fontFamily: { // From BRAND.type['font family'] - MUST match loaded font names
    'primarylight': ['AlbertSans_300Light', 'sans-serif'],
    'primary': ['AlbertSans_400Regular', 'sans-serif'],
    'primarymedium': ['AlbertSans_500Medium', 'sans-serif'],
    'primarysemibold': ['AlbertSans_600SemiBold', 'sans-serif'],
    'primarybold': ['AlbertSans_700Bold', 'sans-serif'],
    'secondarylight': ['Inter_300Light', 'sans-serif'],
    'secondary': ['Inter_400Regular', 'sans-serif'],
    'secondarymedium': ['Inter_500Medium', 'sans-serif'],
    'secondarysemibold': ['Inter_600SemiBold', 'sans-serif'],
    'secondarybold': ['Inter_700Bold', 'sans-serif'],
    // Add Poppins if you use it and load it in App.js
    poppins: ['Poppins_400Regular', 'sans-serif'],
    'poppins-semibold': ['Poppins_600SemiBold', 'sans-serif'],
  },
  // Custom margin for paragraph spacing
  margin: { // From RESPONSIVE['paragraph spacing']
    'paragraph-body-xs': '0.75rem',
    'paragraph-body-sm': '1rem',
    'paragraph-body-md': '1rem',
    'paragraph-body-lg': '1.25rem',
    'paragraph-heading-h6': '1.5rem',
    'paragraph-heading-h5': '1.75rem',
    'paragraph-heading-h4': '2rem',
    'paragraph-heading-h3': '2.25rem',
    'paragraph-heading-h2': '2.5rem',
    'paragraph-heading-h1': '3rem',
  },
};