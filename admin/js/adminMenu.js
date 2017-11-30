/**
 * Created by Denis on 24.02.2017.
 */
import React from 'react'; // eslint-disable-line
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {matchPath} from 'react-router'
import translate from './translate/index';
import {setErrors, setModule} from './actions';

import {Link} from 'react-router-dom/es';// eslint-disable-line
import {List, ListItem} from 'material-ui/List';// eslint-disable-line
import FontIcon from 'material-ui/FontIcon';

/**
 *
 */
class AdminMenu extends React.Component {
    constructor(props) {// eslint-disable-line
        super(props);
        this.state = {loading: props.loading, user: props.user};

        this.classes = [];
        if (props.modules && props.modules.length) this.classes.push('loaded');

        this.collapse = (e) => {
            e.preventDefault();
            let ind = this.classes.indexOf('collapsed');
            if (ind == -1) {
                this.classes.push('collapsed');
                this.menu.classList.add('collapsed');
                this.icon.classList.add('glyphicon-arrow-right');
                this.icon.classList.remove('glyphicon-arrow-left');
            } else {
                this.classes.splice(ind, 1);
                this.menu.classList.remove('collapsed');
                this.icon.classList.add('glyphicon-arrow-left');
                this.icon.classList.remove('glyphicon-arrow-right');
            }
        };
    }

    /**
     *
     * @param {object} nextProps
     */
    componentWillReceiveProps(nextProps) {
        if (nextProps.modules && nextProps.modules.length && this.classes.indexOf('loaded') == -1) this.classes.push('loaded');
    }

    /**
     * Иницилизация меню
     * @param {HTMLElement} menu
     */
    init(menu) {
        if (menu) {
            this.menu = menu;
            this.collapser = this.menu.querySelector('.menu-footer .collapser');
            this.icon = this.menu.querySelector('.menu-footer .glyphicon');
            this.collapser.addEventListener('click', this.collapse);
        }
    }

    /**
     * Удаляем установленные обработчики
     */
    componentWillUnmount() {
        this.collapser && this.collapser.removeEventListener('click', this.collapse);
    }

    /**
     * Смена модуля
     * @param {objectg} item
     */
    changeModule(item) {
        if (this.props.history) this.props.history.push({pathname: `/${item.id}`});
    }

    render() {// eslint-disable-line
        let currentItem = null, modules = null;
        if (this.props.modules && this.props.modules.length) {
            if (this.props.location) {
                let match = matchPath(this.props.location.pathname, {
                    path: '/:moduleId'
                });
                if (match && match.params.moduleId) {
                    currentItem = this.props.modules.find(it => it.id == match.params.moduleId);
                }
            }
            modules = this.props.modules.map((item, index) => {
                const itemName = translate(item.name);
                return (<ListItem className="menu__list__item" key={index} isKeyboardFocused={item == currentItem} onClick={() => this.changeModule(item)}
                                  leftIcon={<FontIcon className={item.name + ' icon'} style={{fontSize: 16, lineHeight: '24px', color: 'rgb(159, 159, 159)'}} />}
                                  style={currentItem == item ? {backgroundColor: 'rgba(255, 255, 255, 0.2)'} : null} title={itemName}>
                    <Link title={itemName} className={item.name} to={`/${item.link}`}>{itemName}</Link>
                </ListItem>);
            });
        }
        return (<aside className={this.classes.join(' ')} ref={(menu) => this.init(menu)}>
                    <div className="menu">
                        <List className="menu__list">{modules}</List>
                    </div>
                    <div className="menu-footer"><span className="collapser"><i className="glyphicon glyphicon-arrow-left"></i></span></div>
                </aside>);
    }
};

export default withRouter(
    connect(({modules, loading, user}) => {
        return {modules, loading, user};
    }, dispatch => {
        return {
            setError(error) {
                dispatch(setErrors([error]));
            }
        };
    })(AdminMenu)
);