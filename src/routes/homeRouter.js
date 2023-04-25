import { Router } from "express"
import { home, trasition } from "../controllers/transitions.controller.js"
import { validarDados } from "../middelwares/validarDados.js"
import { valueSchema } from "../schemas/valueSchema.js"
import { authValidation } from "../middelwares/authMiddelware.js"

const homeRouter = Router()

homeRouter.use(authValidation)
homeRouter.get("/home", home)
homeRouter.post("/nova-transacao/:tipo", validarDados(valueSchema), trasition)

export default homeRouter