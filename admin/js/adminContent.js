/**
 * Created by Denis on 18.02.2017.
 */
'use strict'
import React from 'react';// eslint-disable-line
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Route} from 'react-router-dom/es';// eslint-disable-line

import {setLoading, setErrors} from './actions';
import Authorize from './authorize';
import LoginForm from './loginForm.js';// eslint-disable-line
import Loader from 'react-loader';// eslint-disable-line
import ModuleView from './ModuleView.js';// eslint-disable-line
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';// eslint-disable-line
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import {Dialog, FlatButton} from 'material-ui';// eslint-disable-line
import translate from './translate';

const muiTheme = getMuiTheme({
    textField: {
        borderColor: '#696b77',
    }
});

/**
 *
 * @param {boolean} loading
 * @param {User} user
 * @param {Module} modules
 * @param {Function} login
 * @return {ReactComponent}
 * @constructor
 */
function AdminContent({loading, user, modules, errors, login, closeDialog, setErrors}) {
    const close = translate('close');
    /**
     * Закрытие диалога с ошибками
     * @param {Event} e
     */
    function closeModal(e) {
        closeDialog([]);
    }

    let content = null;
    if (modules && modules.length) {
        content = user ? <div>
            <Route exact path="/" render={() => {
                return <div className="login-content">
                    Добро пожаловать в систему администривания <br /> "Ваша админка" <br />
                    Служба поддержки: <a href="mailto:info@woostudio.ru">info@woostudio.ru</a>
                </div>;
            }} />
            <Route path="/:moduleId" render={(matchObj) => {
                module = modules.find(module => module.id == matchObj.match.params.moduleId);
                if (!module) {
                    loading = true;
                    return null;
                } else return <ModuleView module={module} setErrors={setErrors} />;
            }} />
            <Dialog actions={<FlatButton
                label={close}
                primary={true}
                onClick={closeModal}
            />} open={errors.length} onRequestClose={closeModal}>{errors.map((err, index) => <div key={index}>{err.message}</div>)}</Dialog>
        </div> : <LoginForm login={login} errors={errors} />;
    } else loading = false;

    return (<MuiThemeProvider muiTheme={muiTheme}><section className="content"><Loader loaded={!loading}>{content}</Loader></section></MuiThemeProvider>);
}

export default withRouter(connect(({loading, user, modules, errors}) => {
    return {loading, user, modules, errors};
}, (dispatch, props) => {
    return {
        login(login, password) {
            dispatch(setLoading(true));
            Authorize.loginAuth(login, password).then((user) => {
                dispatch({type: null, loading: false, user});
            }).catch(e => dispatch({type: null, loading: false, errors: [...props.store.getState().errors, e]}));
        },
        closeDialog() {
            dispatch(setErrors([]));
        },
        setErrors(err) {
            dispatch(setErrors([err]));
        }
    };
})(AdminContent));