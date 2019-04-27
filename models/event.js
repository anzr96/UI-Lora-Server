let deviceEventData = require('./deviceEventData');
let mongoose = require('mongoose');

let eventSchema = new mongoose.Schema({
    name: String,
    data: [deviceEventData],
    lastDateModified: Date,
    createdAt: Date
});

eventSchema.pre('save', function(next){
    let currentDate = new Date();

    this.lastDateModified = currentDate;

    if( !this.createdAt ){
        this.createdAt = currentDate;
    }

    next();
});

module.exports = eventSchema;