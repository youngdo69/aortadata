const mongoose = require('mongoose');
const Schema = mongoose.Schema; //const { Schema } = mongoose; 이렇게 써도 된다.

//Mongoose Schema setup후 mongoose model 생성
const aorticDataSchema = new mongoose.Schema({
    order_number: { type: Number, uinque: true, index: true },
    institution: { type: String, required: true },
    subject_number: String,
    enrollment_date: String,
    op_date: String,
    name: String,
    sex: String,
    age: Number,
    doctor: String,
    patient_number: { type: String, unique: true, required: true }
});

module.exports = mongoose.model('AortaData', aorticDataSchema);