import 'whatwg-fetch'

const BASE_URL = "/api";

function call(type, url, object, callback) {
	fetch(url, {
		method: type,
		credentials: 'same-origin',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(object)
	})
		.then(res => {
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

function post(section, action, object, callback) {
	call('POST', BASE_URL + '/' + section + '/' + action, object, callback);
}

export {
	post
};
