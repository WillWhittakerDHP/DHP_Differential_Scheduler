import { Router } from 'express'
import { csrfProtection } from '../middlewares/security.js'
import { apiGet, apiPost } from './api.controller.js'

const router = Router()

/* Get Route v1/get */
router.get('/get', apiGet)

/* Post Route v1/post */
router.post('/post', csrfProtection, apiPost)

export { router };
