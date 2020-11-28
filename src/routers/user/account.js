const express = require("express");

const Key = require("../../models/key");
const EmailOutbox = require("../../models/email_outbox");
const api = require("../../middleware/api");
const auth = require("../../middleware/auth");
const v = require("../../validations");

const router = new express.Router();

/**
 ** Update authenticated user account
 * PATCH /users
 * @param: full_name
 * @param: current_address
 * @param: email_address
 * @param: phone_number
 * @param: password
 */
router.patch(
	"/users",
	v.updateAccountRules,
	api.setResponseTemplate,
	api.inputBodyValidator,
	auth,
	async (req, res) => {
		// Check if only desired parameter provided
		const updates = Object.keys(req.body);
		const allowedUpdates = [
			"full_name",
			"current_address",
			"email_address",
			"phone_number",
			"password",
		];
		const isValidOperation = updates.every((update) =>
			allowedUpdates.includes(update)
		);

		if (!isValidOperation) {
			res.respMessage.message = req.t("InvalidOperation");
			return res.status(400).send(res.respMessage);
		}

		try {
			updates.forEach((update) => (req.user[update] = req.body[update]));
			await req.user.save();

			res.respMessage.success = true;
			res.respMessage.message = req.t("ProcessSuccess");
			res.respMessage.data = req.user;
			return res.status(200).send(res.respMessage);
		} catch (e) {
			res.respMessage = api.errorManipulator(e, req, res.respMessage);
			return res.status(400).send(res.respMessage);
		}
	}
);

/**
 ** Request email verification on account
 * GET /users/email_request
 */
router.get(
	"/users/email_request",
	api.setResponseTemplate,
	auth,
	async (req, res) => {
		if (req.user.email_address_verify_status == "VERIFIED") {
			//* Check if email_address_verify_status is already "VERIFIED"
			res.respMessage.message = req.t("AccountEmailAddressVerified");
			return res.status(400).send(res.respMessage);
		}

		const key = await Key.findByType(req.user._id, "VERIFYEMAILADDRESS");

		let email_outbox = await EmailOutbox.findByRecipient(
			req.user.email_address
		);

		if (email_outbox) {
			//* Email outbox found

			const created = new Date(email_outbox.createdAt);
			const now = new Date();

			let dif = now - created;
			dif = Math.round(dif / 1000 / 60); // difference in minutes

			if (dif <= 5) {
				res.respMessage.data = dif;
				res.respMessage.message = req.t("RequestQueueProgress5Minutes");
				return res.status(400).send(res.respMessage);
			}
		}

		//* Minified html of email body
		let body =
			"<!DOCTYPE html><html lang='en'><head><style>@media only screen and (max-width: 700px){#container{margin:0px !important}}</style></head><body style=' background-color: #fff; margin: 40px; font: 13px/20px normal Helvetica, Arial, sans-serif; color: #4F5155; '><div id='container' style='max-width: 100%; margin: 0 100px; border: 1px solid #D0D0D0; box-shadow: 0 0 8px #D0D0D0;'><h1 style='color: #444; background-color: transparent; font-size: 30px; font-weight: 600; margin: 0 0 14px 0; padding: 14px 15px 10px 15px;'> NodeJS: Verify your email address</h1><div style='width: 50%; height: 15px; background: #007bff; margin: 0 15px;'></div><div style='margin: 0 15px 0 15px;'><p>Please click this button below to verify your email address</p> <a style='display: inline-block; font-weight: 400; text-align: center; white-space: nowrap; vertical-align: middle; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; border: 1px solid transparent; padding: .375rem .75rem; font-size: 1rem; line-height: 1.5; border-radius: .25rem; cursor: pointer; color: #fff; background-color: #007bff; border-color: #007bff; text-decoration: none;' target='_blank' href='[VERIFICATION_LINK]'>Verify Email Address</a><p>If the button didn't work, you can follow this link:</p> <a style='color: #003399; background-color: transparent; font-weight: normal; overflow-wrap: break-word;' target='_blank' href='[VERIFICATION_LINK]'>[VERIFICATION_LINK]</a><p>Regards,</p><p>NodeJS Teams</p></div><p style='text-align: right; font-size: 11px; border-top: 1px solid #D0D0D0; line-height: 32px; padding: 0 10px 0 10px; margin: 20px 0 0 0;'> Copyright &copy; 2018 NodeJS.com</p></div></body></html>";

		//* Insert verification link to body
		const verification_link = `localhost:2020?key=${key.value}&email=${req.user.email_address}`;
		body = body.replace("[VERIFICATION_LINK]", verification_link);

		email_outbox = new EmailOutbox({
			sender: "no-reply@nodejs.com",
			sender_name: "NodeJS - noreply",
			recipient: req.user.email_address,
			recipient_name: req.user.full_name,
			subject: "NodeJS - Lets verify your email address",
			body,
		});
		await email_outbox.save();

		res.respMessage.success = true;
		res.respMessage.message = req.t("ProcessSuccess");
		return res.status(200).send(res.respMessage);
	}
);

module.exports = router;
