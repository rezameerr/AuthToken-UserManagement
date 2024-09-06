"use strict";

const AuthMgnt = require("../../../../common/middlewares/auth.mgnt.middleware");
const Utils = require("../../../../common/middlewares/utils.middleware");
const SecUtils = require("../../../../common/middlewares/sec.middleware");

exports.statusConnection = (req, res) => {
    try {
        res.status(200).send();
    } catch (ex) {
        res.status(500).send({ error: "Something went wrong!" });
    }
};
