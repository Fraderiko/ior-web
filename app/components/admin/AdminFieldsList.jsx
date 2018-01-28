var React = require('react');
var createReactClass = require('create-react-class');
var AdminFieldDetails = require('./AdminFieldDetails');
var api = require('./api/api.jsx');

var AdminFieldsList = createReactClass({
    getInitialState: function() {
        return {
            fetchedFeilds: [],
            fields: [],
            modalIsActive: false
        }
    },
    componentDidMount: function () {
        this.fetchFields()
    },
    fetchFields: function() {
        var that = this
        api.getFields().then(function (response) {
            that.setState({
                fields: response,
                fetchedFeilds: response
            })
        }, function() {

        });
    },
    handleRowClick: function (e) {
        this.setState({
            modalIsActive: true,
            modalData: e
        })
    },
    sortTable: function (field) {
        var that = this
        return function() {
          if (that.state[field+'sorted'] !== undefined) {
            if (that.state[field+'sorted'] == "asc") {
              var sorted = that.state.fields.sort(function(a, b) { return a[field] < b[field] })
              that.setState({
                groups: sorted,
                [field+'sorted']: "desc"
              })
            } else {
              var sorted = that.state.fields.sort(function(a, b) { return a[field] > b[field] })
              that.setState({
                groups: sorted,
                [field+'sorted']: "asc"
              })
            }
          } else {
            var sorted = that.state.fields.sort(function(a, b) { return a[field] > b[field] })
            that.setState({
                groups: sorted,
                [field+'sorted']: "desc"
            })
          }
        }
      },
    prepareRows: function () {
        var that = this
        var array = [];
        this.state.fields.forEach(function(field, index) {
           array.push(<FieldRow onRowClick={that.handleRowClick} key={index} item={field}/>)
        });
        return array
    },
    prepareModal: function () {
        if (this.state.modalIsActive == true) {
            return <AdminFieldDetails type={this.state.modalData.type} name={this.state.modalData.name} required={this.state.modalData.required} recepientvisible={this.state.modalData.recepientvisible} _id={this.state.modalData._id} finishModal={this.finishModal} />
        }
    },
    finishModal: function() {
        this.fetchFields()
        $("#detailsModal").modal('hide');
        this.setState({
            modalIsActive: false
        })
    },
    createField: function() {
        this.setState({
            modalIsActive: true,
            modalData: {},
        })
    },
    resolveType: function(type) {
        if (type == "text") {
            return "Текстовое"
        } else if (type == "image") {
            return "Фото"
        } else if (type == "video") {
            return "Видео"
        } else if (type == "date") {
            return "Дата"
        } else if (type == "digit") {
            return "Цифровое"
        } else if (type == "time") {
            return "Время"
        }
    },
    render: function() {
      return (
        <div className="row">

        <div className="well col-lg-8">
            <h1 className="hide">Поля</h1>
            <div className="padding-top-20">
                <button type="button" onClick={this.createField} className="btn  btn-success">Создать поле</button>
            </div>
            <div className="padding-top-20">
                <table className="table table-striped">
                    <thead>
                    <tr>
                        <th onClick={this.sortTable("name")}>Имя</th>
                        <th onClick={this.sortTable("type")}>Тип</th>
                    </tr>
                    </thead>
                    <tbody>
                    {this.prepareRows()}
                    </tbody>
                </table>
                </div>
        </div>

        {this.prepareModal()}

        </div>
      )
    }
})

var FieldRow = createReactClass({
    handleClick: function () {
      this.props.onRowClick(this.props.item)
      console.log(this.props.item)
    },
    resolveType: function(type) {
        if (type == "text") {
            return "Текстовое"
        } else if (type == "image") {
            return "Фото"
        } else if (type == "video") {
            return "Видео"
        } else if (type == "date") {
            return "Дата"
        } else if (type == "digit") {
            return "Цифровое"
        } else if (type == "time") {
            return "Время"
        } else if (type == "file") {
            return "Файл"
        }
    },
    render: function () {
      return (
        <tr onClick={this.handleClick}>
          <td>{this.props.item.name}</td><td>{this.resolveType(this.props.item.type)}</td><td>{this.props.item.email}</td>
        </tr>
      )
    }
  })

module.exports = AdminFieldsList