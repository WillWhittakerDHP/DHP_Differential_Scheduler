// // import { Router, type Request, type Response } from 'express';
// import { Router } from 'express';
// import { getAuthUrl, getTokens } from '../../config/connection.js';

// const router = Router();

// // Route to redirect users to Google authentication page
// router.get('/', (_req, res) => {
//   const authUrl = getAuthUrl();
//   res.redirect(authUrl);
// });

// // Callback route to handle Google's redirect with the authorization code
// router.get('/callback', async (req, res) => {
//   const { code } = req.query; // Get the authorization code from query
//   if (typeof code === 'string') {
//     try {
//       const tokens = await getTokens(code);
//       console.log('Tokens:', tokens);
//       res.redirect('/api/calendar/events'); // Redirect after successful authentication
//     } catch (error) {
//       console.error('Error during authentication:', error);
//       res.status(500).send('Error during authentication');
//     }
//   } else {
//     res.status(400).send('Authorization code missing');
//   }
// });


// export { router as oAuthRouter };
