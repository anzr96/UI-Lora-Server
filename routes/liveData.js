let deviceSchema = require('../models/device');
let sensorSchema = require('../models/sensor');
let deviceSensorDataSchema = require('../models/deviceSensorData');

let Router = require('express');
let router = Router();
let { connect, model } = require('mongoose');
connect('mongodb://localhost:27017/lora_server',{ useNewUrlParser: true });

let deviceModel = model("DeviceModel", deviceSchema);
let sensorModel = model("SensorModel", sensorSchema);
let deviceSensorDataModel = model("DeviceSensorDataModel", deviceSensorDataSchema);

router.get('/get_light/', function(req, res, next) {

    deviceModel.find({}).
    exec(function (err, devices) {
        if (err) return handleError(err);

        let nodes = [];
        devices.forEach(device => {
            (device.sensors).forEach(sensor => {
                if(sensor.name === "light"){
                    let node = {};
                    node.name = device.devaddr;
                    node.data = [];

                    for(var i = sensor.data.length - 1; i > sensor.data.length - 20 && i > 0 ; i--){
                        node.data.push([sensor.data[i].date, sensor.data[i].value])
                    }
                    nodes.push(node);
                }
            });
        });

        res.send(nodes);
    });
});

router.get('/get_light/:time', function(req, res, next) {

    deviceModel.find({}).
    exec(function (err, devices) {
        if (err) return handleError(err);

        let nodes = [];
        devices.forEach(device => {
            (device.sensors).forEach(sensor => {
                if(sensor.name === "light"){
                    let node = {};
                    node.name = device.devaddr;
                    node.data = [];

                    sensor.data.forEach(data => {
                        if (data.date > new Date(req.params.time).getTime()){
                            node.data.push([data.date, data.value]);
                        }
                    });

                    nodes.push(node);
                }
            });
        });

        res.send(nodes);
    });
});

router.get('/get_temp/', function(req, res, next) {
    deviceModel.find({}).
    exec(function (err, devices) {
        if (err) return handleError(err);

        let nodes = [];

        devices.forEach(device => {
            (device.sensors).forEach(sensor => {
                if(sensor.name === "temp"){
                    let node = {};
                    node.name = device.devaddr;
                    node.data = [];

                    for(var i = sensor.data.length - 1; i > sensor.data.length - 20 && i > 0 ; i--){
                        node.data.push([sensor.data[i].date, sensor.data[i].value])
                    }
                    console.log(node);
                    nodes.push(node);
                }
            });
        });

        console.log(nodes);

        res.send(nodes);
    });
});

router.get('/get_temp/:time', function(req, res, next) {
    console.log("temp");
    deviceModel.find({}).
    exec(function (err, devices) {
        if (err) return handleError(err);

        let nodes = [];

        devices.forEach(device => {
            (device.sensors).forEach(sensor => {
                if(sensor.name === "temp"){
                    let node = {};
                    node.name = device.devaddr;
                    node.data = [];

                    sensor.data.forEach(data => {
                       if (data.date > new Date(req.params.time).getTime()){
                           node.data.push([data.date, data.value]);
                       }
                    });


                    nodes.push(node);
                }
            });
        });

        res.send(nodes);
    });
});

function handleError(err){
    console.log(err.toString());
}

module.exports = router;