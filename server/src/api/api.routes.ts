import { Router } from 'express'
import { csrfProtection } from '../middlewares/security.js'
import { apiGet, apiPost } from './api.controller.js'

const router = Router()

router.get('/get', apiGet)

router.post('/post', csrfProtection, apiPost)

export { router };
