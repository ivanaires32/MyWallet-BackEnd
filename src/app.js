import express, { json } from "express"
import cors from "cors"
import dotenv from "dotenv"
import { MongoClient, ObjectId } from "mongodb"
import joi from "joi"
import bcrypt from "bcrypt"
import { v4 as uuid } from "uuid"
import dayjs from "dayjs"

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

const userSchema = joi.object({
    name: joi.string().required(),
    email: joi.string().required().email(),
    password: joi.string().required().min(3)
})

app.post("/newUser", async (req, res) => {
    const { name, email, password } = req.body

    const validation = userSchema.validate(req.body, { abortEarly: false })
    if (validation.error) {
        return res.status(422).send(validation.error.details.map(d => d.message))
    }

    try {
        const unserOn = await db.collection("users").findOne({ email })
        if (unserOn) return res.status(409).send("Usuario já cadastrado")

        const hash = bcrypt.hashSync(password, 10)
        await db.collection("users").insertOne({ name, email, password: hash })

        res.sendStatus(201)
    } catch (err) {
        res.status(500).send(err.message)
    }
})

app.post("/sign-in", async (req, res) => {
    const { email, password } = req.body


    if (!email || !password) return res.status(422).send("Todos os campos obrigatorios")

    try {
        const user = await db.collection("users").findOne({ email })
        if (!user) return res.status(404).send("Email não encontrado")

        const senhaUser = bcrypt.compareSync(password, user.password)
        if (!senhaUser) return res.status(401).send("Senha incorreta")

        const token = uuid()
        await db.collection("sessoes").insertOne({ token, idUser: user._id })
        res.send(token)
    } catch (err) {
        res.status(500).send("oi")
    }
})

app.get("/home", async (req, res) => {
    const { authorization } = req.headers
    const token = authorization?.replace("Bearer ", "")

    if (!token) return res.sendStatus(401)
    try {
        const sessao = await db.collection("sessoes").findOne({ token })
        if (!sessao) return res.sendStatus(404)

        const user = await db.collection("users").find({ _id: new ObjectId(sessao.idUser) }).toArray()
        if (!user) return res.sendStatus(404)
        delete user.password

        const dadosTransacao = await db.collection("transacoes").find({ idUser: sessao.idUser }).toArray()
        if (!dadosTransacao) res.status(200).send(user)

        res.status(200).send(dadosTransacao)
    } catch (err) {
        res.status(500).send(err.message)
    }
})

app.post("/nova-transacao/:tipo", async (req, res) => {
    const { tipo } = req.params
    const { value, description } = req.body
    const { authorization } = req.headers
    const token = authorization?.replace("Bearer ", "")
    const formatValue = value.replace(",", ".")
    const valor = Number(formatValue)

    if (!value || !description) return res.status(422).send("Todos os campos são obrigatorios")

    const valueSchema = joi.object({
        valor: joi.number().required(),
        description: joi.string().required()
    })

    const validation = valueSchema.validate({ valor, description }, { abortEarly: false })
    if (validation.error) return res.status(422).send(validation.error.details.map(d => d.message))

    try {
        const sessao = await db.collection("sessoes").findOne({ token })
        if (!sessao) return res.sendStatus(401)

        const user = await db.collection("users").findOne({ _id: new ObjectId(sessao.idUser) })
        if (!user) return res.sendStatus(422)
        delete user.password

        await db.collection("transacoes").insertOne({ idUser: sessao.idUser, name: user.name, value: valor, description, type: tipo, day: dayjs().format("DD/MM") })

        res.sendStatus(201)
    } catch (err) {
        res.status(500).send(err.message)
    }
})
app.listen(5000, () => console.log("Servidor rodando"))