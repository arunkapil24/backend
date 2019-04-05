const mobileno = ["9159966616,7502244166,9080491006"];

module.exports = (routes, userModel, dispenserModel, dispenser_setup, message_model, msg91) => {

    // 1. System Setup - Added total napkins, remaining napkins, dispenser id By Admin
    routes.post('/new_dispenser', (req, res) => {
        const new_dispenser = new dispenserModel({
            d_id: req.body.d_id,
            total_napkin: req.body.total_napkin,
            remaining_napkin: req.body.remaining_napkin,
            admin_phone_no: req.body.admin_phone_no,
        })
        new_dispenser.save().then(response => {
            res.json({ data: response });
        }).catch((err) => {
            console.log(err)
        })
    })

    // 2. User setup - Added new user, then for every touch dispenser decreases
    routes.post('/new_user', (req, res) => {
        const new_user = new userModel({
            rfid: req.body.rfid,
            user_id: req.body.user_id,
            name: req.body.name,
            email: req.body.email
        })
        new_user.save().then(response => {
            res.json({ data: response });
        }).catch((err) => {
            console.log(err)
        })
    })


    routes.get('/get_userdata', (req, res) => {
        userModel.find({}).then((data) => {
            res.status(200).json({
                message: true,
                result: data
            })
        })
            .catch((err) => {
                res.status(404).json({
                    message: false,
                    result: err
                })
            })
    })

    routes.get('/get_disdata', (req, res) => {
        dispenserModel.find({}).then((data) => {
            res.status(200).json({
                message: true,
                result: data
            })
        })
            .catch((err) => {
                res.status(404).json({
                    message: false,
                    result: err
                })
            })
    })

    routes.put('/reset_user/:rfid', (req, res) => {
        userModel.findOneAndUpdate({ rfid: req.params.rfid }, { $set: { daily: 0, monthly: 0 } }).then(docs => {
            res.send(docs);
        })
    })

    routes.put('/reset_dispenser/:d_id/:count', (req, res) => {

        dispenserModel.findOneAndUpdate({ d_id: req.params.d_id }, { $set: { remaining_napkin: req.params.count } }).then(docs => {
            res.send(docs);
        })
    })

    // 3. User place rfid in the reader
    // If already allow, remaining napkins reduce -1
    // Dont allow
    // && (docs.daily < 3) && (docs.monthly < 15)

    routes.post('/check/:rfid/:d_id', (req, res, next) => {
        userModel.find({ rfid: req.params.rfid }).select("rfid monthly daily")
            .then(data => { //#1 then starts
                // 1. Check if the user found or not

                if (data.length > 0) {
                    // User found

                    data.map(docs => {

                        // 2. Check if the user reaches the daily and monthly count
                        if (docs.daily < 3 && docs.monthly < 15) {


                            // Not reached daily and monthly count
                            // 3. Update dispenser count by -1
                            dispenserModel.findOneAndUpdate({ d_id: req.params.d_id }, { $inc: { remaining_napkin: -1 } })
                                .then(docs => { //#2. then start

                                    // 4. Check if the dispenser is avaliable or not
                                    if (docs != null) {

                                        // Dispenser found

                                        // 4. Check if the dispenser having 10 remaining napkins
                                        if (docs.remaining_napkin == 10) {
                                            // return res.json({status:500,message:'Alert to refill'})
                                            // res.status(404).write('Alert to refill');
                                            console.log('alert');
                                            msg91.send(mobileno, "alert!!! Refill the napkins only 10 left", function (err, response) {
                                                console.log(err);
                                                console.log(response);
                                            });


                                        }

                                        // 5. Update usermodel by adding 1 in both daily and monthly count
                                        userModel.findOneAndUpdate({ rfid: req.params.rfid }, { $inc: { daily: 1, monthly: 1 } })
                                            .then(userData => {
                                                if (userData != null) {
                                                    res.json({
                                                        message: true,
                                                        data: userData
                                                    })
                                                }
                                            }).catch(err => {
                                                console.log(err);
                                            })
                                    }

                                    // Dispenser not found
                                    else {
                                        res.status(404).send('No dispenser found')
                                    }
                                })
                                // #2. then end
                                .catch(err => {
                                    res.status(500).send('use a valid dispenser id', err);
                                })
                        }

                        // Reached daily and monthly count
                        else {
                            res.status(200).send('limit reached');
                        }
                    })
                }

                // User not found
                else {
                    res.status(404).send('User not found');
                }

            })
            // #1. then end
            .catch(err => {
                res.status(404).json({
                    message: false,
                    result: "use a valid data",
                    error: err
                })
            })
    })


    routes.post('/dispenser_setup/:d_id', (req, res) => {
        const dispensers_setup = new dispenser_setup({
            rfid_module: req.query.a2,
            ir_50: req.query.a3,
            ir_10: req.query.a4,
            slot_sensor: req.query.a5,
            D_ir_l: req.query.a6,
            D_ir_R: req.query.a7,
        })
        dispensers_setup.save().then(response => {
            // console.log(response);
            res.status(200).send(response)

            const arr_response = Object.keys(response._doc).map((key) => [key, response[key]]);
            dispenserModel.find({ d_id: req.params.d_id }).select("admin_phone_no").then(response => {
                for (i = 0; i < arr_response.length; i++) {
                    for (j = 0; j < 2; j++) {
                        if (arr_response[i][j + 1] === false) {
                            response.map(rep => {
                                var msgerror = new message_model({
                                    message: `The ${arr_response[i][j]} sensor failed to work!Message sent to admin mobile ${rep.admin_phone_no}`
                                })
                                msg91.send(rep.admin_phone_no, msgerror.message, (err, res) => {
                                    // console.log(msgerror.message);
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        console.log(res);
                                        msgerror.save().then(response => {
                                        })
                                    }
                                })
                            })
                        }
                    }
                }
            })
        }).catch((e) => {
            res.status(400).send(e);
        })
    })

    // routes.post('/system_setup/:d_id', (req, res, next) => {
    //     dispenserModel.find({ d_id: req.params.d_id })
    //         // .select('d_id')
    //         .then(docs => {
    //             docs.map(data => {
    //                 console.log(data)
    //             })

    //         })
    //         .catch(err => {
    //             console.log(err);
    //         })
    // })
    return routes;
}
