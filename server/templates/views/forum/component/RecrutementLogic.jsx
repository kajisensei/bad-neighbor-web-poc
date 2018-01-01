import * as FetchUtils from "../../../../../public/js/utils/FetchUtils.jsx";

/**
 * Recrutement form
 */

let saveButton = $('#send-button');
let firstField = $('#field-player-first');
let ageField = $('#field-player-age');
let matosField = $('#field-player-matos');
let pledgeField = $('#field-player-pledge');
let frequenceField = $('#field-player-frequence');
let experienceField = $('#field-player-experience');
let whereField = $('#field-player-where');
let infoField = $('#field-player-info');
let candidatureField = $('#field-player-candidature');

saveButton.click(e => {

	let first = firstField.val();
	let age = ageField.val();
	let matos = matosField.val();
	let pledge = pledgeField.val();
	let frequence = frequenceField.val();
	let experience = experienceField.val();
	let where = whereField.val();
	let info = infoField.val();
	let candidature = candidatureField.val();

	let data = {
		first: first,
		age: age,
		matos: matos,
		pledge: pledge,
		frequence: frequence,
		experience: experience,
		where: where,
		info: info,
		candidature: candidature
	};

	if (!first || !age || !pledge || !where || !candidature) {
		bootbox.alert(`Merci de remplir tous les champs obligatoires.`);
		return;
	}

	bootbox.confirm('⚠️ Un candidature baclée fait partie des raisons principales de refus de la part du clan. ⚠️' +
		'<hr/>Ta candidature sera postée sous la forme d\'un sujet sur le forum. Il te sera toujours possible de la modifier mais la troupe aura été mise au courant de ton existance et viendra piétiner ton sujet avec leur gros sabots.' +
		'<hr/>Tu es sûr de ton coup ? 🍆', result => {
		if (result) {
			saveButton.prop('disabled', true);
			FetchUtils.post('topic', 'recrutement', data, {
				success: result => {
					if (result.error) {
						saveButton.prop('disabled', false);
						saveButton.notify(result.error, {className: 'error', position: 'left'});
					} else {
						location.href = "/forum-topic/" + result.topicKey;
					}
				},
				fail: result => {
					saveButton.prop('disabled', false);
					$.notify(result, {className: 'error'});
				}
			});
		}
	});

});
