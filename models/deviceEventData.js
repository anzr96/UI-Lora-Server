let mongoose = require('mongoose');

let deviceEventDataSchema = mongoose.Schema({
    devaddr: String,
    app: String,
    date: Date,
    event: String,
    createdAt: Date
});

deviceEventDataSchema.pre('save', function(next){
    let currentDate = new Date();

    if( !this.createdAt ){
        this.createdAt = currentDate;
    }

    next();
});

module.exports = deviceEventDataSchema;