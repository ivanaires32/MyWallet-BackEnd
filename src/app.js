import express, { json } from "express"
import cors from "cors"
import routers from "./routes/indexRouter.js"

const app = express()

app.use(json())
app.use(cors())
app.use(routers)

const port = process.env.PORT || 5000

app.listen(port, () => console.log(`Servidor rodando na port: ${port}`))