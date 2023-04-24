import joi from "joi"
export const valueSchema = joi.object({
    value: joi.number().required(),
    description: joi.string().required()
})