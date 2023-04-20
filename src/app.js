import express, { json } from "express"
import cors from "cors"
import dotenv from "dotenv"
import { MongoClient } from "mongodb"
import { login, newUser } from "./functions/loginRegister.js"
import { home, trasition } from "./functions/transitions.js"

const app = express()

app.use(json())
app.use(cors())
dotenv.config()

// config database

const mongoCliente = new MongoClient(process.env.DATABASE_URL)

try {
    await mongoCliente.connect()
    console.log("Servidor conectado")
} catch (err) {
    console.log(err.message)
}

export const db = mongoCliente.db()


app.post("/newUser", newUser)

app.post("/sign-in", login)

app.get("/home", home)

app.post("/nova-transacao/:tipo", trasition)

app.listen(5000, () => console.log("Servidor rodando"))