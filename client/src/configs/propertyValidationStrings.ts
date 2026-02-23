/**
 * Property Validation UI Strings Configuration
 * 
 */
export const PROPERTY_VALIDATION_STRINGS = {
  address: {
    required: 'Address is required',
    minLength: 'Address must be at least 3 characters'
  },
  city: {
    required: 'City is required',
    minLength: 'City must be at least 2 characters'
  },
  state: {
    required: 'State is required'
  },
  zipCode: {
    required: 'Zip code is required'
  },
  propertySize: {
    required: 'Size is required',
    min: 'Size must be at least 1 sq-ft',
    max: 'Size must be no more than 100,000 sq-ft'
  },
  numberOfUnits: {
    required: 'Number of units is required',
    min: 'Number of units must be at least 1',
    max: 'Number of units must be no more than 1000'
  },
  propertyTypeBlock: {
    required: 'Please select at least one property type'
  }
} as const
