import express, { json } from "express"
import cors from "cors"
import dotenv from "dotenv"
import { MongoClient } from "mongodb"

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

const db = mongoCliente.db()

app.post("/newUser", async (req, res) => {
    const { name, email, password } = req.body

    if (!name || !email || !password) return res.status(422).send("Todos os campos são obrigatorios")
    if (password.length < 3) return res.status(422).send("Senha muito curta")

    try {
        const unserOn = await db.collection("users").findOne({ name })
        if (unserOn) return res.status(409).send("Usuario já cadastrado")
        await db.collection("users").insertOne({ name, email, password })

        res.sendStatus(201)
    } catch (err) {
        res.status(500).send(err.message)
    }
})

app.post("/sign-in", async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) return res.status(422).send("Campos obrigatorios")

    try {
        const user = await db.collection("users").findOne({ email })
        if (!user) return res.status(404).send("Usuario não encontrado")
        if (user.password !== password) return res.status(401).send("Senha incorreta")
        res.sendStatus(201)
    } catch (err) {
        res.status(500).send(err.message)
    }
})
app.listen(5000, () => console.log("Servidor rodando"))