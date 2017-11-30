/**
 * Created by Denis on 26.02.2017.
 */
import React from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Route, Link} from 'react-router-dom/es';// eslint-disable-line
import {ERRORS} from '../../../../admin/js/actions';

import Core from '../../../core/view';
import Loader from 'react-loader';
import translate from '../../../../admin/js/translate';
import {translit} from '../../../../admin/js/utils';

import {
    List,
    ListItem,
    RaisedButton,
    TextField,
    Paper,
    Divider,
    IconButton,
    Avatar
} from 'material-ui';// eslint-disable-line
import Create from 'material-ui/svg-icons/content/create';
import Clear from 'material-ui/svg-icons/content/clear';
import Photo from 'material-ui/svg-icons/image/photo';
import PlaylistAdd from 'material-ui/svg-icons/av/playlist-add';
import Content from '../model/Content';
import 'tinymce';
import TinyMCE from 'react-tinymce';
import ImageUploader from '../../../../admin/js/components/ImageUploader';
import AvatarWithCheckbox from '../../../../admin/js/components/material-components/AvatarWithCheckbox';

const NAME = translate('name');
const DESCRIPTION = translate('description');
const INSERT_IMAGE = translate('insert_image');
const GALLERY = translate('gallery');
const PREVIEW_IMAGE = translate('preview_image');
const SAVE = translate('save');
const CANCEL = translate('cancel');
const EDIT = translate('edit');
const CREATE = translate('create');
const DELETE = translate("delete");

/**
 * Редактирование пользователя
 */
class EditForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {item: this.parseItem(props.item), disabled: false, errors: {}};
    }

    componentWillReceiveProps(nextProps) {
        this.setState({item: this.parseItem(nextProps.item)});
    }

    parseItem(item) {
        let parsedItem = new Content(item);
        if (!parsedItem.Meta) parsedItem.Meta = [];

        let needMeta = ['title', 'description', 'keywords'];
        parsedItem.Meta.forEach(m => {
            let mIndex = needMeta.indexOf(m.type);
            if (mIndex != -1) needMeta.splice(mIndex, 1);
        });

        if (needMeta.length) {
            needMeta.forEach(m => {
                parsedItem.Meta.push({type: m, value: ''});
            });
        }
        return parsedItem;
    }

    /**
     * Проверка правильности логина
     * @param {number} id
     * @param {string} alias
     * @return {boolean}
     */
    checkAlias(id, alias) {
        if (this.state.disabled && this.stopFetch) window.dispatchEvent(this.stopFetch)

        let stopFetch;
        this.setState({disabled: true});
        return new Promise((r, rj) => {
            stopFetch = function() {
                rj();
            };
            window.addEventListener(this.stopFetchName, stopFetch);

            Content.checkAlias(id, alias).then(() => r(true)).catch(err => {
                console.warn(err);
                r(false);
            });
        }).then(check => {
            window.removeEventListener(this.stopFetchName, stopFetch);
            this.setState({disabled: false});
            return check;
        });
    }

    componentWillMount() {
        this.stopFetchName = 'stopFetch' + Date.now() * Math.random();
        this.stopFetch = new Event(this.stopFetchName);
    }

    async validate(onlyValidate = false, old = {}) {
        if (!onlyValidate) this.state.errors = {};

        let valid = true;
        if (!this.state.item.name) {
            this.state.errors.name = ['Name must have'];
            valid = false;
        }
        if (old.alias && this.state.item.alias && (this.state.item.alias != old.alias) && !await this.checkAlias(this.state.item.id, this.state.item.alias)) {
            this.state.errors.alias = ['Alias is incorrect'];
            valid = false;
        }
        if (!onlyValidate) this.setState({errors: this.state.errors});

        return valid;
    }

    render() {
        let metaIndex = this.state.item.Meta.reduce((obj, it, index) => {
            obj[it.type] = index;
            return obj;
        }, {});

        return (
            <Paper zDepth={1} style={{paddingLeft: 30, paddingRight: 30, paddingBottom: 8}} className="container-fluid">
                <form onSubmit={(e) => {
                    if (!this.state.disabled) {
                        this.setState({disabled: true});
                        this.validate(true).then(valid => {
                            if (valid) return this.props.onSubmit(this.state.item);
                            else return false;
                        }).catch(err => {
                            typeof this.props.onError == 'function' && this.props.onError(err);
                        }).then(() => this.setState({disabled: false}));
                    }
                    e.preventDefault();
                }}>
                    <div className="row flex" style={{marginBottom: 15, marginTop: -8}}>
                        <div className="flex" style={{marginRight: 10, flexBasis: 0}}>
                            <TextField name="name" hintText={NAME} floatingLabelText={NAME}
                                       onChange={(e, val) => {
                                           let old = Object.assign({}, this.state.item);
                                           this.state.item.name = val;
                                           this.state.item.alias = translit(this.state.item.name, '_');
                                           this.setState({item: this.state.item});
                                           this.validate(false, old);
                                       }} value={this.state.item.name}
                                       errorText={this.state.errors.name ? this.state.errors.name.join(' ') : null} />
                        </div>
                        <div className="flex" style={{flexBasis: 0, flexGrow: 2}}>
                            <TextField name="alias" hintText="Alias"
                                       floatingLabelText="Alias"
                                       onChange={(e, val) => {
                                           let old = Object.assign({}, this.state.item);
                                           this.state.item.alias = val;
                                           this.setState({item: this.state.item});
                                           this.validate(false, old);
                                       }} value={this.state.item.alias}
                                       errorText={this.state.errors.alias ? this.state.errors.alias.join(' ') : null} />
                        </div>
                    </div>
                    <div className="row">
                        <TextField name="title" fullWidth={true}
                                   floatingLabelText="Title"
                                   onChange={(e, val) => {
                                       if (metaIndex.title == undefined) {
                                           if (!this.state.item.Meta) this.state.item.Meta = [];
                                           this.state.item.Meta.push({type: 'title', value: val});
                                           metaIndex.title = this.state.item.Meta.length - 1;
                                       } else {
                                           this.state.item.Meta[metaIndex.title].value = val;
                                       }
                                       this.setState({item: this.state.item});
                                   }} value={metaIndex.title !== undefined && this.state.item.Meta[metaIndex.title].value}
                                   errorText={this.state.errors.title ? this.state.errors.title.join(' ') : null} />
                    </div>
                    <div className="row">
                        <TextField name="description" fullWidth={true}
                                   floatingLabelText="Description"
                                   onChange={(e, val) => {
                                       if (metaIndex.description == undefined) {
                                           if (!this.state.item.Meta) this.state.item.Meta = [];
                                           this.state.item.Meta.push({type: 'description', value: val});
                                           metaIndex.description = this.state.item.Meta.length - 1;
                                       } else {
                                           this.state.item.Meta[metaIndex.description].value = val;
                                       }
                                       this.setState({item: this.state.item});
                                   }} value={metaIndex.description !== undefined && this.state.item.Meta[metaIndex.description].value}
                                   errorText={this.state.errors.description ? this.state.errors.description.join(' ') : null} />
                    </div>
                    <div className="row">
                        <TextField name="keywords" fullWidth={true}
                                   floatingLabelText="Keywords"
                                   onChange={(e, val) => {
                                       if (metaIndex.keywords == undefined) {
                                           if (!this.state.item.Meta) this.state.item.Meta = [];
                                           this.state.item.Meta.push({type: 'keywords', value: val});
                                           metaIndex.keywords = this.state.item.Meta.length - 1;
                                       } else {
                                           this.state.item.Meta[metaIndex.keywords].value = val;
                                       }
                                       this.setState({item: this.state.item});
                                   }} value={metaIndex.keywords !== undefined && this.state.item.Meta[metaIndex.keywords].value}
                                   errorText={this.state.errors.keywords ? this.state.errors.keywords.join(' ') : null} />
                    </div>
                    <div className="row">
                        <Divider />
                        <h4>{DESCRIPTION}</h4>
                    </div>
                    <div className="row" style={{marginBottom: 10}}>
                        <RaisedButton label={INSERT_IMAGE} style={{marginRight: 10}} />
                        <RaisedButton label={GALLERY} style={{marginRight: 10}} />
                    </div>
                    <div className="row">
                        <TinyMCE
                            content={this.state.item.text}
                            config={{
                                plugins: 'link image code',
                                toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | code',
                                theme_url: '/admin/js/lib/tinymce/themes/modern/theme.min.js',
                                plugins_prefix_url: '/admin/js/lib/tinymce',
                                use_min: true,
                                skin_url: '/admin/js/lib/tinymce/skins/lightgray',
                                min_height: 400
                            }}
                            onChange={(e) => {
                                let old = Object.assign({}, this.state.item);
                                this.state.item.text = e.target.getContent();
                                this.setState({item: this.state.item});
                                this.validate(false, old);
                            }}
                        />
                    </div>
                    <div className="row" style={{marginTop: 10, marginBottom: 10}}>
                        <Divider />
                        <h4>{PREVIEW_IMAGE}</h4>
                    </div>
                    <div className="row">
                        <ImageUploader updateImage={({url, name}) => {
                            if (!this.state.item.Image) this.state.item.Image = {};
                            this.state.item.Image.path = url;
                            this.state.item.Image.name = name;
                            this.setState({item: this.state.item});
                        }} url={this.state.item.Image && this.state.item.Image.path} name={this.state.item.Image && this.state.item.Image.name} />
                    </div>
                    <div className="row" style={{marginTop: 10, marginBottom: 10}}>
                        <Divider />
                    </div>
                    <div className="row">
                        <RaisedButton type="submit" label={SAVE} primary={true} style={{marginRight: 10}}
                                      disabled={this.state.disabled}/>
                        <RaisedButton type="button" label={CANCEL} onClick={(e) => this.props.onCancel()}/>
                    </div>
                </form>
            </Paper>);
    }
}

