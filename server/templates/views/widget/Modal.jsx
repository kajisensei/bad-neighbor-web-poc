import React from 'react';
import Button from 'react-bootstrap/lib/Button';

export const modalID = "appModal";

class Modal extends React.Component {

	constructor(props) {
		super(props);
	}

	render() {
		return <div ref="appModal" className="modal fade" id={modalID} tabIndex="-1" role="dialog">
			<div className="modal-dialog" role="document">
				<div className="modal-content">

					<div className="modal-header">
						<button type="button" className="close" data-dismiss="modal">
							<span>&times;</span>
						</button>
						<h4 className="modal-title">{this.props.title}</h4>
					</div>

					<div className="modal-body">
						{this.props.children}
					</div>

					<div className="modal-footer">
						<Button data-dismiss="modal">{this.props.closeText ? this.props.closeText : "Close"}</Button>
						<Button bsStyle="primary" onClick={this.props.onConfirm}>{this.props.confirmText ? this.props.confirmText : "Confirm"}</Button>
					</div>
				</div>
			</div>
		</div>;
	}
}

export default {
	modalID: modalID,

	hide: () => {
		$('#' + modalID).modal('hide');
	},

	component: () => {
		return Modal;
	}
}
