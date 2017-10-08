const sendinblue = require('sendinblue-api');
const parameters = {"apiKey": process.env.SENDINBLUE_API_KEY};
const sendinObj = new sendinblue(parameters);
const Promise = require('bluebird');

exports = module.exports = {

	sendMail: function(to, name, title, content) {
		const request = require("request");

		const options = { method: 'POST',
			url: 'https://api.sendinblue.com/v3/smtp/email',
			headers: {
				["api-key"]: process.env.SENDINBLUE_API_KEY
			},
			body:
				{ sender: { email: process.env.SENDINBLUE_FROM },
					to: [ { email: to, name: name } ],
					htmlContent: content,
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
