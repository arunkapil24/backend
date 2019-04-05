const express = require('express'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    cors = require('cors'),

    msg91 = require("msg91")("240451As0jxQpqp5c304491", "SPIALT", "4"),

    routes = express.Router(),
    port = process.env.PORT || 3000,

    // Models
    dispenserModel = require('./models/dispenser')(mongoose),
    userModel = require('./models/user')(mongoose),
    dispenser_setup = require('./models/dis_setup')(mongoose),
    message_model = require('./models/errormsg')(mongoose),
    // Routes
    mainRoute = require('./routes/dis_route')(routes, userModel, dispenserModel, dispenser_setup, message_model, msg91),
    app = express();




//mongoose database connection
mongoose.connect(`mongodb+srv://root:Ii3DI6cuKTCCmFme@cluster0-0gufz.mongodb.net/ispine`, { useNewUrlParser: true })

    .then(() => {
        console.log("connected to database");
    })
    .catch(err => {
        console.log(err);
    })


app.use(bodyParser.json());
app.use(cors());

app.use('/data', mainRoute);
// app.use('/api/ispine_data', mainRoute);


app.listen(port, () => {
    console.log(`Server is started in ${port}`);
})
