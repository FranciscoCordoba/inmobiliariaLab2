import { Router } from "express";
import { ReservasController } from "../controllers/reservas.js";

const router = Router();

router.get("/", ReservasController.getAll);
router.get("/:id", ReservasController.getById);
router.post("/", ReservasController.create);
router.put("/:id", ReservasController.update);
router.delete("/:id", ReservasController.delete);

export default router;
