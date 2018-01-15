import React from 'react';
import ReactDOM from 'react-dom';


class BodyEnd extends React.PureComponent {

    componentDidMount() {
        this._popup = document.createElement('div');
        document.body.appendChild(this._popup);
        this._render();
    }

    componentDidUpdate() {
        this._render();
    }

    componentWillUnmount() {
        ReactDOM.unmountComponentAtNode(this._popup);
        document.body.removeChild(this._popup);
    }

    _render() {
        ReactDOM.render(this.props.children, this._popup);
    }

    render() {
        return null;
    }
}

export default BodyEnd