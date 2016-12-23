import React, { Component } from 'react'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import { Button } from 'react-bootstrap'

import { store } from 'views/create-store'

// Import selectors defined in poi
import { extensionSelectorFactory } from 'views/utils/selectors'

const EXTENSION_KEY = 'poi-plugin-test6'

// This selector gets store.ext['poi-plugin-click-button']
const pluginDataSelector = createSelector(
    extensionSelectorFactory(EXTENSION_KEY),
    (state) => state || {}
)
// This selector gets store.ext['poi-plugin-click-button'].count
const clickCountSelector = createSelector(
    pluginDataSelector,
    (state) => state.count
)

// poi will insert this reducer into the root reducer of the app
export function reducer(state={count: 0}, action) {
  const {type} = action
  if (type === '@@poi-plugin-click-button@click')
    return {
  // don't modify the state, use Object Spread Operator
...state,
    count: (state.count || 0) + 5,
}
  return state
}

// Action
function increaseClick() {
  return {
    type: '@@poi-plugin-click-button@click'
  }
}

function testship(){
  return _ships[1].api_slot[0];
}

function getfleet(){
  var fleet = getStore("info.fleets")[0];
  var nships = fleet.api_ship;
  var r = "";
  for(var i=0;i<nships.length;i++){
    r = r + getship(nships[i]);
  }
  return r;
}

function getship(shipid){
  var obj = getStore("info.ships")[shipid];
  console.log(obj);
  var apishipid = obj.api_ship_id;
  var r = "";
  r = r + getshipinfo(apishipid);
  r = r + "lv:" + obj.api_lv + "   cond:"+obj.api_cond+"<br>";
  r = r + "耐久：" + obj.api_nowhp + "/" + obj.api_maxhp + "<br>";
  var lr = "";
  lr = lr + "火力：" + obj.api_karyoku[0] + "/" + obj.api_karyoku[1] + "<br>";
  lr = lr + "雷装：" + obj.api_raisou[0] + "/" + obj.api_raisou[1] + "<br>";
  lr = lr + "装甲：" + obj.api_soukou[0] + "/" + obj.api_soukou[1] + "<br>";
  lr = lr + "回避：" + obj.api_kaihi[0] + "/" + obj.api_kaihi[1] + "<br>";
  lr = lr + "对空：" + obj.api_taiku[0] + "/" + obj.api_taiku[1] + "<br>";
  lr = lr + "幸运：" + obj.api_lucky[0] + "/" + obj.api_lucky[1] + "<br>";

  var itemarr = obj.api_slot;
  var itemstr = "";
  for(var i=0;i<itemarr.length;i++){
    if(itemarr[i]>0){
      itemstr = itemstr + "<div>" + getitem(itemarr[i]) + "</div>";
    }else{
      itemstr = itemstr + "<div>" + " " + "</div>";
    }
  }
  var ret = r + '<table><tr><td>'+lr+'</td><td> </td><td>'+itemstr+'</td></tr></table><br>';
  return ret;
}

function getitem(itemid){
  var obj = getStore("info.equips")[itemid];
  var apiitemid = obj.api_slotitem_id;
  var itemlevel = obj.api_level;
  var iteminfo = getStore("const.$equips")[apiitemid];
  var itemname = iteminfo.api_name;
  var ret = itemname;
  if(itemlevel>0){
    ret = ret + "★" + itemlevel;
  }
  return ret;
}


function getshipinfo(shipid){
  var obj = getStore("const.$ships")[shipid];
  var r = "";
  r = r + obj.api_name + "<br>";
  return r;
}

// poi will render this component in the plugin panel
export const reactClass = connect(
    // mapStateToProps, get store.ext['poi-plugin-click-button'].count and set as this.props.count
    (state, props) => ({count: clickCountSelector(state, props)}),
  // mapDispatchToProps, wrap increaseClick with dispatch and set as this.props.increaseClick
  {
increaseClick,
}
)(class PluginClickButton extends Component {
  render() {
    const {count, increaseClick} = this.props
    const test = testship()
    const fleetinfo = getfleet();
    return (
      <div>
        <h1>flan is baka</h1>
        <h1>{test}</h1>
        <div dangerouslySetInnerHTML={{__html: fleetinfo}}>

        </div>
        <div></div>
      </div>
    )
  }
})