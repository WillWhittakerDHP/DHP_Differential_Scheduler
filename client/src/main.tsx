import React = require('react');
import { ReactDOM } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
// import './reset.css';
import './index.css';

import App from './App';
// import ServicesPage from './pages/ServiceSelectionPage.jsx';
import ErrorPage from './pages/ErrorPage.jsx';
import AdminPage from './pages/AdminPage.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      // {
      //   index: true,
      //   element: <ServicesPage />,
      // },
      // {
      //   path: 'propertyInfo',
      //   element: <PropertyInformationPage />,
      // }, 
      // {
      //   path: 'availability',
      //   element: <AvailabilityPage />,
      // },
      // {
      //   path: 'participant',
      //   element: <ParticipantInformationPage />,
      // },
      // {
      //   path: 'confirmation',
      //   element: <ConfirmationPage />,
      // },      
      {
        // path: 'admin',
        index: true,
        element: <AdminPage />,
      },
    ],
  },
]);

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <RouterProvider router={router} />
// );
