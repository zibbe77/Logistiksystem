import { Mongoose } from "mongoose";

const Warehouse = new Schema({
    name: String,
    rowsShelves: Number,
    slots: Number,
    shelves: [Shelve],
});

const Shelve = new Schema({
    slot: [ObjectId],
    amount: Number,
});

//---------------------------------

const Products = new Schema({
    name: String,
    price: Number,
    weight: Number,
});

//---------------------------------

const employee = new Schema({
    name: String,
    work: String,
    schedule: [],
    orders: [ObjectId],
});

const WeeklySchedule = new Schema({
    startT: [Number],
    stopT: [Number],
});

//---------------------------------

const Order = new Schema({
    orderN: Number,
    status: String,
    week: Number,
    day: Number,
    date: Date,
    employees: [ObjectId],
    products: [ObjectId],
    amountP: [Number],
});
