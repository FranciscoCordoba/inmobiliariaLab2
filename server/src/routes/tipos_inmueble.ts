import { Router } from "express";
import { TiposInmuebleController } from "../controllers/tipos_inmueble.js";

const router = Router();

router.get("/", TiposInmuebleController.getAll);
router.get("/:id", TiposInmuebleController.getById);
router.post("/", TiposInmuebleController.create);
router.put("/:id", TiposInmuebleController.update);
router.delete("/:id", TiposInmuebleController.delete);

export default router;
