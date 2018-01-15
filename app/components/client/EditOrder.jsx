var React = require('react');
var createReactClass = require('create-react-class');
var TimeField = require('react-simple-timefield').default;
var DatePicker = require('react-datepicker').default;
var Dropzone = require('react-dropzone').default
var { Player } = require('video-react');
var moment = require('moment');
var api = require('./api/api')
var Alert = require('react-s-alert').default;

var EditOrder = createReactClass({
    getInitialState: function () {
        var data = {}
        var statuses = this.props.order.statuses.map(function (status) { return status.fields })
        statuses.forEach(function (status) {
            status.forEach(function (field) {
                if (field.type == 'text' || field.type == 'digit' || field.type == 'date' || field.type == 'time') {
                    data[field._id] = field.value
                } else if (field.type == 'image') {
                    data[field._id] = {
                        type: "image",
                        files: field.media
                    }
                } else if (field.type == 'video') {
                    data[field._id] = {
                        type: "video",
                        files: field.media
                    }
                } else if (field.type == 'file') {
                    data[field._id] = {
                        type: "file",
                        files: field.media
                    }
                }
            })
        })

        this.getGroup()

        return {
            order: this.props.order,
            data: data
        }
    },
    componentWillReceiveProps: function (nextProps) {
        var data = {}
        var statuses = nextProps.order.statuses.map(function (status) { return status.fields })
        statuses.forEach(function (status) {
            status.forEach(function (field) {
                if (field.type == 'text' || field.type == 'digit' || field.type == 'date' || field.type == 'time') {
                    data[field._id] = field.value
                } else if (field.type == 'image') {
                    data[field._id] = {
                        type: "image",
                        files: field.media
                    }
                } else if (field.type == 'video') {
                    data[field._id] = {
                        type: "video",
                        files: field.media
                    }
                }
            })
        })

        this.getGroup()

        this.setState({
            order: nextProps.order,
            data: data
        })
    },
    getGroup: function () {
        var that = this
        api.getGroupDetails({_id: this.props.order.group}).then(function (response) {
            that.setState({
                canworkwith: response.canworkwith
            })
        }, function () {

        })
    },
    getAssignedTo: function () {
        for (var i = 0; i < this.state.canworkwith.length; i++) {
            if (this.state.canworkwith[i].name == this.state.assignedTo) {
                return this.state.canworkwith[i]._id
            }
        }
    },
    prepareContent: function () {

        if (this.state.order != undefined) {
            var array = []
            var that = this

            var statuses = this.state.order.statuses.map(function (status) { return status.fields })

            array.push(<h1 key={that.makeKey()}>Заказ №{that.state.order.number}</h1>)
            array.push(that.assignedToSelect())

            statuses.forEach(function (status, index) {
                array.push(<h2 key={that.makeKey()}>{that.state.order.statuses[index].name}</h2>)
                status.forEach(function (field) {
                    if (field.type == 'text') {
                        array.push(that.prepareTextField(field.name, field._id))
                    } else if (field.type == 'digit') {
                        array.push(that.prepareNumberField(field.name, field._id))
                    } else if (field.type == 'date') {
                        array.push(that.prepareDateField(field.name, field._id))
                    } else if (field.type == 'time') {
                        array.push(that.prepareTimeField(field.name, field._id))
                    } else if (field.type == 'image') {
                        array.push(that.prereImageField(field.name, field._id))
                    } else if (field.type == 'video') {
                        array.push(that.prepareVideoField(field.name, field._id))
                    } else if (field.type == 'file') {
                        array.push(that.prepareFileField(field.name, field._id))
                    }
                })
            })
            array.push(<button key={'submit-edit'} type="button" onClick={this.updateOrder()} className="btn btn-success">Редактировать</button>)
            return array
        }
    },
    assignedToSelect: function() {
        return (
            <div key={'assigned_to'} className={this.state.validatedAssignedToClassName}>
                <label>Исполнитель</label>
                <select className="form-control" value={this.state.order.assignedTo.name} onChange={this.handleAssignedToChanged} id="empoyee">
                {this.prepareAssignedTo()}
                </select>
          </div>
        )
    },
    prepareAssignedTo: function() {
        if (this.state.canworkwith != undefined) {
            if (this.state.canworkwith.length > 0) {
                return this.state.canworkwith.map(function (user) { return <option key={user._id} value={user.name}>{user.name}</option> })
            }
        }
    },
    prepareTextField: function (name, _id) {
        var that = this
        function handleTextChange(e) {
            var data = that.state.data
            data[_id] = e.target.value
            that.setState({
                data: data
            })
        }

        return (
            <div key={_id} className="form-group">
                <label>{name}</label>
                <input id={_id} className="form-control" value={this.state.data[_id]} onChange={handleTextChange} id="email" placeholder={name}></input>
            </div>
        )
    },
    prepareNumberField: function (name, _id) {
        var that = this
        function handleTextChange(e) {
            var data = that.state.data
            data[_id] = e.target.value
            that.setState({
                data: data
            })
        }

        return (
            <div key={_id} className="form-group">
                <label>{name}</label>
                <input id={_id} className="form-control" type="number" value={this.state.data[_id]} onChange={handleTextChange} id="email" placeholder={name}></input>
            </div>
        )
    },
    prereImageField: function (name, _id) {
        var that = this

        function onDrop(accepted, rejected) {
            var data = that.state.data
            var form = new FormData()
            accepted.forEach(function (item) {
                form.append('file', item)
            })

            if (data[_id] == undefined) {
                data[_id] = {
                    type: "image",
                    files: []
                }

                that.setState({
                    isLoading: true
                })

                api.upload(form).then(function (response) {
                    response.forEach(function (item) {
                        data[_id].files.push(response.url)
                    })

                    that.setState({
                        data: data,
                        isLoading: false
                    })
                }, function () {

                })

            } else {

                api.upload(form).then(function (response) {
                    data[_id].files.push(response.url)
                    that.setState({
                        data: data,
                        isLoading: false
                    })
                }, function () {

                })
            }
        }

        function deleteHandler(index) {
            return function () {
                var data = that.state.data
                var file = that.state.data[_id].files[index]
                data[_id].files.splice(index, 1)
                that.setState({
                    data: data
                })
            }
        }

        function preview() {
            if (that.state.data[_id] != undefined) {
                var array = []
                for (var i = 0; i < that.state.data[_id].files.length; i++) {
                    var file = that.state.data[_id].files[i]
                    array.push(<div key={that.makeKey()}><img className="img-preview" src={file} /><br /><button onClick={deleteHandler(i)} className="btn btn-sm btn-danger">Удалить</button></div>)
                }
                return array
            }
        }
        return (
            <div key={_id} className="form-group">
                <label>{name}</label>
                <Dropzone className="filezone" onDrop={onDrop}>
                    <h5>Перенесите сюда фотографии, которые необходимо загрузить</h5>
                </Dropzone>
                <div className="image-container">
                    {/* {this.loader()} */}
                    {preview()}
                </div>
            </div>
        )

    },
    prepareFileField: function (name, _id) {
        var that = this
    
        function onDrop(accepted, rejected) {
          var data = that.state.data
          var form = new FormData()
          accepted.forEach(function (item) {
            form.append('file', item)
          })
    
          if (data[_id] == undefined) {
            data[_id] = {
              type: "file",
              files: []
            }
    
            that.setState({
              isLoading: true
            })
    
            api.upload(form).then(function (response) {
              response.forEach(function (item) {
                data[_id].files.push(item.url)
              })
    
              that.setState({
                data: data,
                isLoading: false
              })
            }, function () {
    
            })
          } else {
            api.upload(form).then(function (response) {
              response.forEach(function (item) {
                data[_id].files.push(item.url)
              })
              that.setState({
                data: data,
                isLoading: false
              })
            }, function () {
    
            })
          }
        }
    
        function deleteHandler(index) {
          return function () {
            var data = that.state.data
            var file = that.state.data[_id].files[index]
            that.setState({
              data: data
            })
          }
        }
    
        function preview() {
          if (that.state.data[_id] != undefined) {
            var array = []
            for (var i = 0; i < that.state.data[_id].files.length; i++) {
              var file = that.state.data[_id].files[i]
              array.push(<div key={that.makeKey()} ><br /><a href={file}>{file.replace(/^.*[\\\/]/, '')}</a><button onClick={deleteHandler(i)} className="btn btn-sm btn-danger">Удалить</button></div>)
            }
            return array
          }
        }
        return (
          <div key={_id} className="form-group">
            <label>{name}</label>
            <Dropzone className="filezone" onDrop={onDrop}>
              <h5>Перенесите сюда файлы, которые необходимо загрузить</h5>
            </Dropzone>
            <div className="image-container">
              {/* {this.loader()} */}
              {preview()}
            </div>
          </div>
        )
      },
    prepareTimeField: function (name, _id) {
        var that = this

        function onTimeChange(e) {
            var data = that.state.data
            data[_id] = e
            that.setState({
                data: data
            })
        }

        function resolveTime() {
            var data = that.state.data
            if (that.state.data[_id] == undefined) {
                return "00:00"
            } else {
                return that.state.data[_id]
            }
        }

        return (<div key={_id} className="form-group">
            <label>{name}</label>
            <br></br>
            <TimeField style={{
                border: '2px solid #666',
                fontSize: 22,
                width: 147,
                padding: '5px 8px',
                color: '#333',
                borderRadius: 3
            }}
                value={resolveTime()}
                onChange={onTimeChange} />
        </div>
        )
    },
    prepareDateField: function (name, _id) {
        var that = this
        function handleDateChange(e) {

            var data = that.state.data
            data[_id] = e
            that.setState({
                data: data
            })
        }

        return (<div key={_id} className="form-group">
            <label>{name}</label>
            <DatePicker dateFormat="LLL" placeholderText="Нажмите, чтобы указать дату" dateFormat={"DD/MM/YYYY"} className="form-control" selected={moment(this.state.data[_id], 'DD MM YYYY')} onChange={handleDateChange} />
        </div>
        )
    },
    prepareVideoField: function (name, _id) {
        var that = this

        function onDrop(accepted, rejected) {

            if (rejected.length > 0) {
                Alert.error('Ошибка! Формат видео должен быть mp4!', {
                    position: 'top',
                    effect: 'slide',
                    timeout: 10000
                });
                return
            }

            var data = that.state.data

            var form = new FormData()

            accepted.forEach(function (item) {
                form.append('file', item)
            })

            if (data[_id] == undefined) {
                data[_id] = {
                    type: "video",
                    files: []
                }

                that.setState({
                    isLoading: true
                })

                api.upload(form).then(function (response) {
                    response.forEach(function (item) {
                        data[_id].files.push(response.url)
                    })

                    that.setState({
                        data: data,
                        isLoading: false
                    })
                }, function () {

                })
            } else {
                api.upload(form).then(function (response) {
                    data[_id].files.push(response.url)
                    that.setState({
                        data: data,
                        isLoading: false
                    })
                }, function () {

                })
            }
        }

        function deleteHandler(index) {
            return function () {
                var data = that.state.data
                var file = that.state.data[_id].files[index]
                data[_id].files.splice(index, 1)
                that.setState({
                    data: data
                })
            }
        }

        function preview() {
            if (that.state.data[_id] != undefined) {
                var array = []
                for (var i = 0; i < that.state.data[_id].files.length; i++) {
                    var file = that.state.data[_id].files[i]
                    array.push(<div key={that.makeKey()} className="video-preview"><br /><Player playsInline={true} fluid={false} src={file} width={410} height={280} /><button onClick={deleteHandler(i)} className="btn btn-sm btn-danger">Удалить</button></div>)
                }
                return array
            }
        }
        return (
            <div key={_id} className="form-group">
                <label>{name}</label>
                <Dropzone accept={"video/mp4"} className="filezone" onDrop={onDrop}>
                    <h5>Перенесите сюда видео, которые необходимо загрузить</h5>
                </Dropzone>
                <div className="image-container">
                    {/* {this.loader()} */}
                    {preview()}
                </div>
            </div>
        )
    },

    updateOrder: function () {
        var that = this

        return function () {

            var order = that.state.order

            for (var i = 0; i < order.statuses.length; i++) {
                for (var j = 0; j < order.statuses[i].fields.length; j++) {
                    if (that.state.order.statuses[i].fields[j].type != 'image' && that.state.order.statuses[i].fields[j].type != 'video' && that.state.order.statuses[i].fields[j].type != 'file') {
                        if (order.statuses[i].fields[j].type == 'date') {
                            order.statuses[i].fields[j].value = moment(that.state.data[that.state.order.statuses[i].fields[j].value]).format('DD MM YYYY') || ""
                        } else {
                            order.statuses[i].fields[j].value = that.state.data[that.state.order.statuses[i].fields[j]._id] || ""
                        }
                    }
                    else {
                        if (that.state.data[order.statuses[i].fields[j]._id] != undefined) {
                            if (that.state.data[order.statuses[i].fields[j]._id].files != undefined) {
                                for (var k = 0; k < that.state.data[that.state.order.statuses[i].fields[j]._id].files.length; k++) {
                                    order.statuses[i].fields[j].media = that.state.data[that.state.order.statuses[i].fields[j]._id].files
                                }
                            }
                        }
                    }
                }
            }

            api.updateOrder(order).then(function (response) {
                that.props.orderUpdated()
            }, function () {

            })
        }
    },

    makeKey: function () {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < 5; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    },
    submitHandler: function (e) {
        e.preventDefault;
    },

    render: function () {
        return (
            <div>
                {this.prepareContent()}
                <Alert stack={{ limit: 3 }} />
            </div>
        )
    }
})

module.exports = EditOrder