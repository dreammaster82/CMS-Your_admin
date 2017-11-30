/**
 * Created by Denis on 26.02.2017.
 */
import React from 'react';
import Loader from 'react-loader';// eslint-disable-line
import translate from './translate/index.js';

/**
 * Компонент иницилизации и отображения модулей
 */
export default class ModuleView extends React.Component {
    constructor(props) {
        super(props);

        this.state = {module: null, loadind: false};
        this.modulesView = {};
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.module) {
            if (nextProps.module.id != this.state.module.id) {
                this.loadModuleView(nextProps.module);
            }
        }
    }

    componentWillMount() {
        if (this.props.module) {
            this.loadModuleView(this.props.module);
        }
    }

    /**
     * Асинхронная подгрузка модуля для отображения
     * @param {Module} module
     */
    loadModuleView(module) {
        if (!this.modulesView[module.id]) {
            let link = module.id;
            if (module.options && module.options.module) link = module.options.module;
            System.import(`../../modules/${link}/admin/view/index.js`).then((view) => {
                this.modulesView[link] = view.default;
                this.setState({loading: false, module: module});
            }).catch(err => this.props.setErrors(err));
        } else this.setState({module: module});
    }

    render() {
        let link = null;
        if (this.state.module) {
            link = this.state.module.id;
            if (this.state.module.options && this.state.module.options.module) link = this.state.module.options.module;
        }
        return (<div className="module-content">
            <div className="module-header">
                <h2>{this.state.module ? translate(this.state.module.name) : ''}</h2>
            </div>
            <Loader loaded={!this.state.loadind}>
                {this.state.module && this.modulesView[link] ? React.createElement(this.modulesView[link], {...this.props, moduleId: this.state.module.id, options: this.state.module.options || null}) : null}
            </Loader>
        </div>);
    }
}