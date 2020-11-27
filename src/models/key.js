const mongoose = require("mongoose");
const randomize = require("randomatic");
const Cryptr = require("cryptr");
const cryptr = new Cryptr(process.env.CRYPTR_SALT);

const defaultErrMessage = require("../db/mongoose_message");

const keySchema = new mongoose.Schema(
	{
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			required: [true, defaultErrMessage.required],
			ref: "User",
		},
		type: {
			type: String,
			required: [true, defaultErrMessage.required],
			uppercase: true,
			validate(value) {
				account_status = ["VERIFYEMAILADDRESS", "VERIFYPHONENUMBER"];
				if (!account_status.includes(value)) {
					throw new Error("StatusValueNotIdentified");
				}
			},
		},
		status: {
			type: String,
			required: [true, defaultErrMessage.required],
			uppercase: true,
			default: "ACTIVE",
			validate(value) {
				account_status = ["ACTIVE", "USED", "EXPIRED"];
				if (!account_status.includes(value)) {
					throw new Error("StatusValueNotIdentified");
				}
			},
		},
		value: {
			type: String,
			required: [true, defaultErrMessage.required],
		},
		response: {
			type: String,
		},
		expiredAt: {
			type: Date,
			required: [true, defaultErrMessage.required],
		},
	},
	{
		timestamps: true,
	}
);

/**
 * Find active key if available. If not generate a new key
 * @param {String} user_id : authenticated user's id
 * @param {String} type : VERIFYEMAILADDRESS or VERIFYPHONENUMBER
 */
keySchema.statics.findByType = async function (user_id, type) {
	let value = undefined;
	let key = await Key.findOne({ user_id, type, status: "ACTIVE" });

	if (!key) {
		//* Key not found

		value = randomize("Aa0", 32); // Generate random alphanumeric
		value = cryptr.encrypt(value); // Encrypt value

		const expiredAt = new Date(new Date().getTime() + 30 * 60000); // Expired in 30 minutes

		key = new Key({
			user_id,
			type,
			value,
			expiredAt,
		});
		await key.save();
	}

	return key;
};

const Key = mongoose.model("Key", keySchema);

module.exports = Key;
