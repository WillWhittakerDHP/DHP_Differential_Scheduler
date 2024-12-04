import { Link, useLocation } from 'react-router-dom';
import '../index.css';

const Nav = () => {
  const currentPage = useLocation().pathname;

  return (
    <div className="sidebar">
        <Link
        to='/ServiceSelectionPage'
        className={
          currentPage === '/ServiceSelectionPage' ? 'nav-link active' : 'nav-link'
        }
      >
        Service Selection
      </Link>
      <Link
        to='/PropertyInformationPage'
        className={
          currentPage === '/PropertyInformationPage' ? 'nav-link active' : 'nav-link'
        }
      >
        Property Details
      </Link>
      <Link
        to='/AvailabilityPage'
        className={
          currentPage === '/AvailabilityPage' ? 'nav-link active' : 'nav-link'
        }
      >
        Appointment Availability 
      </Link>
      <Link
        to='/ParticipantInformationPage'
        className={
          currentPage === '/ParticipantInformationPage' ? 'nav-link active' : 'nav-link'
        }
      >
        Personal Information 
      </Link>
      <Link
        to='/ConfirmationPage'
        className={
          currentPage === '/ConfirmationPage' ? 'nav-link active' : 'nav-link'
        }
      >
        Summary 
      </Link>
    </div>
  );
};

export default Nav;