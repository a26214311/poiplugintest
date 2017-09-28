import React, {Component} from 'react'
import {connect} from 'react-redux'
import {createSelector} from 'reselect'

import {store} from 'views/create-store'
import {join} from 'path'
import {Button} from 'react-bootstrap'




import {extensionSelectorFactory} from 'views/utils/selectors'


export const reactClass = connect(
  state => ({
    horizontal: state.config.poi.layout || 'horizontal'
  }),
  null, null, {pure: false}
)(class PluginLog extends Component {

  constructor(props) {
    super(props)
    this.state = {
      onlog:1
    }
  }

  componentWillReceiveProps(nextProps) {

  }

  handleOn = (e) => {
    e.preventDefault();
    e.stopPropagation();
    var newonlog = 1-this.state.onlog;
    this.setState({onlog:newonlog});
  }

  componentDidMount = () => {
    window.addEventListener('game.response', this.handleResponse);
  };

  componentWillUnmount = () => {
    window.removeEventListener('game.response', this.handleResponse)
  };

  handleResponse = e => {
    const {path, body} = e.detail;
    if(this.state.onlog){
      console.log("-----------http log------------");
      console.log(path);
      console.log(body);
      console.log(e.detail);
      console.log("-----------end log-------------");
      console.log('\n');
    }
  };



  render() {
    try {
      return this.render_D();
    } catch (e) {
      console.log(e);
      return (
        <div>
          unknown error
        </div>
      )
    }
  }

  render_D() {
    return (
      <div>
        <Button bsSize="small" onClick={this.handleOn}
                bsStyle={this.state.onlog ? "success" : "danger"} style={{width: '100%'}}>
          {this.state.onlog ? "关闭log" : "开启log"}
        </Button>
      </div>

    )
  }
});