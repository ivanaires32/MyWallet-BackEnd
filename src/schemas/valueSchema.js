import joi from "joi"
export const valueSchema = joi.object({
    valor: joi.number().required(),
    description: joi.string().required()
})