/**
 * Админинстрирование контента
 */
class ContentView extends Core {
    constructor(props) {
        super(props);

        let type = 0, noParents = false;
        if (props.options) {
            if (props.options.type) type = props.options.type;
            if (props.options.noParents) noParents = props.options.noParents;
        };
        this.state = {loading: props.loading, items: {}, selected: [], type: type, noParents: noParents};
    }

    /**
     * Получение родителей рекурсивно
     * @param {Content} item
     * @return {Array}
     */
    getParents(item) {
        let parents = [];
        if (!this.state.loading) {
            while (item.item.parent) {
                if (!this.state.items[item.item.parent]) {
                    this.setState({loading: true});
                    item.item.getParentsRecursive().then(res => {
                        if (!res.length) {
                            this.state.items[item.item.id].parent = 0;
                        }
                        let items = res.filter(it => it.type == this.state.type);
                        this.setState({
                            items: items.reduce((items, it) => {
                                items[it.id] = {item: it};
                                return items;
                            }, this.state.items), loading: false
                        });
                    }).catch(err => {
                        this.props.dispatch({type: ERRORS, errors: [err]});
                        this.setState({loading: false});
                    });
                    break;
                } else {
                    item = this.state.items[item.item.parent];
                    parents.push(item);
                }
            }
        }
        return parents.reverse();
    }

    breadcrumbs(id = 0, edit = false) {
        let arr = [<Link to={`/${this.props.moduleId}`}
                         href={'/admin/' + this.props.moduleId + '/'} key="0.1">{translate(this.props.moduleId)}</Link>];

        if (!edit) {
            if (id && this.state.items[id]) {
                let parents = this.state.noParents ? [] : this.getParents(this.state.items[id]);
                if (parents.length) {
                    arr.push(<span key="0.2"> / </span>, <Link to={`/${this.props.moduleId}/${this.state.items[id].item.id}`}
                                                               href={`/admin/${this.props.moduleId}/${this.state.items[id].item.id}`}
                                                               key="0.3">{this.state.items[id].item.name}</Link>);
                    parents.forEach((it, ind) => {
                        arr.push(<span key={ind + '.' + ind}> / </span>, <Link to={`/${this.props.moduleId}/${it.item.id}`}
                                                                               href={`/admin/${this.props.moduleId}/${it.item.id}`}
                                                                               key={ind}>{it.item.name}</Link>);

                        arr.push(<span key={arr.length + '.0'}> / </span>, <span
                            key={arr.length + '.1'}>{this.state.items[id].item.name}</span>);
                    });
                } else {
                    arr.push(<span key="0.2"> / </span>, <span
                        key="0.3">{this.state.items[id].item.name}</span>);
                }
            }
        } else {
            if (id && this.state.items[id]) {
                arr.push(<span key="0.-1"> / </span>, <Link to={`/${this.props.moduleId}/${this.state.items[id].item.id}`}
                                                                       href={`/admin/${this.props.moduleId}/${this.state.items[id].item.id}`}
                                                                       key="0">{this.state.items[id].item.name}</Link>);
                arr.push(<span key="0.0"> / </span>, <span
                    key={arr.length + '.1'}>{EDIT}</span>);
            } else {
                arr.push(<span key="0.0"> / </span>, <span
                    key={arr.length + '.1'}>{CREATE}</span>);
            }
        }
        return <div>{arr}</div>;
    }

