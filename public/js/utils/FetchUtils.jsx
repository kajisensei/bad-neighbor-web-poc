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

function postUpload(section, action, input, object, callback) {

	const data = new FormData();
	data.append('file', input.files[0]);

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
