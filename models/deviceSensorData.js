let mongoose = require('mongoose');

let deviceSensorDataSchema = new mongoose.Schema({
    value: Number,
    date: Date,
    createdAt: Date
});

deviceSensorDataSchema.pre('save', function(next){
    let currentDate = new Date();

    if( !this.createdAt ){
        this.createdAt = currentDate;
    }

    next();
});

module.exports = deviceSensorDataSchema;