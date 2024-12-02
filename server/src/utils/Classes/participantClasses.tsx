class ContactInfo{
  firstName: string;
  lastName: string;
  emailAddress: string;

  constructor (
    firstName: string,
    lastName: string,
    emailAddress: string
  ) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.emailAddress = emailAddress;
  }
}

class Participant extends ContactInfo{
  userType: string;
  uIDescription: string;
  
  constructor (
    userType: string,
    uIDescription: string,
    firstName?: string,
    lastName?: string,
    emailAddress?: string
  ) {
    super (firstName, lastName, emailAddress)

    this.userType = this.userType;
    this.uIDescription = uIDescription;
  }
}

export default Participant