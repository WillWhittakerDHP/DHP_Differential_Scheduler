import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css'

import App from './App.tsx'
import AvailabilityPage from './pages/AvailabilityPage.tsx';
import ConfirmationPage from './pages/ConfirmationPage.tsx';
import ParticipantInformationPage from './pages/ParticipantInformationPage.tsx';
import PropertyInformationPage from './pages/PropertyInformationPage.tsx';
import ServiceSelectionPage from './pages/ServiceSelectionPage.tsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/ServiceSelectionPage',
        element: <ServiceSelectionPage />,
      },
      {
        path: '/PropertyInformationPage',
        element: <PropertyInformationPage />,
      },
      {
        path: '/AvailabilityPage',
        element: <AvailabilityPage />,
      },
      {
        path: '/ParticipantInformationPage',
        element: <ParticipantInformationPage />,
      },
      {
        path: '/ConfirmationPage',
        element: <ConfirmationPage />,
      },
    ],
  },
]);

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(<RouterProvider router={router} />);
};

