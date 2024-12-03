import { Link, useLocation } from 'react-router-dom';
import '../index.css';

const Nav = () => {
  const currentPage = useLocation().pathname;

  return (
    <div className="sidebar">
      <Link
        to='/AvailavilityPage'
        className={
          currentPage === '/AvailavilityPage' ? 'nav-link active' : 'nav-link'
        }
      >
        Availability Page
      </Link>
      <Link
        to='/ConfirmationPage'
        className={
          currentPage === '/ConfirmationPage' ? 'nav-link active' : 'nav-link'
        }
      >
        Confirmation Page
      </Link>
      <Link
        to='/ParticipantInformationPage'
        className={
          currentPage === '/ParticipantInformationPage' ? 'nav-link active' : 'nav-link'
        }
      >
        Participant Information Page
      </Link>
      <Link
        to='/PropertyInformationPage'
        className={
          currentPage === '/PropertyInformationPage' ? 'nav-link active' : 'nav-link'
        }
      >
        Property Information Page
      </Link>
      <Link
        to='/ServiceSelectionPage'
        className={
          currentPage === '/ServiceSelectionPage' ? 'nav-link active' : 'nav-link'
        }
      >
        Service Selection Page
      </Link>
    </div>
  );
};

export default Nav;