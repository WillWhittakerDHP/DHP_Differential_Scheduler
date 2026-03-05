import type { ThemeDefinition } from 'vuetify'

export const staticPrimaryColor = '#7367F0'
export const staticPrimaryDarkenColor = '#675DD8'

export const quoteModeColors = {
  'primary': '#33BF78', // Green, 20% less vibrant
  'on-primary': '#fff',
  'primary-darken-1': '#2DA866', // Darker green
  'secondary': '#BD7832', // Orange-brown (green - 120°), 20% less vibrant
  'on-secondary': '#fff',
  'secondary-darken-1': '#A8682A', // Darker orange-brown
  'warning': '#E6465A', // Different red shade, 20% less vibrant
  'on-warning': '#fff',
  'warning-darken-1': '#CF3E50', // Darker red
}

// WHY: Reschedule mode palette (blue/teal) so reschedule is visually distinct from new and quote
export const rescheduleModeColors = {
  'primary': '#0D9488', // Teal
  'on-primary': '#fff',
  'primary-darken-1': '#0F766E',
  'secondary': '#0369A1', // Blue
  'on-secondary': '#fff',
  'secondary-darken-1': '#0284C7',
  'warning': '#DC2626',
  'on-warning': '#fff',
  'warning-darken-1': '#B91C1C',
}

export const inactiveColors = {
  normal: {
    'primary-inactive': '#E8E6FA', // Light purple (muted primary)
    'secondary-inactive': '#FFF4E6', // Light orange (muted secondary)
  },
  quote: {
    'primary-inactive': '#E6F8F0', // Light green (muted primary-quote)
    'secondary-inactive': '#F8F0E6', // Light orange-brown (muted secondary-quote)
  },
  reschedule: {
    'primary-inactive': '#CCFBF1', // Light teal (muted primary-reschedule)
    'secondary-inactive': '#E0F2FE', // Light blue (muted secondary-reschedule)
  },
}

/** Shape shared by quote/reschedule/DHP mode palettes for wizard theme resolution */
export interface WizardModePalette {
  'primary': string
  'on-primary': string
  'primary-darken-1': string
  'secondary': string
  'on-secondary': string
  'secondary-darken-1': string
  'warning': string
  'on-warning': string
  'warning-darken-1': string
}

// WHY: DHP (District Home Pro) brand palette — safety yellow, day-glow red, black; toggleable in booking wizard
export const dhpPalette: Record<'standard' | 'quote' | 'reschedule', WizardModePalette> = {
  standard: {
    'primary': '#EED202', // Safety yellow
    'on-primary': '#000000',
    'primary-darken-1': '#D4BC00',
    'secondary': '#FF3333', // Day-glow red
    'on-secondary': '#FFFFFF',
    'secondary-darken-1': '#E62E2E',
    'warning': '#FF3333',
    'on-warning': '#FFFFFF',
    'warning-darken-1': '#E62E2E',
  },
  quote: {
    'primary': '#EED202',
    'on-primary': '#000000',
    'primary-darken-1': '#D4BC00',
    'secondary': '#FF3333',
    'on-secondary': '#FFFFFF',
    'secondary-darken-1': '#E62E2E',
    'warning': '#FF3333',
    'on-warning': '#FFFFFF',
    'warning-darken-1': '#E62E2E',
  },
  reschedule: {
    'primary': '#EED202',
    'on-primary': '#000000',
    'primary-darken-1': '#D4BC00',
    'secondary': '#FF3333',
    'on-secondary': '#FFFFFF',
    'secondary-darken-1': '#E62E2E',
    'warning': '#FF3333',
    'on-warning': '#FFFFFF',
    'warning-darken-1': '#E62E2E',
  },
}

