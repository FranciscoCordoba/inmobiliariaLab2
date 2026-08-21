import { Router } from "express";
import { InquilinosController } from "../controllers/inquilinos.js";

const router = Router();

router.get('/', InquilinosController.getAll);
router.get('/:id', InquilinosController.getById);
router.post('/', InquilinosController.create);
router.put('/:id', InquilinosController.update);
router.delete('/:id', InquilinosController.delete);

export default router;