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
	}catch(e){
		var ret = "unknown error";
		return ret;
	}

}

function getShipTypeAndName(infoshipid){
  var shipinfo = getStore("const.$ships")[infoshipid];
  var shiptype = shipinfo.api_stype;
  var shipname = shipinfo.api_name;
  var shipTypeInfo = getStore("const.$shipTypes")[shiptype];
  var shipTypeStr = shipTypeInfo.api_name;
  return [shipTypeStr,shipname];
}

function reRend(){
	try{
		var ret = getAllCondShip();
		document.getElementById("showcond").innerHTML = ret ;
	}catch(e){
		var ret = "unknown error";
		document.getElementById("showcond").innerHTML = ret ;
	}

}

// poi will render this component in the plugin panel
export const reactClass = (class PluginClickButton extends Component {
  render() {
    const test = testship()
    const fleetinfo = getfleet();
    const condshipinfo = getAllCondShip();
    return (
      <div>
        <h1>flan is baka</h1>
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