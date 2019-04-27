let sensors = require('./sensor');
let events = require('./event');
let mongoose = require('mongoose');

let deviceSchema = new mongoose.Schema({
    devaddr: {type: String, required: true},
    lastDateModified: Date,
    createdAt: Date,
    latitude: Number,
    longitude: Number,
    sensors: [sensors],
    events: [events] 
});

deviceSchema.pre('save', function(next){
    let currentDate = new Date();

    this.lastDateModified = currentDate;

    if( !this.createdAt ){
        this.createdAt = currentDate;
    }

    next();
});

module.exports = deviceSchema;