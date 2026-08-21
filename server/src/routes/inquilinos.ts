import { Router } from "express";
import { InquilinosController } from "../controllers/inquilinos.js";

const router = Router()

router.get('/', InquilinosController.getAll)

export default router