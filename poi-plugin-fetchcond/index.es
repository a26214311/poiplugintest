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

function getfleetmap(){
  var fleetarr = getStore("info.fleets");
  var fleetmap = {};
  for(var i=0;i<fleetarr.length;i++){
    var nships = fleetarr[i].api_ship;
    for(var j=0;j<nships.length;j++){
      fleetmap[nships[j]]="第"+(i+1)+"艦隊";
    }
  }
  return fleetmap;
}
function getAllCondShip(){
  try{
    var ret = getAllCondShipD();
    return ret;
  }catch(e){
    console.log(e);
    return "unknown error";
  }
}

function getAllBucketsId(){
  var allEquips = getStore("info.equips");
  var ret = {};
  for(var p in allEquips){
    if(allEquips[p].api_slotitem_id==75){
      ret[p] = 1;
    }
  }
  return ret;
}


function getAllCondShipD(){
  var fleetmap = getfleetmap();
  var allships = getStore("info.ships");
  var condships = {};
  var bucketships = [];
  var allbucketsId = getAllBucketsId();
  var bucketret = "";
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

    var slots = ship.api_slot;
    var numofbuckets = 0;
    for(var i=0;i<slots.length;i++){
      if(allbucketsId[slots[i]]==1){
        numofbuckets ++ ;
      }
    }
    if(numofbuckets>0){
      bucketships.push([p,lv,shipname,cond,numofbuckets]);
    }
  }
  //console.log(condships);
  var ret = "";
  for (var p in condships){
    var conddetail = condships[p];
    ret = ret + p + ":" + conddetail.count + "<br>";
    var list = conddetail.list;
    list.sort(function(a,b){return a[1]<b[1]});
    for(var i=0;i<list.length;i++){
      var condi = list[i][3];
      var condstyle;
      if(condi>=53){
        condstyle = "ship-cond poi-ship-cond-53 dark";
      }else if(condi>=50){
        condstyle = "ship-cond poi-ship-cond-50 dark";
      }else{
        condstyle = "ship-cond poi-ship-cond-49 dark";
      }
      ret = ret + "lv." + list[i][1] + " "+list[i][2] +'<span class="'+condstyle+'">★' + list[i][3] + "</span>";
      if(fleetmap[list[i][0]]!=undefined){
        ret = ret + "("+fleetmap[list[i][0]]+")";
      }
      ret = ret + "<br>";
    }
    ret = ret + "<br>";
  }

  var bucketimg = '<img style="height:20px;" class="img-img" src="assets/img/slotitem/125.png">';
  var bucketret = "";
  bucketships.sort(function(a,b){return a[1]<b[1]});
  for(var i=0;i<bucketships.length;i++){
    var condstyle;
    var condi = bucketships[i][3];
    if(condi>=53){
      condstyle = "ship-cond poi-ship-cond-53 dark";
    }else if(condi>=50){
      condstyle = "ship-cond poi-ship-cond-50 dark";
    }else{
      condstyle = "ship-cond poi-ship-cond-49 dark";
    }
    bucketret = bucketret + "lv." + bucketships[i][1] + " "+bucketships[i][2] +'<span class="'+condstyle+'">★' + bucketships[i][3]+ "</span>";
    if(bucketships[i][4]>0){
      for(var j=0;j<bucketships[i][4];j++){
        bucketret = bucketret + bucketimg;
      }
    }
    if(fleetmap[bucketships[i][0]]!=undefined){
      bucketret = bucketret + "("+fleetmap[bucketships[i][0]]+")";
    }
    bucketret = bucketret + "<br>";
  }

  var rret = ret + '<br>' + '桶船：<br>' + bucketret +'<br>';

  return new Date().toLocaleString() + "<br>" + rret;
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