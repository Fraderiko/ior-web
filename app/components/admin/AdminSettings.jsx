var React = require('react');
var createReactClass = require('create-react-class');
var api = require('./api/api.jsx');
var Alert = require('react-s-alert').default;

var Settings = createReactClass({
    componentWillMount: function () {
        var that = this
        api.getSettings().then(function (response) {
            that.setState({
                archive: response.archivePeriod,
                _id: response._id
            })
        }, function () {

        })
    },
    getInitialState: function () {
        return {
            archive: '',
        }
    },
    handleArchiveChange: function (e) {
        this.setState({
            archive: e.target.value
        })
    },
    submit: function (e) {
        e.preventDefault;

        var settings = {
            _id: this.state._id,
            archivePeriod: this.state.archive
        }

        api.updateSettings(settings).then(function (response) {
            if (response.result == "ok") {
                Alert.info('Настройки успешно обновлены', {
                    position: 'top',
                    effect: 'slide',
                    timeout: 3000
                });
            }
        }, function () {

        })
    },
    render: function () {
        return (
            <div className="row">

                <div className="well col-lg-8">
                    <form onSubmit={this.submit}>
                        <div className="form-group">
                            <label>Через сколько проект архивируется</label>
                            <input className="form-control" id="comment" type="number" value={this.state.archive} onChange={this.handleArchiveChange} ></input>
                        </div>
                        <button type="submit" className="btn btn-primary">Сохранить</button>
                    </form>
                </div>
                <Alert stack={{ limit: 3 }} />
            </div>
        )
    }
})

module.exports = Settings