const Model = require("../models/captcha.model");
const NORMAL_USER_PERMISSION = require("../../../../common/config/env.config")["permissionLevels"][
    "NORMAL_USER"
];
const crypto = require("crypto");
const { v1: uuidv1, v4: uuidv4 } = require("uuid");

const Utils = require("../../../../common/middlewares/utils.middleware");
const SecurityUtils = require("../../../../common/middlewares/sec.middleware");

exports.get = async (req, res) => {
    try {

        return res.status(200).send();
    } catch (ex) {
        return res.status(500).send({ error: "Something went wrong!" });
    }
};

exports.verify = async (req, res) => {
    try {

        return res.status(200).send();
    } catch (ex) {
        return res.status(500).send({ error: "Something went wrong!" });
    }
};
