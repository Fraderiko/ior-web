var React = require('react');
var createReactClass = require('create-react-class');

var ClientOrder = createReactClass({
  submitHandler: function (e) {
    e.preventDefault;
  },
  render: function () {
    if (this.props.value != "" && this.props.value != undefined) {
      return (
        <div>
          <div className="form-group">
            <label>{this.props.name}</label>
            <br />
            <p>{this.props.value}</p>
          </div>
        </div>
      )
    } else {
      return null
    }
  }
})

module.exports = ClientOrder