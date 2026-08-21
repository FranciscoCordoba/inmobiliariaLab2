import { Router } from "express";
import { PropietariosController } from "../controllers/propietarios.js";

const router = Router()

router.get('/', PropietariosController.getAll)

export default router