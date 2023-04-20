import joi from "joi"
import dayjs from "dayjs"
import { ObjectId } from "mongodb"
import { db } from "../app.js"


export async function home(req, res) {
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
}

export async function trasition(req, res) {
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
}