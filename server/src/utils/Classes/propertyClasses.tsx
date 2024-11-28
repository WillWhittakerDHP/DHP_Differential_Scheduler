class Address{
  streetNumber: number;
  streetName: string;
  unit: string;
  city: string;
  state: string;
  zipCode: number;
  
  constructor (
    streetNumber: number,
    streetName: string,
    unit: string,
    city: string,
    state: string,
    zipCode: number
  ) {
    this.streetNumber = streetNumber;
    this.streetName = streetName;
    this.unit = unit;
    this.city = city;
    this.state = state;
    this.zipCode = zipCode;
  }
}

class Property extends Address {
  dwellingType: string;
  dwellingSize: number;
  foundationType: string; 
  // TODO: foundationType Validation
  numberOfUnits?: number;

  constructor (
    dwellingType: string,
    dwellingSize: number,
    foundationType: string, 
    numberOfUnits: number,
    streetNumber: number,
    streetName: string,
    unit: string,
    city: string,
    state: string,
    zipCode: number
  ) {
    super (streetNumber, streetName, unit, city, state, zipCode)

    this.dwellingType = dwellingType;
    this.dwellingSize = dwellingSize;
    this.foundationType = foundationType; 
    this.numberOfUnits = numberOfUnits;
  }
}

export default Property