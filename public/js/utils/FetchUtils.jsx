import 'whatwg-fetch'

const BASE_URL = "/api";

function postCall(promise, callback) {
	promise.then(res => {
		return res.json();
	})
		.then(json => {
			if (callback && callback.success)
				callback.success(json);
		})
		.catch(function (ex) {
			console.log('fetch failed', ex);
			if (callback && callback.fail)
				callback.fail(String(ex));
		});
}

function call(type, url, object, callback) {
	postCall(fetch(url, {
		method: type,
		credentials: 'same-origin',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(object)
	}), callback);
}

function post(section, action, object, callback) {
	call('POST', BASE_URL + '/' + section + '/' + action, object, callback);
}

function postUpload(section, action, files, object, callback) {

	const data = new FormData();
	
	let i = 1;
	for(const file of files) {
		data.append('file' + i, file);
		i++;
	}

	for (const property in object) {
		if (object.hasOwnProperty(property)) {
			data.append(property, object[property]);
		}
	}

	postCall(fetch(BASE_URL + '/' + section + '/' + action, {
		method: 'POST',
		credentials: 'same-origin',
		body: data
	}), callback);
}

export {
	post,
	postUpload
};
