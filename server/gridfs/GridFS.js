const fs = require('fs');
const keystone = require('keystone');
const mongoose = require('mongoose');
const Grid = require('gridfs-stream');
const Promise = require("bluebird");
Grid.mongo = mongoose.mongo;

const getGridFSInstance = (success, error) => {
	const conn = mongoose.createConnection(keystone.get("mongo"));
	conn.once('open', function (err) {
		if (err) {
			return error(err);
		}

		const gfs = Grid(conn.db);

		success(gfs, conn);
	});
};

exports = module.exports = {

	add: function (file, callback) {

		getGridFSInstance(gfs => {

			// First, remove previous if existing.
			const options = {
				filename: file.filename
			};

			gfs.remove(options, function (err) {
				if (err)
					return callback(err);

				// Then add the new file
				const writestream = gfs.createWriteStream({
					filename: file.filename,
					content_type: file.mimetype
				});

				writestream.on('close', function (file) {
					callback(null, file._id);
				});

				fs.createReadStream(file.path).pipe(writestream);
			});

		}, err => callback(err));

	},

	get: function (filename, res, req) {

		getGridFSInstance((gfs, conn) => {

			const options = {
				filename: filename
			};

			gfs.findOne(options, (err, file) => {
				if (err)
					return res.status(400).send(err);
				if (!file) {
					if (req.query["default"] === "avatar") {
						return res.sendFile("/default_avatar.png", {root: __dirname});
					} else {
						return res.status(404).send('');
					}
				}


				res.setHeader('Cache-Control', 'public, max-age=10');
				res.setHeader('Content-Type', file.contentType);
				res.setHeader('ETag', file.md5);

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

		}, err => res.status(400).send(err));

	},

	findFiles: (query, currentPage) => {

		const images_per_page = 16;

		return new Promise((resolve, reject) => {

			getGridFSInstance((gfs, conn) => {

				const q = gfs.files.find(query).sort({"filename": 1});

				if (currentPage) {
					q.skip(currentPage > 0 ? (currentPage - 1) * images_per_page : 0).limit(images_per_page)
				}

				q.toArray((err, files) => {
					if (err) return reject(err);

					resolve(files);

				});

			}, err => reject(err));

		});
	},

	count: (query) => {

		return new Promise((resolve, reject) => {

			getGridFSInstance((gfs, conn) => {

				const q = gfs.files.count(query, (err, count) => {
					if (err) return reject(err);

					resolve(count);
				});

			}, err => reject(err));

		});
	},

	remove: function (filename) {
		return new Promise(function (resolve, reject) {

			getGridFSInstance((gfs, conn) => {

				const options = {
					filename: filename
				};

				gfs.remove(options, function (err) {
					if (err)
						return reject(err);

					resolve();
				});

			}, err => reject(err));

		});

	},

};