export const themes: Record<string, ThemeDefinition> = {
  light: {
    dark: false,
    colors: {
      'primary': staticPrimaryColor,
      'on-primary': '#fff',
      'primary-darken-1': '#675DD8',
      'secondary': '#FF9F43', // Changed from gray to orange
      'on-secondary': '#fff',
      'secondary-darken-1': '#E68F3C', // Darker orange
      'success': '#28C76F',
      'on-success': '#fff',
      'success-darken-1': '#24B364',
      'info': '#00BAD1',
      'on-info': '#fff',
      'info-darken-1': '#00A7BC',
      'warning': '#FF4C51', // Changed from orange to red
      'on-warning': '#fff',
      'warning-darken-1': '#E64449', // Darker red
      'error': '#FF4C51',
      'on-error': '#fff',
      'error-darken-1': '#E64449',
      'yellow': '#FFC107', // Yellow for ROY G BIV
      'on-yellow': '#000',
      'yellow-darken-1': '#FFB300',
      'brown': '#8D6E63', // Brown color
      'on-brown': '#fff',
      'brown-darken-1': '#795548',
      'grey': '#9E9E9E', // Grey (using grey-500 value)
      'on-grey': '#fff',
      'grey-darken-1': '#757575',
      'purple': '#9C27B0', // Purple/Violet for ROY G BIV
      'on-purple': '#fff',
      'purple-darken-1': '#7B1FA2',
      'background': '#F8F7FA',
      'on-background': '#2F2B3D',
      'surface': '#fff',
      'on-surface': '#2F2B3D',
      'grey-50': '#FAFAFA',
      'grey-100': '#F5F5F5',
      'grey-200': '#EEEEEE',
      'grey-300': '#E0E0E0',
      'grey-400': '#BDBDBD',
      'grey-500': '#9E9E9E',
      'grey-600': '#757575',
      'grey-700': '#616161',
      'grey-800': '#424242',
      'grey-900': '#212121',
      'grey-light': '#FAFAFA',
      'perfect-scrollbar-thumb': '#DBDADE',
      'skin-bordered-background': '#fff',
      'skin-bordered-surface': '#fff',
      'expansion-panel-text-custom-bg': '#fafafa',
    },

    variables: {
      'code-color': '#d400ff',
      'overlay-scrim-background': '#2F2B3D',
      'tooltip-background': '#2F2B3D',
      'overlay-scrim-opacity': 0.5,
      'hover-opacity': 0.06,
      'focus-opacity': 0.1,
      'selected-opacity': 0.08,
      'activated-opacity': 0.16,
      'pressed-opacity': 0.14,
      'dragged-opacity': 0.1,
      'disabled-opacity': 0.4,
      'border-color': '#2F2B3D',
      'border-opacity': 0.12,
      'table-header-color': '#EAEAEC',
      'high-emphasis-opacity': 0.9,
      'medium-emphasis-opacity': 0.7,
      'switch-opacity': 0.2,
      'switch-disabled-track-opacity': 0.3,
      'switch-disabled-thumb-opacity': 0.4,
      'switch-checked-disabled-opacity': 0.3,
      'track-bg': '#F1F0F2',

      'shadow-key-umbra-color': '#2F2B3D',
      'shadow-xs-opacity': 0.10,
      'shadow-sm-opacity': 0.12,
      'shadow-md-opacity': 0.14,
      'shadow-lg-opacity': 0.16,
      'shadow-xl-opacity': 0.18,
    },
  },
  dark: {
    dark: true,
    colors: {
      'primary': staticPrimaryColor,
      'on-primary': '#fff',
      'primary-darken-1': '#675DD8',
      'secondary': '#FF9F43', // Changed from gray to orange
      'on-secondary': '#fff',
      'secondary-darken-1': '#E68F3C', // Darker orange
      'success': '#28C76F',
      'on-success': '#fff',
      'success-darken-1': '#24B364',
      'info': '#00BAD1',
      'on-info': '#fff',
      'info-darken-1': '#00A7BC',
      'warning': '#FF4C51', // Changed from orange to red
      'on-warning': '#fff',
      'warning-darken-1': '#E64449', // Darker red
      'error': '#FF4C51',
      'on-error': '#fff',
      'error-darken-1': '#E64449',
      'yellow': '#FFC107', // Yellow for ROY G BIV
      'on-yellow': '#000',
      'yellow-darken-1': '#FFB300',
      'brown': '#8D6E63', // Brown color
      'on-brown': '#fff',
      'brown-darken-1': '#795548',
      'grey': '#9E9E9E', // Grey (using grey-500 value)
      'on-grey': '#fff',
      'grey-darken-1': '#757575',
      'purple': '#9C27B0', // Purple/Violet for ROY G BIV
      'on-purple': '#fff',
      'purple-darken-1': '#7B1FA2',
      'background': '#25293C',
      'on-background': '#E1DEF5',
      'surface': '#2F3349',
      'on-surface': '#E1DEF5',
      'grey-50': '#26293A',
      'grey-100': '#2F3349',
      'grey-200': '#26293A',
      'grey-300': '#4A5072',
      'grey-400': '#5E6692',
      'grey-500': '#7983BB',
      'grey-600': '#AAB3DE',
      'grey-700': '#B6BEE3',
      'grey-800': '#CFD3EC',
      'grey-900': '#E7E9F6',
      'grey-light': '#353A52',
      'perfect-scrollbar-thumb': '#4A5072',
      'skin-bordered-background': '#2F3349',
      'skin-bordered-surface': '#2F3349',
    },
    variables: {
      'code-color': '#d400ff',
      'overlay-scrim-background': '#171925',
      'tooltip-background': '#F7F4FF',
      'overlay-scrim-opacity': 0.6,
      'hover-opacity': 0.06,
      'focus-opacity': 0.1,
      'selected-opacity': 0.08,
      'activated-opacity': 0.16,
      'pressed-opacity': 0.14,
      'dragged-opacity': 0.1,
      'disabled-opacity': 0.4,
      'border-color': '#E1DEF5',
      'border-opacity': 0.12,
      'table-header-color': '#535876',
      'high-emphasis-opacity': 0.9,
      'medium-emphasis-opacity': 0.7,
      'switch-opacity': 0.4,
      'switch-disabled-track-opacity': 0.4,
      'switch-disabled-thumb-opacity': 0.8,
      'switch-checked-disabled-opacity': 0.3,
      'track-bg': '#3A3F57',

      'shadow-key-umbra-color': '#131120',
      'shadow-xs-opacity': 0.16,
      'shadow-sm-opacity': 0.18,
      'shadow-md-opacity': 0.20,
      'shadow-lg-opacity': 0.22,
      'shadow-xl-opacity': 0.24,
    },
  },
}

export default themes
