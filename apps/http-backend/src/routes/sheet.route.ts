import { createNewDocument, deleteDocument, getAllDocument, getDocument } from '@/controller/sheet.controller';
// import protectRoute from '@/middleware'  || TODO: add later
import { Router } from 'express'

const router: Router = Router()

router.get('/'  ,getAllDocument);

router.post('/', createNewDocument);

router.get('/:id', getDocument);

router.delete('/:id', deleteDocument); // only owner can do it

export default router;
