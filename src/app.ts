import express from 'express'
import bodyParser from 'body-parser'

export const expressApp = express().use(bodyParser.json())
