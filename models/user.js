const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const CourseSchema = require('./course').schema;

const UserSchema = new Schema({
    name: { type: String, required: true },
    id: { type: Number, unique: true, required: true, dropDups: true },
    mail: { type: String, required: true, trim: true },
    phone: { type: Number, required: true },
    pass: { type: String, required: true },
    role: { type: String, default: 'aspirante' },
    courses: [{ type: Schema.Types.ObjectId, ref: 'courses' }],
    photo: { type: Buffer, required: true }
});

module.exports = mongoose.model('users', UserSchema); //nombre coleccion y esquema a usar