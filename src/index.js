var express = require('express');
var winston = require('winston');
var expressWinston = require('express-winston');
var router = require('./router');
var bodyParser = require('body-parser');

var app = express();

// Generate logging format based on environment
const LOG_FORMAT = app.settings.env == 'development' ? winston.format.combine(
    winston.format.colorize(),
    winston.format.cli()
) : winston.format.combine(
    winston.format.json()
)


// Middleware
app.use(bodyParser.json());
app.disable('x-powered-by');

app.use(expressWinston.logger({
    transports: [
        new winston.transports.Console()
    ],
    format: LOG_FORMAT
}));


// ======= ROUTERS HERE =======
//
// ============================
app.use(process.env.PREFIX ||'/api/vehicle', router);




// Error Logger Middleware
app.use(expressWinston.errorLogger({
    transports: [
        new winston.transports.Console()
    ],
    format: LOG_FORMAT
}));

app.listen(process.env.PORT || 8080, function () {
    console.log("distric vehicle API listening on port %d in %s mode", this.address().port, app.settings.env);
});