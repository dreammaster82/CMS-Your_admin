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
import './lib/offline';

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
            console.log('SW registered: ', registration);
        }).catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
        });
    });
}

injectTapEventPlugin();
initTranslator(translatorObj);

const store = createStore(reducers, {loading: true, errors: [], online: false});

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

// Проверка на онлайн/оффлайн
Offline.options.checks = {xhr: {url: REST_API + '/ping'}};
Offline.on('up', () => {
    if (!store.getState().online) store.dispatch({type: null, online: true});
    if (!Authorize.user) {
        // Попыка авториации по сохраненым токенам
        Authorize.authorize().then(() => {
            store.dispatch({type: null, loading: false, user: Authorize.user});
        }).catch(err => {
            if (err.message != 'Авторизация уже запущена') {
                store.dispatch({type: null, loading: false});
            }
            console.warn(err);
        });
    }
});
Offline.on('down', () => {
    if (store.getState().online) store.dispatch({type: null, online: false});
});
Offline.check().then(() => {
    Offline.trigger('up');
}).catch(() => {
    Offline.trigger('down');
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