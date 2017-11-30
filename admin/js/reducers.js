/**
 * Created by Denis on 13.08.2017.
 */
import {ONLINE, USER, MODULE, ERRORS, LOADING, MODULES} from './actions';

/**
 *
 * @param {object} state
 * @param {object} action
 * @return {object}
 */
function mainState(state = {}, action) {
    switch (action.type) {
        case ONLINE:
            return {...state, online: action.online};
        case USER:
            return {...state, user: action.user};
        case MODULE:
            return {...state, module: action.module};
        case LOADING:
            return {...state, loading: action.loading};
        case ERRORS:
            return {...state, errors: Array.from(action.errors)};
        case MODULES:
            return {...state, modules: Array.from(action.modules)};
        default:
            if (Object.keys(action).length) return {...state, ...action};
            else return state;
    };
};

export default mainState;