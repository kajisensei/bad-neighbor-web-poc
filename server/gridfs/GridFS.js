const fs = require('fs');
const keystone = require('keystone');
const mongoose = require('mongoose');
const Grid = require('gridfs-stream');
Grid.mongo = mongoose.mongo;

exports = module.exports = {

	add: function (file, callback) {

		const conn = mongoose.createConnection(keystone.get("mongo"));

		conn.once('open', function (err) {

			if (err) {
				return callback(err);
			}

			const gfs = Grid(conn.db);

			// First, remove previous if existing.
			const options = {
				filename: file.filename
			};

			gfs.remove(options, function (err) {
				if (err)
					return callback(err);

				// Then add the new file
				const writestream = gfs.createWriteStream(options);

				writestream.on('close', function (file) {
					callback(null, file._id);
				});

				fs.createReadStream(file.path).pipe(writestream);
			});

		});

	},

	get: function (filename, res, req) {
		const conn = mongoose.createConnection(keystone.get("mongo"));

		conn.once('open', function (err) {
			if (err)
				return res.status(400).send(err);

			const gfs = Grid(conn.db);
			const options = {
				filename: filename
			};

			gfs.findOne(options, (err, file) => {
				if (err)
					return res.status(400).send(err);
				if (!file)
					return res.status(404).send('');

				res.set('Cache-Control', 'public, max-age=180');
				res.set('Content-Type', file.contentType);
				res.set('Content-Disposition', 'attachment; filename="' + file.filename + '"');
				res.set('ETag', file.md5);

				const md5 = req.headers["if-none-match"];
				if (md5 && md5 === file.md5) {
					return res.status(304).end();
				}

				const readstream = gfs.createReadStream({
					_id: file._id
				});

				readstream.on("error", function (err) {
					console.log("Got error while processing stream " + err.message);
					res.status(400).send(err);
					conn.close();
				});
				readstream.on("close", function (err) {
					res.end();
					conn.close();
				});

				readstream.pipe(res);

			});

		});

	},

	remove: function (req, res) {


		res.status(200).send({
			"success": true
		}).end();

	},

};
