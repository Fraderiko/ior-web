var React = require('react');
var createReactClass = require('create-react-class');
var api = require('./api/api.jsx');
var Alert = require('react-s-alert').default;

var AdminPassword = createReactClass({
    getInitialState: function () {
        return {
            password: '',
        }
    },
    handleChange: function (e) {
        this.setState({
            password: e.target.value
        })
    },
    submit: function (e) {
        e.preventDefault;

        var pwd = {
            password: this.state.password
        }

        api.setAdminPassword(pwd).then(function (response) {
            if (response.result == "ok") {
                Alert.info('Пароль успешно обновлен', {
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
                            <label>Новый пароль администратора</label>
                            <input className="form-control" id="comment" type="password" value={this.state.password} onChange={this.handleChange} ></input>
                        </div>
                        <button type="submit" className="btn btn-primary">Сохранить</button>
                    </form>
                </div>
                <Alert stack={{ limit: 3 }} />
            </div>
        )
    }
})

module.exports = AdminPassword