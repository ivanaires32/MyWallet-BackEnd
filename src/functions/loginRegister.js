import bcrypt from "bcrypt"
import joi from "joi"
import { v4 as uuid } from "uuid"
import { db } from "../app.js"


const userSchema = joi.object({
    name: joi.string().required(),
    email: joi.string().required().email(),
    password: joi.string().required().min(3)
})


export async function newUser(req, res) {
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
}

export async function login(req, res) {
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
        res.status(500).send(err.message)
    }
}