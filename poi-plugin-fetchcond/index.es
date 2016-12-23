import React, { Component } from 'react'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import { Button } from 'react-bootstrap'

import { store } from 'views/create-store'

// Import selectors defined in poi
import { extensionSelectorFactory } from 'views/utils/selectors'

const EXTENSION_KEY = 'poi-plugin-fetchcond'

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



function getAllCondShip(){
try{
  var allships = getStore("info.ships");
  var condships = {};
  for (var p in allships){
    var ship = allships[p];
    var cond = ship.api_cond;
    var lv = ship.api_lv;
    var infoshipid = ship.api_ship_id;
    var shiptypenamearr = getShipTypeAndName(infoshipid);
    var shiptype = shiptypenamearr[0];
    var shipname = shiptypenamearr[1];
    if(cond>=50){
      if(condships[shiptype]==undefined){
        condships[shiptype]={"count":1,list:[[p,lv,shipname,cond]]}
      }else{
        var oldcount = condships[shiptype].count;
        var oldlist = condships[shiptype].list;
        oldlist.push([p,lv,shipname,cond]);
        var newdata = {"count":oldcount+1,list:oldlist};
        condships[shiptype] = newdata;
      }
    }
  }
  console.log(condships);
  var ret = "";
  for (var p in condships){
    var conddetail = condships[p];
    ret = ret + p + ":" + conddetail.count + "<br>";
    var list = conddetail.list;
    for(var i=0;i<list.length;i++){
      var condi = list[i][3];
      var condstyle;
      if(condi>=53){
        condstyle = "ship-cond poi-ship-cond-53 dark";
      }else{
        condstyle = "ship-cond poi-ship-cond-50 dark";
      }
      ret = ret + "lv." + list[i][1] + " "+list[i][2] +'<span class="'+condstyle+'">★' + list[i][3] + "</span><br>";
    }
    ret = ret + "<br>";
  }
  return new Date().toLocaleString() + "<br>" + ret;
  }
  catch(e){
	return "unknown error";
  }
}

function getShipTypeAndName(infoshipid){
  var shipinfo = getStore("const.$ships")[infoshipid];
  if(shipinfo==undefined){
	return ["error","error"]
  }
  var shiptype = shipinfo.api_stype;
  var shipname = shipinfo.api_name;
  var shipTypeInfo = getStore("const.$shipTypes")[shiptype];
  var shipTypeStr = shipTypeInfo.api_name;
  return [shipTypeStr,shipname];
}

function reRend(){
  var ret = getAllCondShip();
  document.getElementById("showcond").innerHTML = ret ;
}

// poi will render this component in the plugin panel
export const reactClass = (class PluginClickButton extends Component {
  render() {
    const condshipinfo = getAllCondShip();
    return (
      <div>
        <Button onClick={reRend}>
          统计闪船
        </Button>
        <div id="showcond">
        <div dangerouslySetInnerHTML={{__html: condshipinfo}}>

        </div>
        </div>
        <div></div>
      </div>
    )
  }
})