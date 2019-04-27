let deviceSchema = require('../models/device');
let sensorSchema = require('../models/sensor');
let deviceSensorDataSchema = require('../models/deviceSensorData');
let User = require('../models/Users');
let passport = require('passport');
let authenticated = require('./authenticated');
let next_url = require('./nexturl');
let general_parameters = require('./general_parameters');

let Router = require('express');
let router = Router();
let { connect, model } = require('mongoose');
connect('mongodb://localhost:27017/lora_server',{ useNewUrlParser: true });

let deviceModel = model("DeviceModel", deviceSchema);
let sensorModel = model("SensorModel", sensorSchema);
let deviceSensorDataModel = model("DeviceSensorDataModel", deviceSensorDataSchema);

router.get('/nodes', authenticated, function(req, res, next) {

    deviceModel.find({}).
    exec(function (err, devices) {
        if (err) return handleError(err);

        let nodes = [];
        devices.forEach(device => {
            (device.sensors).forEach(sensor => {
                (sensor.data).forEach(data => {
                    let node = {};
                    node.devaddr = device.devaddr;
                    node.sensor = sensor.name;
                    node.value = data.value;
                    node.date = data.date.toISOString().replace(/T/, ' ').replace(/\..+/, '');
                    nodes.push(node);
                });
            });
        });

        res.render('pages/live_nodes',{
            nodes: nodes,
            general: general_parameters(req)
        });
    });
});

/* GET home page. */
router.post('/nodes', authenticated, function(req, res, next) {
    console.log(req.body);
    console.log(req.body.p);
    let array = req.body.p;

    /*array.forEach(element => {

        deviceModel.findOne({devaddr: element.devaddr}, function(err, device){
            if (err) return handleError(err);

            if(device === undefined){
                res.status(404);
    
                res.json({message: "node not found", type: "fail"});
                return;
            }

            if(device.sensors === undefined){
                res.status(404);
    
                res.json({message: "node does not have your selected sensor", type: "fail"});
                return;
            }

            console.log(device.sensors[0].data);
        });

    });
    DeviceUplink.find({}).
    select('devaddr light temp date').
    exec(function (err, device) {
        if (err) return handleError(err);
        res.status(200).send(JSON.stringify(device));
    });
    
    var nodes = [];
    var node = {};
    node.id = 1;
    node.devaddr = "1111111";
    node.temp = "25";
    node.light = "65%";
    node.online = true;
    nodes.push(node);

    node = {}
    node.id = 2;
    node.devaddr = "22222";
    node.temp = "21";
    node.light = "25%";
    node.online = true;
    nodes.push(node);

    console.log(nodes);

    res.render('pages/live_node',{
        total_nodes: 2, 
        total_sensors: 2,
        nodes: nodes
    });*/


    res.json({message: "internal error", type: "fail"});

});

router.get('/sensors', authenticated, function(req, res, next) {
    res.render('pages/live_sensors',{general: general_parameters(req)});
});

function handleError(err){
    console.log(err.toString());
}

module.exports = router;