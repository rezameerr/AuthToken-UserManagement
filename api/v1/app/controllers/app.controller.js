const UserModel = require("../models/app.model");
const NORMAL_USER_PERMISSION = require("../../../../common/config/env.config")["permissionLevels"][
    "NORMAL_USER"
];
const Utils = require("../../../../common/middlewares/utils.middleware");

exports.settings = (req, res) => {};

exports.latest_version = async (req, res) => {
    try {
        res.status(200).send({ data: "1.0.0" });
    } catch (ex) {
        res.status(500).send({ error: "Something went wrong!" });
    }
};

exports.terms = async (req, res) => {};

exports.privacy = async (req, res) => {};

exports.about = async (req, res) => {};

exports.contact_info = async (req, res) => {};

exports.timestamp = async (req, res) => {
    try {
        res.status(200).send({ data: Utils.getUTCDateTimestamp() });
    } catch (ex) {
        res.status(500).send({ error: "Something went wrong!" });
    }
};
