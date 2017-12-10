/**
 * Created by Denis on 29.03.2017.
 */
import React from 'react';

/**
 * Класс отображения модулей
 */
export default class Core extends React.Component {
    constructor(props) {
        super(props);
        this.state = {error: null};
    }

    /**
     * Отображение хдебных крошек
     * @return {ReactElement}
     */
    generateBreadcrumbs() {
        return <div className="not-breadcrumbs"></div>;
    }

    /**
     * Абстрактный метод для отображения контекста
     * @return {ReactElement}
     */
    getContent() {
        return null;
    }

    render() {
        return (
            <div className="module-body">
                {this.generateBreadcrumbs()}
                <div className="module-content">
                    {this.getContent()}
                </div>
            </div>);
    }
}