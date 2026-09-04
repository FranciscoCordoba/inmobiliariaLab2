import { Router } from "express";
import { InmueblesController } from "../controllers/inmuebles.js";

const router = Router();

router.get("/", InmueblesController.getAll);
router.get("/:id", InmueblesController.getById);
router.post("/", InmueblesController.create);
router.put("/:id", InmueblesController.update);
router.delete("/:id", InmueblesController.delete);

export default router;
