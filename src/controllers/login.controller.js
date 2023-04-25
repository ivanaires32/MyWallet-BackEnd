import bcrypt from "bcrypt"
import { v4 as uuid } from "uuid"
import { db } from "../database/dataBase.js"

export async function newUser(req, res) {
    const { name, email, password } = req.body

    if (!name || !email || !password) return res.status(422).send("Todos os campos são obrigatorios")

    try {
        const unserOn = await db.collection("users").findOne({ email })
        if (unserOn) return res.status(409).send("Email já cadastrado")

        const hash = bcrypt.hashSync(password, 10)
        await db.collection("users").insertOne({ name, email, password: hash })

        res.sendStatus(201)
    } catch (err) {
        res.status(500).send(err.message)
    }
}

export async function login(req, res) {
    const { email, password } = req.body

    try {
        const user = await db.collection("users").findOne({ email })
        if (!user) return res.status(404).send("Email não encontrado")

        const senhaUser = bcrypt.compareSync(password, user.password)
        if (!senhaUser) return res.status(401).send("Senha incorreta")

        const token = uuid()
        await db.collection("sessoes").insertOne({ token, idUser: user._id })
        res.send(token)
    } catch (err) {
        res.status(500).send(err.message)
    }
}