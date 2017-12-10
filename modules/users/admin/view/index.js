/**
 * Created by Denis on 26.02.2017.
 */
import React from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Route, Link} from 'react-router-dom/es';// eslint-disable-line
import {ERRORS, USER} from '../../../../admin/js/actions';

import Core from '../../../core/view';
import Loader from 'react-loader';
import translate from '../../../../admin/js/translate';
import Authorize from '../../../../admin/js/authorize';

import {
    List,
    ListItem,
    RaisedButton,
    TextField,
    SelectField,
    MenuItem,
    Paper,
    Divider,
    Subheader,
    Checkbox,
    IconMenu,
    IconButton
} from 'material-ui';// eslint-disable-line
import Create from 'material-ui/svg-icons/content/create';
import Clear from 'material-ui/svg-icons/content/clear';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import User, {PRESENT_TYPES, PERMISSIONS}  from '../model/User';

/**
 * Редактирование пользователя
 */
class EditForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {user: new User(props.user), loginErrors: [], disabled: false};

        this.checkingLogin = false;
    }

    /**
     * Проверка правильности логина
     * @return {boolean}
     */
    checkLogin(id, login) {
        if (this.checkingLogin) window.dispatchEvent(this.stopFetch)
        this.checkingLogin = true;

        let stopFetch;
        this.setState({disabled: true, loginErrors: []});
        return new Promise((r, rj) => {
            stopFetch = function() {
                rj();
            };
            window.addEventListener(this.stopFetchName, stopFetch);

            User.checkLogin(id, login).then(() => r(true)).catch(err => r(false));
        }).then(check => {
            window.removeEventListener(this.stopFetchName, stopFetch);
            this.checkingLogin = false;
            this.setState({disabled: false});
            return check;
        }).catch(err => {
            window.removeEventListener(this.stopFetchName, stopFetch);
            throw err;
        });
    }

    componentWillMount(){
        this.stopFetchName = 'stopFetch' + Date.now() * Math.random();
        this.stopFetch = new Event(this.stopFetchName);
    }

    render() {
        return (
            <Paper zDepth={1} style={{paddingLeft: 30, paddingRight: 30, paddingBottom: 8}} className="container-fluid">
                <form onSubmit={(e) => {
                    if (!this.state.disabled && !this.state.loginErrors.length) {
                        this.setState({disabled: true});
                        this.props.onSubmit(this.state.user).then(() => this.setState({disabled: false}));
                    }
                    e.preventDefault();
                }}>
                    <input type="hidden" name="id" value={this.state.user.id || 0}/>
                    <div className="row">
                        <h4>{translate('properties')}</h4>
                    </div>
                    <div className="row flex" style={{marginBottom: 15, marginTop: -20}}>
                        <div className="flex" style={{marginRight: 10, flexBasis: 0}}>
                            <TextField name="login" hintText={translate('login')} floatingLabelText={translate('login')}
                                       onChange={(e, val) => {
                                           this.state.user.login = val;
                                           this.setState({user: this.state.user});
                                           if (!val) this.setState({loginErrors: [translate('not_enter')]})
                                           else {
                                               let index = this.state.loginErrors.indexOf(translate('not_enter'));
                                               if (index != -1) {
                                                   this.state.loginErrors.splice(index, 1)
                                                   this.setState({loginErrors: this.state.loginErrors});
                                               }

                                               this.checkLogin(this.state.user.id, val).then(check => {
                                                   let index = this.state.loginErrors.indexOf(translate('incorrect'));
                                                   if (!check) {
                                                       if (index == -1) {
                                                           this.state.loginErrors.push(translate('incorrect'));
                                                           this.setState({loginErrors: this.state.loginErrors});
                                                       }
                                                   } else {
                                                       if (index != -1) {
                                                           this.state.loginErrors.splice(index, 1)
                                                           this.setState({loginErrors: this.state.loginErrors});
                                                       }
                                                   }
                                               });
                                           }
                                       }} value={this.state.user.login || ''} errorText={this.state.loginErrors ? this.state.loginErrors.join(' ') : null} />
                        </div>
                        <div className="flex" style={{flexBasis: 0, flexGrow: 2}}>
                            <TextField name="password" hintText={translate('password')}
                                       floatingLabelText={translate('password')} type="password"
                                       onChange={(e, val) => {
                                           this.state.user.password = val || null;
                                           this.setState({user: this.state.user});
                                       }} />
                        </div>
                    </div>
                    <div className="row">
                        <Divider />
                        <h4>{translate('permissions')}</h4>
                    </div>
                    <div className="row flex" style={{marginTop: -10}}>
                        <div className="flex" style={{marginRight: 10, flexBasis: 0}}>
                            {Object.entries(PERMISSIONS).map((entrie, index) => {
                                return <div key={index}>
                                    <Subheader>{translate(entrie[0])}</Subheader>
                                    {entrie[1].map(it => {
                                        return <Checkbox key={index + it} label={translate(it)}
                                                         checked={this.state.user.permissions[entrie[0]] && this.state.user.permissions[entrie[0]].indexOf(it) != -1}
                                                         onCheck={(e, isChecked) => {
                                                             if (isChecked) {
                                                                 if (!this.state.user.permissions[entrie[0]]) this.state.user.permissions[entrie[0]] = [];
                                                                 if (this.state.user.permissions[entrie[0]].indexOf(it) == -1) this.state.user.permissions[entrie[0]].push(it);
                                                             } else {
                                                                 if (this.state.user.permissions[entrie[0]]) {
                                                                     let ind = this.state.user.permissions[entrie[0]].indexOf(it);
                                                                     if (ind != -1) this.state.user.permissions[entrie[0]].splice(ind, 1);
                                                                 }
                                                             }
                                                             this.setState({user: this.state.user});
                                                         }}/>;
                                    })}
                                </div>;
                            })}

                        </div>
                        <div className="flex" style={{flexBasis: 0, flexGrow: 2}}>
                            <SelectField floatingLabelText={translate('present_type')} onChange={(e, index, val) => {
                                this.state.user.permissions = Object.assign({}, PRESENT_TYPES[val]);
                                this.setState({user: this.state.user});
                            }}>
                                {Object.keys(PRESENT_TYPES).map((key, index) => <MenuItem key={index} value={key}
                                                                                          primaryText={translate(key)}/>)}
                            </SelectField>
                        </div>
                    </div>
                    <div className="row" style={{marginTop: 10, marginBottom: 10}}>
                        <Divider />
                    </div>
                    <div className="row">
                        <RaisedButton type="submit" label={translate('save')} primary={true} style={{marginRight: 10}} disabled={this.state.disabled} />
                        <RaisedButton type="button" label={translate('cancel')} onClick={(e) => this.props.onCancel()}/>
                    </div>
                </form>
            </Paper>);
    }
}

