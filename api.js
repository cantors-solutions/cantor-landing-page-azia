const mailChimpApiKey = "828e16047954e6e00b11efcbda8dc8ec-us1";

const audienceListKey = "7a1d5a5039";

const Mailchimp = require('mailchimp-api-v3')

const mailchimp = new Mailchimp(mailChimpApiKey);

const express = require('express');

const router = express.Router();

const Bugsnag = require('@bugsnag/js')


// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
    console.log('Time: ', Date.now());
    next();
});

// define the home page route
router.post('/subscribe', function (req, res) {
    const {
        email
    } = req.body;

    // Fetch user, if already subscribed, tell that he already is subscribed


    mailchimp.post(`/lists/${audienceListKey}/members`, {
        email_address : email,
        status : 'pending',
        merge_vars: {
            EMAIL: email,
        }
    }).then(function (result) {
        return res.status(200).json({
            success: true,
        });
    }).catch(function (err) {
        console.error(err);

        const {
            status,
            title
        } = err;

        if (status == 400 && String(title).includes("Exists")) {
            Bugsnag.notify(new Error(err.message));

            return res.status(204).json({
                success: true,
            });
        } else {
            Bugsnag.notify(new Error(err.message));

            return res.status(500).json({
                success: false,
                error: err.message,
            });
        }
    });
});

module.exports = router;

