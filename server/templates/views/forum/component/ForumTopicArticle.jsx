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
const FIELD_LABEL_STYLE = {width: "150px"};

class ArticleModal extends React.Component {

	constructor(props) {
		super(props);
		this.clear();
	}

	clear() {
		this.state = {title: "", summary: "", category: "none", type: "main", loading: null};
	}

	/**
	 * Entries
	 */

	handleTitleChange(event) {
		this.setState({title: event.target.value});
	}

	handleSummaryChange(event) {
		this.setState({summary: event.target.value});
	}

	handleCategoryChange(event) {
		this.setState({category: event.target.value});
	}

	handleTypeChange(event) {
		this.setState({type: event.target.value});
	}

	/**
	 * Validation
	 */

	checkInputs() {
		if (!this.state.title) {
			this.setState({error: "Veuillez entrer un titre."});
		} else if (!this.state.summary) {
			this.setState({error: "Veuillez entrer un résumé."});
		} else {
			this.setState({error: null, loading: true});
			
			FetchUtils.postUpload('forum', 'publish', this.fileInput, {
				title: this.state.title,
				summary: this.state.summary, 
				category: this.state.category,
				type: this.state.type,
				topicKey: this.props.topicKey
			}, {
				success: result => {
					if(result.error) {
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
			<ModalComponent title="Publier sur la page d'accueil" closeText="Fermer" confirmText="Confirmer" loading={this.state.loading}
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
					<span className="input-group-addon" style={FIELD_LABEL_STYLE}>Type</span>
					<select className="form-control" value={this.state.type} onChange={e => this.handleTypeChange(e)}>
						<option value="main">Principale</option>
						<option value="sub">Secondaire</option>
					</select>
				</div>

				<div className="input-group" style={FIELD_STYLE}>
					<span className="input-group-addon" style={FIELD_LABEL_STYLE}>Titre de l'entrée</span>
					<input type="text" className="form-control" placeholder="Titre de l'entrée" value={this.state.title}
						   onChange={e => this.handleTitleChange(e)}/>
				</div>

				<div className="input-group" style={FIELD_STYLE}>
					<span className="input-group-addon" style={FIELD_LABEL_STYLE}>Résumé</span>
					<textarea rows="3" className="form-control"
							  placeholder="Le résumé visible sur la page d'accueil" value={this.state.summary}
							  onChange={e => this.handleSummaryChange(e)}/>
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
					<input type="file" className="form-control" ref={(input) => { this.fileInput = input; }} />
				</div>

			</ModalComponent>
		);
	}

}

/**
 * Button
 */


$('.publish_buttons').click('click', function() {
	const topicKey = $(this).attr('topicKey');
	if (topicKey) {
		ReactDOM.unmountComponentAtNode(document.getElementById('forum-topic-article-modal'));
		ReactDOM.render(
			<ArticleModal topicKey={topicKey} />,
			document.getElementById('forum-topic-article-modal'),
			() => {
				$("#" + Modal.modalID).modal('show');
			}
		);
	}
});
