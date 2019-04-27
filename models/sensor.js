let deviceSensorData = require('./deviceSensorData');
let mongoose = require('mongoose');

let sensorSchema = new mongoose.Schema({
    name: {type: String, required: true, unique: false},
    lastDateModified: Date,
    createdAt: Date,
    data: [deviceSensorData]
});


sensorSchema.pre('save', function(next){
    let currentDate = new Date();

    this.lastDateModified = currentDate;

    if( !this.createdAt ){
        this.createdAt = currentDate;
    }

    next();
});

module.exports = sensorSchema;