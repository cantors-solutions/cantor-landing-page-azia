const port = process.env.PORT || 3000;

const express = require('express');

const Bugsnag = require('@bugsnag/js')

const BugsnagPluginExpress = require('@bugsnag/plugin-express')

Bugsnag.start({
    apiKey: 'f1c27354b6ccec2dba4a390c3fa67a00',
    plugins: [BugsnagPluginExpress]
});

const bugsnagMiddleware = Bugsnag.getPlugin('express');

const body = require('body-parser');

const app = express();

// This must be the first piece of middleware in the stack.
// It can only capture errors in downstream middleware
app.use(bugsnagMiddleware.requestHandler);

app.use(function(request, response, next) {
    app.enable('trust proxy');

    if (process.env.NODE_ENV != 'development' && !request.secure) {
        return response.redirect("https://" + request.headers.host + request.url);
    }

    next();
});

const apiRouter = require('./api');

// parse application/x-www-form-urlencoded
app.use(body.urlencoded({ extended: false }));

// parse application/json
app.use(body.json());

app.use('/assets', express.static('public'));

app.use('/api', apiRouter);

app.get('/', function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
});

app.get('/privacy-policy', function (req, res) {
    res.sendFile(process.cwd() + '/views/privacy-policy.html');
});

app.get('/terms-of-use', function (req, res) {
    res.sendFile(process.cwd() + '/views/terms-of-use.html');
});

app.use(bugsnagMiddleware.errorHandler);

app.listen(port, function () {
    console.log("Starting landing page server on port: ", port);

});