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


/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: req });
// });

router.use('/:devaddr', function (req, res) {
    console.log(req.body);
    let data = req.body.data;

    const convert = (from, to) => {
        return str => {
            return Buffer.from(str, from).toString(to);
        };
    };
    const hexToUtf8 = convert('hex', 'utf8');

    data = hexToUtf8(data).split(' ');

    deviceModel.findOne({devaddr: req.body.devaddr}, function(err, device){
        if(err) throw err;

        if (device === null || device === undefined) {
            console.log("device " + req.body.devaddr + " not found!");

            device = new deviceModel({
                devaddr: req.body.devaddr,
                sensors: [],
                events: []
            });

            device.save(function (err, deviceModel) {
                if (err){
                    res.status(500);

                    console.log("error: ", err);
                    res.json({message: "internal error", type: "fail"});
                    throw err;
                }  else {
                    console.log("device " + req.body.devaddr + " created");
                    console.log(device);
                    return device;
                }
            });
        }else {
            console.log("inja");
            return device;
        }

    }).then((device) => {
        console.log(device);
        if(device.sensors === null || device.sensors === undefined || device.sensors.length === 0){
            console.log("sensors null");

            device.sensors.push({name:"light"});
            device.sensors.push({name:"temp"});

            device.save(function (err, deviceModel) {
                if (err) {
                    res.status(500);

                    console.log("error: ", err);
                    res.json({message: "internal error", type: "fail"});
                    throw err
                } else {
                    console.log("sensors to device " + req.body.devaddr + " created");
                }

            });
        }

        return device;
    }).then((device) => {
        device.sensors.forEach(sensor => {
            if(sensor.name === "light"){
                let deviceSensorData = new deviceSensorDataModel({
                    value: data[0],
                    date: req.body.datetime
                });

                sensor.data.push(deviceSensorData);
            }else if(sensor.name === "temp"){
                let deviceSensorData = new deviceSensorDataModel({
                    value: Number(data[1].replace(/\0/g, '')),
                    date: req.body.datetime
                });

                sensor.data.push(deviceSensorData);
            }
        });

        device.save(function (err, deviceModel) {
            if (err) {
                res.status(500);

                console.log("error: ", err);
                res.json({message: "internal error", type: "fail"});
                throw err
            } else {
                console.log("sensors data to device " + req.body.devaddr + " created");
                return res.json({message: "New device added", type: "success", device: deviceModel});
            }
        })
    }).catch((error) => {
        console.log(error);

        res.send('Error 400!');
    });
});

module.exports = router;
