import { createNewDocument, deleteDocument, getAllDocument, getDocument } from '@/controller/sheet.controller';
import protectRoute from '@/middleware'
import { Router } from 'express'

const router: Router = Router()

router.get('/' , protectRoute ,getAllDocument);

router.post('/', protectRoute, createNewDocument);

router.get('/:id',protectRoute, getDocument);

router.delete('/:id', protectRoute, deleteDocument); // only owner can do it

export default router;
