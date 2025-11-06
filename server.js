import express from 'express'

import { carService } from './services/car.service.js'
import { loggerService } from './services/logger.service.js'

const app = express()
app.use(express.static('public'))

app.get('/api/car/save', (req, res) => {
    const { id: _id, vendor, speed } = req.query
    const car = { _id, vendor, speed: +speed }

    carService.save(car)
        .then(car => res.send(car))
        .catch(err => {
            loggerService.error(err)
            res.status(404).send(err)
        })
})

app.get('/api/car', (req, res) => {
	carService.query()
        .then(cars => res.send(cars))
})

app.get('/api/car/:id', (req, res) => {
    const carId = req.params.id
    carService.getById(carId)
        .then(car => res.send(car))
        .catch(err => {
            loggerService.error(err)
            res.status(404).send(err)
        })
})

app.get('/api/car/:id/remove', (req, res) => {
    const carId = req.params.id

    carService.remove(carId)
        .then(() => res.send('OK'))
        .catch(err => {
            loggerService.error(err)
            res.status(404).send(err)
        })
})

app.get('/puki', (req, res) => {
	res.send('Hello Puki')
})

app.get('/mama', (req, res) => {
	res.send('Hello Mama Moo')
})

app.get('/nono', (req, res) => res.redirect('/mama'))

const port = 3030
app.listen(port, () => loggerService.info(`Server listening on port http://127.0.0.1:${port}/`))
