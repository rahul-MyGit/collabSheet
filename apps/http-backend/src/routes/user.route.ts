import { getMe, logout, signin } from '@/controller/user.controller'
import { signup } from '@/controller/user.controller'
import protectRoute from '@/middleware'
import { Router } from 'express'

const router: Router = Router()

router.get('/', protectRoute, getMe)

router.post('/', signup)

router.post('/', signin)

router.post('/', logout)

export default router
