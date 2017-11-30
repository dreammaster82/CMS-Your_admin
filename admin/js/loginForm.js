/**
 * Created by Denis on 18.02.2017.
 */
import React from 'react';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import translate from './translate';

/**
 * Форма авторизации
 */
export default class LoginForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {loginError: null, passwordError: null};
    }

    /**
     * Обработчик отправки формы
     * @param {Event} e
     */
    submitHandler(e) {
        e.preventDefault();
        let state = {loginError: null, passwordError: null}, err = false, login, password;
        if (this.refs) {
            if (this.refs['loginInput']) login = this.refs['loginInput'].input;
            else throw new Error('Поле пользователя не найдено');

            if (this.refs['passwordInput']) password = this.refs['passwordInput'].input;
            else throw new Error('Поле пароля не найдено');
        }
        if (!login.value) {
            err = true;
            state.loginError = 'Заполните поле Login';
        }
        if (!password.value) {
            err = true;
            state.passwordError = 'Заполните поле Password';
        }
        if (err) this.setState(state);
        else if (this.props.login) this.props.login(login.value, password.value);
    }

    render() {
        return (
            <div className="container-fluid">
                <div className="row">
                    <div className="col-md-4 col-md-offset-4 col-xs-8">
                        <form className="login-form" onSubmit={(e) => this.submitHandler(e)}>
                            <div className='form-group'>
                                <TextField floatingLabelText={translate("login")} hintText={translate("input login")} ref="loginInput" errorText={this.state.loginError} />
                            </div>
                            <div className='form-group'>
                                <TextField floatingLabelText={translate("password")} hintText={translate("input password")} ref="passwordInput" type="password" errorText={this.state.passwordError} />
                            </div>
                            <RaisedButton label={translate("send")} primary={true} type="submit" />
                        </form>
                    </div>
                </div>
                {this.props.error && <div className="row" style={{paddingTop: '10px'}}>
                    <div className="alert alert-danger col-md-4 col-md-offset-4 col-xs-8" role="alert">{this.props.error && (this.props.error.message || this.props.error.statusText)}</div>
                </div>}
            </div>
            );
    }
};