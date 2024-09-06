const mongoose = require("../../../../common/services/mongoose.service").mongoose;
const Schema = mongoose.Schema;

const verification_codeSchema = new Schema({
    uuid: String,
    mobile_number: String,
    verification_code: String,
    not_valid_before: String,
    expire_after: String,
    doc_ver: String,
});

verification_codeSchema.virtual("id").get(function () {
    return this._id.toHexString();
    //return this._id;
});

// Ensure virtual fields are serialised.
verification_codeSchema.set("toJSON", {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id;
    },
});

verification_codeSchema.findById = function (cb) {
    return this.model("verification_codes").find(
        {
            id: this.id,
        },
        cb
    );
};

const VerificationCode = mongoose.model("verification_codes", verification_codeSchema);

exports.findByMobileNumber = async (mobile_number) => {
    try {
        return VerificationCode.find({
            mobile_number: mobile_number,
        }).then((result) => {
            return result;
        });
    } catch (ex) {}

    return null;
};

exports.findById = async (id) => {
    return VerificationCode.findById(id).then((result) => {
        result = result.toJSON();
        //delete result._id;
        //delete result.__v;
        return result;
    });
};

exports.create = (data) => {
    const verificationCode = new VerificationCode(data);
    return verificationCode.save();
};

exports.update = async (id, data) => {
    return VerificationCode.findOneAndUpdate(
        {
            _id: id,
        },
        {
            $set: data,
        },
        {
            new: true,
        }
    );
};

exports.removeById = async (id) => {
    return new Promise((resolve, reject) => {
        VerificationCode.deleteMany(
            {
                _id: id,
            },
            (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(err);
                }
            }
        );
    });
};

exports.removeByMobileNumber = async (mobile_number) => {
    return new Promise((resolve, reject) => {
        VerificationCode.deleteMany(
            {
                mobile_number: mobile_number,
            },
            (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(err);
                }
            }
        );
    });
};