import { Router } from "express";
import { PropietariosController } from "../controllers/propietarios.js";

const router = Router();

router.get('/', PropietariosController.getAll);
router.get('/:id', PropietariosController.getById);
router.post('/', PropietariosController.create);
router.put('/:id', PropietariosController.update);
router.delete('/:id', PropietariosController.delete);

export default router;