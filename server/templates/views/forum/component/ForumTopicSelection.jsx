import React from 'react';
import ReactDOM from 'react-dom';
import Alert from 'react-bootstrap/lib/Alert';
import Modal from "../../widget/Modal.jsx";
import * as FetchUtils from "../../../../../public/js/utils/FetchUtils.jsx";

/*
 * Forum selection
 */

const ModalComponent = Modal.component();
const FIELD_STYLE = {width: "100%"};
const FIELD_LABEL_STYLE = {width: "200px"};

/**
 * Button
 */

class SelectionModal extends React.Component {

	constructor(props) {
		super(props);
		this.clear();
	}

	clear() {
		this.state = {category: "sc", loading: null};
	}

	/**
	 * Entries
	 */

	handleCategoryChange(event) {
		this.setState({category: event.target.value});
	}

	/**
	 * Validation
	 */

	checkInputs() {
		this.setState({error: null, loading: true});

		FetchUtils.post('forum', 'selection',
			{
				category: this.state.category,
				topicKey: this.props.topicKey
			}, {
				success: result => {
					if (result.error) {
						// Erreur serveur (erreur logique)
						this.setState({error: result.error, loading: false});
					} else {
						location.reload();
					}
				},
				fail: result => {
					// Erreur
					this.setState({error: result, loading: false});
				}
			});
	}

	/**
	 * Render
	 */

	render() {

		const AlertSection = props => {
			return this.state.error && <Alert bsStyle="danger">{this.state.error}</Alert> || null;
		};

		return (
			<ModalComponent modalID="modal-forum-selection" title="Ajouter à la sélection de l'accueil" closeText="Fermer" confirmText="Confirmer"
							loading={this.state.loading}
							onConfirm={e => this.checkInputs(e)}>

				<AlertSection/>

				<div className="alert alert-warning">
					Vous allez ajouter ce sujet à une des sélections "En direct do forum" sur l'accueil.
					<br/>
					Si ce sujet était déjà présent en sélection, vous pouvez ainsi modifier sa catégorie. Il sera alors "up" en tête de liste.
					<br/>
					<br/>
					Note: Tant que ce sujet sera publié sur la page d'accueil, l'auteur de ce message ne pourra plus
					le modifier/supprimer (sauf si il possède les droits de modération suffisants).
				</div>

				<div className="input-group" style={FIELD_STYLE}>
					<span className="input-group-addon" style={FIELD_LABEL_STYLE}>Catégorie</span>
					<select className="form-control" value={this.state.category}
							onChange={e => this.handleCategoryChange(e)}>
						<option value="sc">Star Citizen</option>
						<option value="jv">Jeux vidéo</option>
						<option value="hd">Hardware</option>
					</select>
				</div>

			</ModalComponent>
		);
	}

}

$('.selection_buttons').click('click', function () {
	const topicKey = $(this).attr('topicKey');
	if (topicKey) {
		ReactDOM.unmountComponentAtNode(document.getElementById('forum-topic-selection-modal'));
		ReactDOM.render(
			<SelectionModal topicKey={topicKey}/>,
			document.getElementById('forum-topic-selection-modal'),
			() => {
				$("#modal-forum-selection").modal('show');
			}
		);
	}
});
