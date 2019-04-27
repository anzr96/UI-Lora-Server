const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const { Schema } = mongoose;

const UsersSchema = new Schema({
    username: String,
    password: String,
    name: String,
    email: String,
    company: String,
    phone_number: String
});

UsersSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('Users', UsersSchema);