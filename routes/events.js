let eventSchema = require('../models/event');

let { Router } = require('express');
var router = Router();
let { connect, model } = require('mongoose');
connect('mongodb://localhost:27017/lora_server',{ useNewUrlParser: true });

let event = model("Event", eventSchema);

router.use('/:devaddr', function (req, res) {
    console.log("event");
    try {
        let events = new event({
            devaddr: req.body['devaddr'],
            app: req.body['app'],
            date: req.body['datetime'],
            event: req.body['event']
        });

        events.save(function (err, Event) {
            if (err){
                res.status(500);

                console.log("error: ", err)
                //res.json({message: "internal error", type: "fail"});
            }  else {
                //res.json({message: "New advertise added", type: "success", advertise: newAdv});
            }
        });
    }catch (e) {
        console.log(e);
    }
});

module.exports = router;