/**
 * Работа с пользователями
 */
class Users extends Core {
    constructor(props) {
        super(props);
        this.name = 'users';

        this.formErorrs = {};

        this.state = {loading: props.loading, users: props.users || [], edit: false};
    }

    /**
     * Отображение хдебных крошек
     * @return {ReactElement}
     */
    generateBreadcrumbs() {
        let add = false, type;
        if (this.props.location.pathname.indexOf('edit') != -1) {
            add = true;
            type = 'edit';
        } else if (this.props.location.pathname.indexOf('create') != -1) {
            add = true;
            type = 'create';
        }
        return (<Paper zDepth={1} className="breadcrumb">
            <Link to={`/${this.name}`}
                  href={'/admin/' + this.name + '/'}>{translate(this.name)}</Link>
            {add && <span> / </span>}
            {add && translate(type)}
        </Paper>);
    }

    componentWillMount() {
        this.setState({loading: true});
        User.getAll().then(users => {
            this.setState({users: users, loading: false});
        }).catch(err => {
            this.props.dispatch({type: ERRORS, errors: [err]})
            this.setState({loading: false});
        });
    }

    /**
     * Сохранение пользователя
     * @param {User} user
     * @return {Promise}
     */
    saveUser(user) {
        this.setState({loading: true});
        return user.save().then(user => {

            let index = this.state.users.findIndex(u => u.id == user.id);
            if (index == -1) {
                this.state.users.push(user);
            } else {
                this.state.users[index] = user;
            }
            this.setState({
                user: user,
                loading: false,
                users: this.state.users
            });
            this.backOrList();
        }).catch(err => this.props.dispatch({type: ERRORS, errors: [err]}));
    }

