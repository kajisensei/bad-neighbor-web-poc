const sendinblue = require('sendinblue-api');
const parameters = {"apiKey": process.env.SENDINBLUE_API_KEY};
const sendinObj = new sendinblue(parameters);
const Promise = require('bluebird');
const pug = require('pug');

exports = module.exports = {

	sendMail: function(to, name, title, template, templateData) {
		const request = require("request");

		const fn = pug.compileFile(`server/mailin/${template}`);
		const html = fn(templateData);

		const options = { method: 'POST',
			url: 'https://api.sendinblue.com/v3/smtp/email',
			headers: {
				["api-key"]: process.env.SENDINBLUE_API_KEY
			},
			body:
				{ sender: { email: process.env.SENDINBLUE_FROM },
					to: [ { email: to, name: name } ],
					htmlContent: html,
					subject: title,
					replyTo: { email: process.env.SENDINBLUE_FROM } },
			json: true };

		return new Promise((resolve, reject) => {
			request(options, function (error, response, body) {
				if (error){
					console.log(err);
					reject(error);
				}

				resolve(body);
			});
		});
		
	}
	
};