    /**
     * Отображение хдебных крошек
     * @return {ReactElement}
     */
    generateBreadcrumbs() {
        return (<Paper zDepth={1} className="breadcrumb">
            <Route exact path={`/${this.props.moduleId}/:id`} render={(matchObj) => this.breadcrumbs(matchObj.match.params.id)}/>
            <Route exact path={`/${this.props.moduleId}/`} render={() => this.breadcrumbs(0)}/>
            <Route path={`/${this.props.moduleId}/edit/:id`} render={(matchObj) => this.breadcrumbs(matchObj.match.params.id, true)}/>
            <Route path={`/${this.props.moduleId}/:parentId/create`} render={() => this.breadcrumbs(0, true)}/>
        </Paper>);
    }

    /**
     * Сохранение
     * @param {Content} item
     * @return {Promise}
     */
    saveItem(item) {
        this.setState({loading: true});
        return item.save().then(item => {
            if (!this.state.items[item.id]) {
                this.state.items[item.id] = {item: item};
                if (this.state.items[item.parent]) {
                    if (!this.state.items[item.parent].children) this.state.items[item.parent].children = [];
                    this.state.items[item.parent].children.push(this.state.items[item.id]);
                }
            } else {
                this.state.items[item.id].item = item;
            }

            this.setState({
                loading: false,
                items: this.state.items
            });
            this.backOrList();
        }).catch(err => {
            this.props.dispatch({type: ERRORS, errors: [err]});
            this.setState({loading: false});
        });
    }

    /**
     * Удаление
     * @param {Array} itemsIds
     */
    delete(itemsIds) {
        this.setState({loading: true});
        let deletePromise;
        let items = itemsIds.filter(it => it in this.state.items).map(it => this.state.items[it].item);
        if (items.length) {
            if (items.length > 1) deletePromise = Content.deleteItems(items);
            else deletePromise = items[0].delete();

            deletePromise.then(() => {
                items.forEach(it => {
                    if (this.state.items[it.parent]) {
                        this.state.items[it.parent].children.splice(this.state.items[it.parent].children.findIndex(it2 => it2.item.id == it.id), 1);
                    }
                    delete this.state.items[it.id];
                });

                this.setState({
                    loading: false,
                    items: this.state.items
                });
            }).catch(err => {
                this.props.dispatch({type: ERRORS, errors: [err]});
                this.setState({loading: false});
            });
        }
    }

    componentWillReceiveProps(nextProps) {
        let newState = {};
        if (nextProps.loading && nextProps.loading != this.state.loading) newState.loading = nextProps.loading;
        if (nextProps.moduleId != this.props.moduleId) {
            newState = {...newState, items: {}, selected: [], noParents: false, type: 0};
        }
        if (nextProps.options) {
            newState.noParents = nextProps.options.noParents || false;
            newState.type = nextProps.options.type || 0;
        }
        if (Object.keys(newState).length) {
            this.setState(newState);
        }
    }

    /**
     * Переход назад по истории или на начальный уровень
     */
    backOrList() {
        if (this.props.history.length) this.props.history.goBack();
        else this.props.history.push({pathname: `/${this.props.moduleId}/`});
    }

