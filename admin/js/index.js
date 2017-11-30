/**
 * Created by Denis on 17.02.2017.
 */
'use strict';
import {default as ReactDOM, render} from 'react-dom';// eslint-disable-line
import React from 'react';// eslint-disable-line
import {Provider} from 'react-redux';// eslint-disable-line
import {createStore} from 'redux';
import {BrowserRouter as Router, Link} from 'react-router-dom/es';// eslint-disable-line
import injectTapEventPlugin from "react-tap-event-plugin";// eslint-disable-line
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';// eslint-disable-line
import getMuiTheme from 'material-ui/styles/getMuiTheme';

import {appId, appSecret} from './config';
import reducers from './reducers';
import {loadModules} from './actions';
import {init as initTranslator, default as translate} from './translate/index';
import translatorObj from './ru';
import Authorize from './authorize';

import AdminContent from './adminContent';// eslint-disable-line
import AdminMenu from './adminMenu';// eslint-disable-line
import Info from './Info';// eslint-disable-line


if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./js/sw.js', { insecure: true }).then(function(reg) {
        console.log('Registration succeeded. Scope is ' + reg.scope);
    }).catch(function(error) {
        console.log('Registration failed with ' + error);
    });
}

injectTapEventPlugin();
initTranslator(translatorObj);

const store = createStore(reducers, {loading: true, errors: []});

store.subscribe(() => {
    let state = store.getState();

    if (state.user && !state.modules && !state.loading) {
        /**
         * Загрузка модулей
         */
        store.dispatch(loadModules(store.dispatch));
    }
});

Authorize.init(appId, appSecret); // Иницилизируем авторизацию
// Попыка авториации по сохраненым токенам
Authorize.authorize().then(() => {
    store.dispatch({type: null, loading: false, user: Authorize.user, online: true});
}).catch(err => {
    store.dispatch({type: null, loading: false, errors: [...store.getState().errors, err]});
});

/**
 * Основной старт приложения
 */
function startApp() {
    render(<Provider store={store}>
        <Router basename="/admin">
            <MuiThemeProvider muiTheme={getMuiTheme(darkBaseTheme)}>
                <div>
                    <header>
                        <Link to="/">{translate('header-title')}</Link>
                        <Info />
                    </header>
                    <main>
                        <AdminMenu />
                        <AdminContent store={store} />
                    </main>
                </div>
            </MuiThemeProvider>
        </Router>
    </Provider>, document.getElementById('app'));
};

/**
 * Проверка готовности DOM
 * @param {function} calback
 */
function readyDOM(calback) {
    if (['interactive', 'complete'].indexOf(document.readyState) != -1) calback();
    else document.addEventListener('DOMContentLoaded', calback);
}

readyDOM(startApp);