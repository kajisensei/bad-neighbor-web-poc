const keystone = require('keystone');
const User = keystone.list('User');
const Jimp = require('jimp');

exports = module.exports = (req, res) => {

	const view = new keystone.View(req, res);
	const locals = res.locals;

	let name = req.params["name"];
	let title = req.params["title"];
	let source = 'public/base.png';
	let destination = 'public/ftp/signs/done.png';
	let loadedImage;

	Jimp.read(source)
		.then(function (image) {
			loadedImage = image;
			return Jimp.loadFont(Jimp.FONT_SANS_16_WHITE);
		})
		.then(function (font) {
			return loadedImage.print(font, 200, 127, `${name}  -  ${title}`, 200)
				.write(destination);
		})
		.then(() => view.render('web/sign_generator'))
		.catch(function (err) {
			console.error(err);
			return res.err(err, err.name, err.message);
		});
	 
};
