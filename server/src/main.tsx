import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css'
import App from './App'

import App from './App.tsx'
import AvailavilityPage from './pages/AvailavilityPage.tsx';
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
        //index: true,
        path: '/AvailavilityPage',
        element: <AvailavilityPage />,
      },
      {
        path: '/ConfirmationPage',
        element: <ConfirmationPage />,
      },
      {
        path: '/ParticipantInformationPage',
        element: <ParticipantInformationPage />,
      },
      {
        path: '/PropertyInformationPage',
        element: <PropertyInformationPage />,
      },
      {
        path: '/ServiceSelectionPage',
        element: <ServiceSelectionPage />,
      },
    ],
  },
]);

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(<RouterProvider router={router} />);
};

