import { makeId, readJsonFile, writeJsonFile } from './util.service.js'

export const carService = {
    query,
    getById,
    remove,
    save,
}

const cars = readJsonFile('./data/car.json')

function query() {
    return Promise.resolve(cars)
}

function getById(carId) {
    const car = cars.find(car => car._id === carId)
    if (!car) return Promise.reject('Car not found')
        return Promise.resolve(car)
}

function remove(carId) {
    const idx = cars.findIndex(car => car._id === carId)

    if (idx === -1) return Promise.reject('Car not found')
        cars.splice(idx, 1)
    
    return _saveCars()
}

function save(car) {
    if (car._id) {
        const idx = cars.findIndex(c => c._id === car._id)
        if (idx === -1) return Promise.reject('Car not found')
        cars[idx] = car
    } else {
        car._id = makeId()
        cars.push(car)
    }
    return _saveCars()
        .then(() => car)
}

function _saveCars() {
    return writeJsonFile('./data/car.json', cars)
}