    /**
     * Показ списка элементов
     * @param {integer} id
     * @return {React}
     */
    showContentList(id = 0) {
        if (this.state.loading) return null;
        else {
            let promises = [];
            if (!this.state.items[id]) {
                promises.push(id ? Content.getById(id) : Promise.resolve({id: 0}));
                promises.push(Content.getAll(id, this.state.type));
            } else if (!this.state.items[id].children) {
                promises.push(Content.getAll(id, this.state.type));
            }

            if (promises.length) {
                this.setState({loading: true});
                Promise.all(promises).then(res => {
                    let state = {loading: false, items: this.state.items}, items = res.pop();
                    if (res.length) {
                        state.items[id] = {item: res[0], children: []};
                    } else if (state.items[id]) {
                        state.items[id].children = [];
                    }

                    items.forEach(it => {
                        state.items[it.id] = {item: it};
                        state.items[id].children.push(state.items[it.id]);
                    });
                    this.setState(state);
                }).catch(err => {
                    this.props.dispatch({type: ERRORS, errors: [err]});
                    this.setState({loading: false});
                });
                return null;
            } else {
                let items = this.state.items[id].children || [],
                    topButtonsStyle = {width: 36, height: 36, padding: 6};
                return <div>
                    {this.props.user.permissions.content && this.props.user.permissions.content.indexOf('edit') != -1 ?
                        <div className="create-btn buttons">
                            <IconButton disabled={!!this.state.selected.length} title={CREATE} onClick={(e) => {
                                if (this.props.history) this.props.history.push({pathname: `/${this.props.moduleId}/${id}/create`});
                            }} style={topButtonsStyle}><PlaylistAdd /></IconButton>
                            {!this.state.noParents && <IconButton disabled={this.state.selected.length > 1 || (!this.state.selected.length && !id)} title={EDIT} onClick={(e) => {
                                if (this.props.history) this.props.history.push({pathname: `/${this.props.moduleId}/edit/${id}`});
                            }} style={topButtonsStyle}><Create /></IconButton>}
                            <IconButton disabled={!this.state.selected.length && !id} title={DELETE} onClick={(e) => {
                                this.delete(this.state.selected.length ? this.state.selected : [id]);
                            }} style={topButtonsStyle}><Clear /></IconButton>
                        </div> : null}
                    {items.length ? <List>
                        {items.map((item, index) => {
                            let checkIndex = this.state.selected.indexOf(item.item.id);
                            return (
                                <ListItem key={index}
                                          onClick={(e) => {
                                              if (this.state.noParents) return false;

                                              this.setState({selected: []});
                                              if (this.props.history) this.props.history.push({pathname: `/${this.props.moduleId}/${item.item.id}`});
                                          }}
                                          style={{paddingRight: 58}}
                                          leftIcon={<AvatarWithCheckbox avatar={item.item.Image ? <Avatar src={item.item.Image.path}/> : <Avatar icon={<Photo />}/>}
                                                                        checked={checkIndex != -1} onCheck={(e) => {
                                                                          let selected = this.state.selected;
                                                                          if (checkIndex == -1) selected.push(item.item.id);
                                                                          else selected.splice(checkIndex, 1);
                                                                          this.setState({selected});
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                      }} />}
                                          rightIconButton={<div style={{position:'absolute',right:-40,top:0}}>
                                              <IconButton title={EDIT} onClick={(e) => {
                                                  if (this.props.history) this.props.history.push({pathname: `/${this.props.moduleId}/edit/${item.item.id}`});
                                                  e.preventDefault();
                                                  e.stopPropagation();
                                              }}>
                                                  <Create />
                                              </IconButton>
                                              <IconButton title={DELETE} onClick={(e) => {
                                                  this.delete([item.item.id]);
                                                  e.preventDefault();
                                                  e.stopPropagation();
                                              }}><Clear /></IconButton>
                                              </div>} primaryText={<div style={{paddingLeft: 48}}>{item.item.name}</div>} />);
                        })}
                    </List> : 'Not items'}
                </div>;
            }
        }
    }

    getContent() {
        if (this.props.user) {
            return <Loader loaded={!this.state.loadind}>
                <div>
                    <Route exact path={`/${this.props.moduleId}/:id`} render={(matchObj) => {
                        return this.showContentList(matchObj.match.params.id);
                    }}/>
                    <Route exact path={`/${this.props.moduleId}/`} render={() => {
                        return this.showContentList();
                    }}/>
                    <Route path={`/${this.props.moduleId}/edit/:id`} render={(matchObj) => {
                        if (this.state.items[matchObj.match.params.id]) {
                            return <EditForm item={this.state.items[matchObj.match.params.id].item}
                                             onSubmit={this.saveItem.bind(this)}
                                             onCancel={this.backOrList.bind(this)}/>;
                        } else {
                            if (Object.keys(this.state.items).length) {
                                return <div>Элемент не найден</div>;
                            } else {
                                this.setState({loading: true, items: {[matchObj.match.params.id]: {item: {id: 0}}}});
                                Content.getById(matchObj.match.params.id).then(item => {
                                    this.setState({loading: false, items: {[item.id]: {item: item}}});
                                }).catch(err => {
                                    this.props.dispatch({type: ERRORS, errors: [err]});
                                    this.setState({items: {}});
                                });
                                return null;
                            }
                        }
                    }}/>
                    <Route path={`/${this.props.moduleId}/:parentId/create`} render={(matchObj) => {
                        return <EditForm onSubmit={this.saveItem.bind(this)} item={new Content({author: this.props.user.id, parent: matchObj.match.params.parentId, type: this.state.type})}
                                         onCancel={this.backOrList.bind(this)} onError={(err) => this.props.dispatch({type: ERRORS, errors: [err]})} />;
                    }}/>
                </div>
            </Loader>;
        } else return <div className="login-content">Пожалуйста авторизуйтесь</div>;
    }
}
;

export default withRouter(connect(({loading, user}) => {
    return {loading, user};
})(ContentView));