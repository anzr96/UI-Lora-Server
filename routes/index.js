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
let {connect, model} = require('mongoose');
// connect('mongodb://localhost:27017/lora_server',{ useNewUrlParser: true });

let deviceModel = model("DeviceModel", deviceSchema);
let sensorModel = model("SensorModel", sensorSchema);
let deviceSensorDataModel = model("DeviceSensorDataModel", deviceSensorDataSchema);

/* GET home page. */
router.get('/', authenticated, function (req, res, next) {
    let nodes = [];
    let total_nodes, total_sensors, total_users;

    deviceModel.find({}).exec(function (err, devices) {
        if (err) return handleError(err);

        total_nodes = devices.length;

        let i = 1;
        devices.forEach(device => {
            var node = {};
            node.id = i++;
            node.devaddr = device.devaddr;

            if (total_sensors === undefined)
                total_sensors = device.sensors.length;
            else
                total_sensors += device.sensors.length;

            (device.sensors).forEach(sensor => {
                if (sensor.name === "light") {
                    node.light = sensor.data[0].value;
                } else {
                    node.temp = sensor.data[0].value;
                }
            });

            node.online = ((new Date()) - device.lastDateModified) < 10 * 60 * 1000; // less than 10 minutes
            nodes.push(node);
        });

        return res.render('pages/index', {
            total_nodes: total_nodes,
            total_sensors: total_sensors,
            total_users: 1,
            general: general_parameters(req),
            nodes: nodes
        });


    });

});

router.get('/profile', authenticated, next_url, function (req, res, next) {
    console.log(req.next_url);
    res.render('pages/profile', {user: req.user, general: general_parameters(req) });
});

router.post('/profile', authenticated, function (req, res, next) {

    User.findOne({username: req.body.username}, function (err, user) {
        if (err) {
            return res.render('pages/profile', {user: req.user});
        }


        user.name = req.body.name;
        user.company = req.body.company;
        user.phone_number = req.body.phone_number;
        console.log("profile");
        user.save();

        return res.render('pages/profile', {user: user});
    }).catch(function (error) {
        res.status(400).send('Error');
    });
});

function handleError(err) {
    console.log(err.toString());
}

module.exports = router;