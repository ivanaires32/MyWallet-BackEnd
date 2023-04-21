import { MongoClient } from "mongodb"
import dotenv from "dotenv"
dotenv.config()

const mongoCliente = new MongoClient(process.env.DATABASE_URL)

try {
    await mongoCliente.connect()
    console.log("Servidor conectado")
} catch (err) {
    console.log(err.message)
}

export const db = mongoCliente.db()