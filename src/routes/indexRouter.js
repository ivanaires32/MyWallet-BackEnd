import { Router } from "express";
import userRouter from "./loginRouter.js";
import homeRouter from "./homeRouter.js";


const routers = Router()

routers.use(userRouter)
routers.use(homeRouter)

export default routers