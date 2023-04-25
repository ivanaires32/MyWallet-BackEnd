import { Router } from "express"
import { login, newUser } from "../controllers/login.controller.js"
import { validarDados } from "../middelwares/validarDados.js"
import { userSchema } from "../schemas/userSchema.js"


const userRouter = Router()

userRouter.post("/newUser", validarDados(userSchema), newUser)

userRouter.post("/sign-in", validarDados(userSchema), login)

export default userRouter