    /**
     * Удаление пользователя
     * @param {User} user
     */
    delete(user) {
        this.setState({loading: true});
        user.delete().then(() => {

            this.state.users.splice(this.state.users.findIndex(u => u.id == user.id), 1);
            if (user.id == this.props.user.id) {
                user = null;
                this.props.dispatch({type: USER, user: null});
                Authorize.clearAuth();
            }
            this.setState({
                user: user,
                loading: false,
                users: this.state.users
            });
        }).catch(err => this.props.dispatch({type: ERRORS, errors: [err]}));
    }

    componentWillReceiveProps(nextProps) {
        let state = {};
        if (nextProps.users && nextProps.users != this.state.users) state.users = nextProps.users;
        if (nextProps.loading && nextProps.loading != this.state.loading) state.loading = nextProps.loading;
        if (Object.keys(state).length) this.setState(state);
    }

    backOrList() {
        if (this.props.history.length) this.props.history.goBack();
        else this.props.history.push({pathname: `/users/`});
    }

    getContent() {
        if (this.props.user) {
            return <Loader loaded={!this.state.loadind}>
                <div>
                    <Route exact path="/users/" render={() => {
                        return <div>
                            <div className="create-btn buttons"><RaisedButton label={translate("create")} primary={true}
                                                                              type="submit" onClick={(e) => {
                                if (this.props.history) this.props.history.push({pathname: `/users/create`});
                            }}/></div>
                            {this.state.users.length ? <List>
                                {this.state.users.map((user, index) => {
                                    return (
                                        <ListItem key={index} isKeyboardFocused={user.login == this.props.user.login}
                                                  rightIconButton={<IconMenu
                                                      iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}
                                                      anchorOrigin={{horizontal: 'left', vertical: 'top'}}
                                                      targetOrigin={{horizontal: 'left', vertical: 'top'}} >
                                                      <MenuItem primaryText={translate("edit")} leftIcon={<Create title={translate("edit")} />}
                                                                onClick={() => {
                                                                    if (this.props.history) this.props.history.push({pathname: `/users/${user.login}/edit`});
                                                                }} />
                                                      <MenuItem primaryText={translate("delete")} leftIcon={<Clear title={translate("delete")} />}
                                                                onClick={() => this.delete(user)} />
                                                  </IconMenu>} primaryText={user.login}></ListItem>);
                                })}
                            </List> : 'Not items'}
                        </div>;
                    }}/>
                    <Route path="/users/:login/edit" render={(matchObj) => {
                        let editedUser = this.state.users.find(user => user.login == matchObj.match.params.login);
                        if (editedUser) {
                            return <EditForm user={editedUser} onSubmit={this.saveUser.bind(this)}
                                             onCancel={this.backOrList.bind(this)}/>;
                        } else return <div>Пользователь не найден</div>;
                    }}/>
                    <Route path="/users/create" render={() => {
                        return <EditForm onSubmit={this.saveUser.bind(this)} onCancel={this.backOrList.bind(this)}/>;
                    }}/>
                </div>
            </Loader>;
        } else return <div className="login-content">Пожалуйста авторизуйтесь</div>;
    }
}
;

export default withRouter(connect(({loading, user}) => {
    return {loading, user};
})(Users));