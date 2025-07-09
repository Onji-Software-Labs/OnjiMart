// tailwind-tokens-parser.js

// --- 1. Import Raw Token Data ---
const BRAND = require('./figma_tw/BRAND.json');
const ALIAS = require('./figma_tw/ALIAS.json');
const RESPONSIVE = require('./figma_tw/RESPONSIVE.json');
const MAPPED = require('./figma_tw/MAPPED.json');

// --- 2. Helper Function to Resolve Token References ---
function resolveTokens(obj, allTokens) {
  const resolved = {};
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      if (obj[key].value && typeof obj[key].value === 'string' && obj[key].value.startsWith('{') && obj[key].value.endsWith('}')) {
        const path = obj[key].value.slice(1, -1); // Remove braces
        let value = getNestedValue(allTokens, path);
        // If the resolved value itself has a 'value' property (common for token objects)
        if (value && typeof value === 'object' && value.value) {
          value = value.value;
        }
        resolved[key] = value;
      } else {
        resolved[key] = resolveTokens(obj[key], allTokens); // Recurse for nested objects
      }
    } else {
      resolved[key] = obj[key];
    }
  }
  return resolved;
}

// Helper to get nested value from an object using a dot-separated path
function getNestedValue(obj, path) {
  const parts = path.split('.');
  let current = obj;
  for (let i = 0; i < parts.length; i++) {
    if (current === undefined || current === null) return undefined;
    current = current[parts[i]];
  }
  return current;
}

// --- 3. Flatten and Prepare Raw Values from BRAND.json ---
const brandColors = {};
for (const colorGroup in BRAND.Colour) {
  for (const shade in BRAND.Colour[colorGroup]) {
    const tailwindKey = `${colorGroup.toLowerCase()}-${shade.toLowerCase()}`.replace(/ /g, '-');
    brandColors[tailwindKey] = BRAND.Colour[colorGroup][shade].value;
  }
}
brandColors.white = BRAND.Colour.white.value;
brandColors.black = BRAND.Colour.black.value;

const rawScale = {};
for (const key in BRAND.scale) {
  rawScale[key] = BRAND.scale[key].value;
}

// --- 4. Create a comprehensive token map for resolution ---
const allTokens = {
  Colour: BRAND.Colour,
  scale: BRAND.scale,
  Primary: ALIAS.Primary,
  Secondary: ALIAS.Secondary,
  Error: ALIAS.Error,
  success: ALIAS.success,
  neutral: ALIAS.neutral,
  warning: ALIAS.warning,
  information: ALIAS.information,
  'border width': ALIAS['border width'],
  'Border radius': ALIAS['Border radius'],
  'font size': RESPONSIVE['font size'],
  'line height': RESPONSIVE['line height'],
  'paragraph spacing': RESPONSIVE['paragraph spacing'],
  spacing: RESPONSIVE.spacing,
  colour: MAPPED.colour,
};

// --- 5. Resolve ALIAS.json values ---
const resolvedAliasColors = resolveTokens({
  Primary: ALIAS.Primary,
  Secondary: ALIAS.Secondary,
  Error: ALIAS.Error,
  success: ALIAS.success,
  neutral: ALIAS.neutral,
  warning: ALIAS.warning,
  information: ALIAS.information,
  Color: ALIAS.Color
}, allTokens);

const resolvedAliasDimensions = resolveTokens({
  'border width': ALIAS['border width'],
  'Border radius': ALIAS['Border radius']
}, allTokens);

// --- 6. Resolve MAPPED.json values (semantic colors) ---
const resolvedMappedColors = resolveTokens(MAPPED.colour, allTokens);

// --- 7. Resolve RESPONSIVE.json values ---
const resolvedResponsiveDimensions = resolveTokens(RESPONSIVE, allTokens);


