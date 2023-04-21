import { Router } from "express"
import { login, newUser } from "../controllers/login.controller.js"

const userRouter = Router()

userRouter.post("/newUser", newUser)

userRouter.post("/sign-in", login)

export default userRouter