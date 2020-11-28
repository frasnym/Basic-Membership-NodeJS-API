const mongoose = require("mongoose");
const validator = require("validator");

const defaultErrMessage = require("../db/mongoose_message");

const emailOutboxSchema = new mongoose.Schema(
	{
		sender: {
			type: String,
			required: [true, defaultErrMessage.required],
			trim: true,
			lowercase: true,
			validate(value) {
				if (!validator.isEmail(value)) {
					throw new Error("InvalidEmailAddressFormat");
				}
			},
		},
		sender_name: {
			type: String,
			required: [true, defaultErrMessage.required],
		},
		recipient: {
			type: String,
			required: [true, defaultErrMessage.required],
			trim: true,
			lowercase: true,
			validate(value) {
				if (!validator.isEmail(value)) {
					throw new Error("InvalidEmailAddressFormat");
				}
			},
		},
		recipient_name: {
			type: String,
			required: [true, defaultErrMessage.required],
		},
		subject: {
			type: String,
			required: [true, defaultErrMessage.required],
		},
		body: {
			type: String,
			required: [true, defaultErrMessage.required],
		},
		status: {
			type: String,
			required: [true, defaultErrMessage.required],
			uppercase: true,
			default: "INQUIRY",
			validate(value) {
				account_status = ["INQUIRY", "SUCCESS", "FAILED"];
				if (!account_status.includes(value)) {
					throw new Error("StatusValueNotIdentified");
				}
			},
		},
		response: {
			type: String,
		},
	},
	{
		timestamps: true,
	}
);

/**
 * Find inquiry email_outbox by user's email
 * @param {String} recipient : authenticated user's email
 */
emailOutboxSchema.statics.findByRecipient = async function (recipient) {
	const email_outbox = await EmailOutbox.findOne({
		recipient,
		status: "INQUIRY",
	}).sort({ createdAt: -1 }); // Get last inserted value

	return email_outbox;
};

const EmailOutbox = mongoose.model("Email_Outbox", emailOutboxSchema);

module.exports = EmailOutbox;
