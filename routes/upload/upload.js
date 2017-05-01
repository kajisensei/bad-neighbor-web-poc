const fs = require('fs');

exports = module.exports = {

	add: function (req, res) {

		const mongoose = require('mongoose');
		const Grid = require('gridfs-stream');
		Grid.mongo = mongoose.mongo;

		const conn = mongoose.createConnection(keystone.get("mongo"));
		
		const user = req.user.key;
		const fileName = req.files.qqfile;

		conn.once('open', function (err) {
			
			if (err) {
				return res.err(err);
			}

			const gfs = Grid(conn.db);

			const writestream = gfs.createWriteStream({
				filename: 'my_file.txt'
			});

			writestream.on('close', function (file) {

				res.status(200).send({'success': 'true'});

				conn.close();
			});

			fs.createReadStream(req.files.qqfile.path).pipe(writestream);

		});


	},

	remove: function (req, res) {


		res.status(200).send({
			"success": true
		}).end();

	},

};
