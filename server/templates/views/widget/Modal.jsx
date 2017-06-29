import React from 'react';
import Button from 'react-bootstrap/lib/Button';

const Loading = props => {
	return <div style={{textAlign: "center"}}>
		<i className="fa fa-refresh fa-spin fa-3x fa-fw"/>
		<br/>
		<span>Patientez ...</span>
	</div>
};

class Modal extends React.Component {

	constructor(props) {
		super(props);
	}

	render() {
		
		return <div ref="appModal" className="modal fade" id={this.props.modalID} tabIndex="-1" role="dialog">
			<div className="modal-dialog" role="document">
				<div className="modal-content">

					<div className="modal-header">
						<button type="button" className="close" data-dismiss="modal">
							<span>&times;</span>
						</button>
						<h4 className="modal-title">{this.props.title}</h4>
					</div>

					<div className="modal-body">

						{this.props.loading ? <Loading/> : this.props.children}
					</div>

					<div className="modal-footer">
						<Button data-dismiss="modal">{this.props.closeText ? this.props.closeText : "Close"}</Button>
						<Button bsStyle="primary" disabled={this.props.loading} onClick={this.props.onConfirm}>{this.props.confirmText ? this.props.confirmText : "Confirm"}</Button>
					</div>
				</div>
			</div>
		</div>;
	}
}

export default {
	
	hideAllModals: () => {
		$('.modal').modal('hide');
	},

	component: () => {
		return Modal;
	}
}
