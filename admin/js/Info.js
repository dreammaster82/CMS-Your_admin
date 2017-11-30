/**
 * Created by Denis on 25.02.2017.
 */
'use strict';
import React from 'react'; // eslint-disable-line
import {connect} from 'react-redux';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';
import {withRouter} from 'react-router-dom';
import {setUser} from './actions';
import Authorize from './authorize';

/**
 *
 * @param {object} user
 * @param {boolean} online
 * @param {function} logout
 * @return {HTML}
 * @constructor
 */
/* eslint-disable */
function Info({user, online, logout}){
	return(<span className="info">
				<span>{user && <FlatButton className="login-button" title="Logout" label={user.login} onClick={logout}
										   icon={<FontIcon className="glyphicon glyphicon-log-out" style={{fontSize: 16}} />}></FlatButton>}</span>
				<span className="info-status"><span className={'label ' + (online ? 'label-success' : 'label-danger')}>{online ? 'online' : 'offline'}</span></span>
			</span>);
};

const stateProps = ({user, online}) => {
	return {user, online};
};

const dispatchProps = dispatch => {
	return {
		logout(){
			dispatch(setUser(null));
            Authorize.clearAuth();
		}
	}
};

export default withRouter(
	connect(
    	stateProps,
        dispatchProps
	)(Info)
);