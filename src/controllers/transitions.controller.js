import dayjs from "dayjs"
import { ObjectId } from "mongodb"
import { db } from "../database/dataBase.js"


export async function home(req, res) {

    try {

        const sessao = res.locals.sessao

        const user = await db.collection("users").find({ _id: new ObjectId(sessao.idUser) }).toArray()
        if (!user) return res.sendStatus(401)
        delete user.password

        const dadosTransacao = await db.collection("transacoes").find({ idUser: sessao.idUser }).toArray()
        if (dadosTransacao.length === 0) return res.status(200).send(user)

        res.status(200).send(dadosTransacao)
    } catch (err) {
        res.status(500).send(err.message)
    }
}

export async function trasition(req, res) {
    const { tipo } = req.params
    const { value, description } = req.body
    const formatValue = value.replace(",", ".")
    const valor = Number(formatValue)

    try {
        const sessao = res.locals.sessao

        const user = await db.collection("users").findOne({ _id: new ObjectId(sessao.idUser) })
        if (!user) return res.sendStatus(422)
        delete user.password

        await db.collection("transacoes").insertOne({ idUser: sessao.idUser, name: user.name, value: valor, description, type: tipo, day: dayjs().format("DD/MM") })

        res.sendStatus(201)
    } catch (err) {
        res.status(500).send(err.message)
    }
}