const sendinblue = require('sendinblue-api');
const parameters = {"apiKey": process.env.SENDINBLUE_API_KEY};
const sendinObj = new sendinblue(parameters);
const Promise = require('bluebird');

exports = module.exports = {
	
	sendMail: function(to, name, title, content) {
		const data = {
			to: {
				[to]: name
			},
			from: ["donotreply@bn.fr"],
			subject: title,
			html: content,
		};
		
		return new Promise((resolve, reject) => {
			sendinObj.send_email(data, function(err, response){
				if(err) {
					console.log(err);
					reject(err);
				}
				resolve(response);
			});
		});
		
	}
	
};
