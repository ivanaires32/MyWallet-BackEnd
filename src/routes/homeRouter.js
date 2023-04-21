import { Router } from "express"
import { home, trasition } from "../controllers/transitions.controller.js"

const homeRouter = Router()

homeRouter.get("/home", home)

homeRouter.post("/nova-transacao/:tipo", trasition)

export default homeRouter