import { Link, useLocation } from 'react-router-dom';

const Nav = () => {
  const currentPage = useLocation().pathname;

  return (
    <nav>
      <h1>
        <Link to='/' id='logo'>
          DHP Differential Scheduler
        </Link>
      </h1>
      <ul className='nav nav-tabs'>
        <li className='nav-item'>
          <h2>
            <Link
              to='/'
              className={currentPage === '/' ? 'nav-link active' : 'nav-link'}
            >
              SCHEDULER
            </Link>
          </h2>
        </li>
        <li className='nav-item'>
          <h2>
            <Link
              to='/AvailavilityPage'
              className={
                currentPage === '/AvailavilityPage' ? 'nav-link active' : 'nav-link'
              }
            >
              Availability Page
            </Link>
          </h2>
        </li>
        <li className='nav-item'>
          <h2>
            <Link
              to='/ConfirmationPage'
              className={
                currentPage === '/ConfirmationPage' ? 'nav-link active' : 'nav-link'
              }
            >
              Confirmation Page
            </Link>
          </h2>
        </li>
        <li className='nav-item'>
          <h2>
            <Link
              to='/ParticipantInformationPage'
              className={
                currentPage === '/ParticipantInformationPage' ? 'nav-link active' : 'nav-link'
              }
            >
              Participant Information Page
            </Link>
          </h2>
        </li>
        <li className='nav-item'>
          <h2>
            <Link
              to='/PropertyInformationPage'
              className={
                currentPage === '/PropertyInformationPage' ? 'nav-link active' : 'nav-link'
              }
            >
              Property Information Page
            </Link>
          </h2>
        </li>
        <li className='nav-item'>
          <h2>
            <Link
              to='/ServiceSelectionPage'
              className={
                currentPage === '/ServiceSelectionPage' ? 'nav-link active' : 'nav-link'
              }
            >
              Service Selection Page
            </Link>
          </h2>
        </li>
      </ul>
    </nav>
  );
};

export default Nav;