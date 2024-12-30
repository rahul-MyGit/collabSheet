import { getAllDocument } from '@/controller/sheet.controller';
import protectRoute from '@/middleware'
import { Router } from 'express'

const router: Router = Router()

router.get('/' , protectRoute ,getAllDocument);

export default router