// --- 8. Consolidate Colors for Tailwind ---
const tailwindColors = {
  ...brandColors,
  ...Object.entries(resolvedAliasColors).reduce((acc, [key, value]) => {
    if (typeof value === 'object' && value !== null) {
      for (const shade in value) {
        if (shade === 'default') {
          acc[key.toLowerCase()] = value[shade];
        } else {
          acc[`${key.toLowerCase()}-${shade}`] = value[shade];
        }
      }
    } else {
      acc[key.toLowerCase()] = value;
    }
    return acc;
  }, {}),
  'text': {
    ...Object.entries(resolvedMappedColors.Text).reduce((acc, [key, value]) => {
      acc[key.toLowerCase().replace(/ /g, '-')] = value;
      return acc;
    }, {})
  },
  'surface': {
    ...Object.entries(resolvedMappedColors.surface).reduce((acc, [key, value]) => {
      acc[key.toLowerCase().replace(/ /g, '-')] = value;
      return acc;
    }, {})
  },
  'icon': {
    ...Object.entries(resolvedMappedColors.icon).reduce((acc, [key, value]) => {
      acc[key.toLowerCase().replace(/ /g, '-')] = value;
      return acc;
    }, {})
  },
  'border': {
    ...Object.entries(resolvedMappedColors.border).reduce((acc, [key, value]) => {
      acc[key.toLowerCase().replace(/ /g, '-')] = value;
      return acc;
    }, {})
  }
};

// --- 9. Consolidate Dimensions for Tailwind ---
const tailwindSpacing = {
  ...rawScale,
  ...Object.entries(resolvedResponsiveDimensions.spacing).reduce((acc, [key, value]) => {
    acc[key] = value;
    return acc;
  }, {})
};

const tailwindBorderWidth = Object.entries(resolvedAliasDimensions['border width']).reduce((acc, [key, value]) => {
  acc[key.toLowerCase().replace(/ /g, '-')] = value;
  return acc;
}, {});

const tailwindBorderRadius = Object.entries(resolvedAliasDimensions['Border radius']).reduce((acc, [key, value]) => {
  acc[key.toLowerCase().replace(/ /g, '-')] = value;
  return acc;
}, {});

const tailwindFontSize = Object.entries(resolvedResponsiveDimensions['font size']).reduce((acc, [type, sizes]) => {
  for (const size in sizes) {
    acc[`${type}-${size}`] = sizes[size];
  }
  return acc;
}, {});

const tailwindLineHeight = Object.entries(resolvedResponsiveDimensions['line height']).reduce((acc, [type, heights]) => {
  for (const size in heights) {
    acc[`${type}-${size}`] = heights[size];
  }
  return acc;
}, {});

const tailwindParagraphSpacing = Object.entries(resolvedResponsiveDimensions['paragraph spacing']).reduce((acc, [type, spacings]) => {
  for (const size in spacings) {
    acc[`${type}-${size}`] = spacings[size];
  }
  return acc;
}, {});


// --- 10. Map Font Weights and Families for Tailwind ---
const tailwindFontWeight = Object.entries(BRAND.type['font weight']).reduce((acc, [key, value]) => {
  acc[key.toLowerCase().replace(/ /g, '-')] = value.value;
  return acc;
}, {});

const tailwindFontFamily = Object.entries(BRAND.type['font family']).reduce((acc, [key, value]) => {
  acc[key.toLowerCase()] = [value.value];
  return acc;
}, {});


// --- Export the consolidated theme object ---
module.exports = {
  colors: tailwindColors,
  spacing: tailwindSpacing,
  borderWidth: tailwindBorderWidth,
  borderRadius: tailwindBorderRadius,
  fontSize: tailwindFontSize,
  lineHeight: tailwindLineHeight,
  fontWeight: tailwindFontWeight,
  fontFamily: tailwindFontFamily,
  // Custom margin for paragraph spacing
  margin: {
    'paragraph-body-xs': tailwindParagraphSpacing['body-xs'],
    'paragraph-body-sm': tailwindParagraphSpacing['body-sm'],
    'paragraph-body-md': tailwindParagraphSpacing['body-md'],
    'paragraph-body-lg': tailwindParagraphSpacing['body-lg'],
    'paragraph-heading-h6': tailwindParagraphSpacing['heading-h6'],
    'paragraph-heading-h5': tailwindParagraphSpacing['heading-h5'],
    'paragraph-heading-h4': tailwindParagraphSpacing['heading-h4'],
    'paragraph-heading-h3': tailwindParagraphSpacing['heading-h3'],
    'paragraph-heading-h2': tailwindParagraphSpacing['heading-h2'],
    'paragraph-heading-h1': tailwindParagraphSpacing['heading-h1'],
  },
};