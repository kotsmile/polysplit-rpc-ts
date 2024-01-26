import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'

export const expressApp = express().use(bodyParser.json()).use(cors())
