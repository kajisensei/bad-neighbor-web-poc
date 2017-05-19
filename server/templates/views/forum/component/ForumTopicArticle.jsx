import React from 'react';
import ReactDOM from 'react-dom';
import Button from 'react-bootstrap/lib/Button';
import Alert from 'react-bootstrap/lib/Alert';
import Modal from "../../widget/Modal.jsx";
import * as FetchUtils from "../../../../../public/js/utils/FetchUtils.jsx";

/*
 * Article posting / editing
 */

const ModalComponent = Modal.component();
const FIELD_STYLE = {width: "100%"};
const FIELD_LABEL_STYLE = {width: "200px"};

class ArticleModal extends React.Component {

	constructor(props) {
		super(props);
		this.clear();
	}

	clear() {
		this.state = {title: "", category: "none", loading: null};
	}

	/**
	 * Entries
	 */

	handleTitleChange(event) {
		this.setState({title: event.target.value});
	}

	handleCategoryChange(event) {
		this.setState({category: event.target.value});
	}

	/**
	 * Validation
	 */

	checkInputs() {
		if (!this.state.title) {
			this.setState({error: "Veuillez entrer un titre."});
		} else {
			this.setState({error: null, loading: true});

			FetchUtils.postUpload('forum', 'publish',
				[this.fileInput.files[0], this.fileInputAnim.files[0]],
				{
					title: this.state.title,
					category: this.state.category,
					type: this.state.type,
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
	}

	/**
	 * Render
	 */

	render() {

		const AlertSection = props => {
			return this.state.error && <Alert bsStyle="danger">{this.state.error}</Alert> || null;
		};

		return (
			<ModalComponent title="Publier sur la page d'accueil" closeText="Fermer" confirmText="Confirmer"
							loading={this.state.loading}
							onConfirm={e => this.checkInputs(e)}>

				<AlertSection/>

				<div className="alert alert-warning">
					Note: Tant que ce message sera publié sur la page d'accueil, l'auteur de ce message ne pourra plus
					le modifier/supprimer
					(sauf si il possède les droits de modération suffisants).
				</div>

				<div className="alert alert-info">
					Topic key: <b>{this.props.topicKey}</b>
				</div>

				<div className="input-group" style={FIELD_STYLE}>
					<span className="input-group-addon" style={FIELD_LABEL_STYLE}>Titre de l'entrée</span>
					<input type="text" className="form-control" placeholder="Titre de l'entrée" value={this.state.title}
						   onChange={e => this.handleTitleChange(e)}/>
				</div>

				<div className="input-group" style={FIELD_STYLE}>
					<span className="input-group-addon" style={FIELD_LABEL_STYLE}>Catégorie</span>
					<select className="form-control" value={this.state.category}
							onChange={e => this.handleCategoryChange(e)}>
						<option value="none">Aucune</option>
						<option value="cat1">Catégorie 1</option>
						<option value="cat2">Catégorie 2</option>
						<option value="cat3">Catégorie 3</option>
					</select>
				</div>

				<div className="input-group" style={FIELD_STYLE}>
					<span className="input-group-addon" style={FIELD_LABEL_STYLE}>Image</span>
					<input type="file" className="form-control" ref={(input) => {
						this.fileInput = input;
					}}/>
				</div>

				<div className="input-group" style={FIELD_STYLE}>
					<span className="input-group-addon" style={FIELD_LABEL_STYLE}>Image animée (facultatif)</span>
					<input type="file" className="form-control" ref={(input) => {
						this.fileInputAnim = input;
					}}/>
				</div>

			</ModalComponent>
		);
	}

}

/**
 * Button
 */


$('.publish_buttons').click('click', function () {
	const topicKey = $(this).attr('topicKey');
	if (topicKey) {
		ReactDOM.unmountComponentAtNode(document.getElementById('forum-topic-article-modal'));
		ReactDOM.render(
			<ArticleModal topicKey={topicKey}/>,
			document.getElementById('forum-topic-article-modal'),
			() => {
				$("#" + Modal.modalID).modal('show');
			}
		);
	}
});
