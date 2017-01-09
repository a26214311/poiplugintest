import React, { Component } from 'react'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import { Button } from 'react-bootstrap'

import { store } from 'views/create-store'

import { join } from 'path'

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



// poi will render this component in the plugin panel
export const reactClass = connect(
    state => ({
      horizontal: state.config.poi.layout || 'horizontal',
      $ships: state.const.$ships,
      ships: state.info.ships,
      fleets: state.info.fleets,
      $equips: state.const.$equips,
      equips: state.info.equips,
      $shipTypes : state.const.$shipTypes,
    }),
  null, null, { pure: false }
)(class PluginClickButton extends Component {
  constructor(props) {
    super(props)
    this.state = {
      testinfo:"testinfo",
    }
  }

  componentWillReceiveProps(nextProps) {
    this.reRend();
  }

  getfleetmap(){
    var fleetarr = this.props.fleets;
    var fleetmap = {};
    for(var i=0;i<fleetarr.length;i++){
      var nships = fleetarr[i].api_ship;
      for(var j=0;j<nships.length;j++){
        fleetmap[nships[j]]="第"+(i+1)+"艦隊";
      }
    }
    return fleetmap;
  }

  getAllCondShip(){
    try{
      var ret = this.getAllCondShipD();
      return ret;
    }catch(e){
      console.log(e);
      return "unknown error";
    }
  }

  getAllBucketsId(){
    var allEquips = this.props.equips;
    var ret = {};
    for(var p in allEquips){
      if(allEquips[p].api_slotitem_id==75||allEquips[p].api_slotitem_id==68||allEquips[p].api_slotitem_id==193){
        ret[p] = allEquips[p].api_slotitem_id;
      }
    }
    return ret;
  }

  getPage(shiplvarr,shipid){
    var c=0;
    for(var i=0;i<shiplvarr.length;i++){
      if(shiplvarr[i][0]==shipid){
        return c;
      }
      c++;
    }
    return -1;
  }


  getAllCondShipD(){
    var fleetmap = this.getfleetmap();
    var allships = this.props.ships
    var condships = {};
    var bucketships = [];
    var allbucketsId = this.getAllBucketsId();
    var bucketret = "";
    var shiplvarr = [];
    for (var p in allships){
      var ship = allships[p];
      var cond = ship.api_cond;
      var lv = ship.api_lv;
      var infoshipid = ship.api_ship_id;
      shiplvarr.push([p,lv*1000+infoshipid]);
      var shiptypenamearr = this.getShipTypeAndName(infoshipid);
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
        if(allbucketsId[slots[i]]!=undefined){
          var itemtype = allbucketsId[slots[i]];
          if(itemtype==75){ //运输桶
            numofbuckets ++ ;
          }else if(itemtype == 68){//大发动艇
            numofbuckets += 8;
          }else if(itemtype == 193){//特大发动艇
            numofbuckets += 64;
          }

        }
      }
      if(numofbuckets>0){
        bucketships.push([p,lv,shipname,cond,numofbuckets]);
      }
    }
    shiplvarr.sort(function(a,b){return b[1]-a[1]});
    var ret = "";
    for (var p in condships){
      var conddetail = condships[p];
      ret = ret + p + ":" + conddetail.count + "<br>";
      var list = conddetail.list;
      list.sort(function(a,b){return b[1]-a[1]});
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
        var orderofShip = this.getPage(shiplvarr,list[i][0]);
        var page = Math.floor(orderofShip/10)+1;
        var pageorder = (orderofShip+1) % 10;
        if(pageorder==0){
          pageorder=10;
        }
        var pagestr = page + "." + pageorder;

        ret = ret + "";
        ret = ret + "<br>";
      }
      ret = ret + "<br>";
    }

    var bucketimg = '<img style="height:20px;" class="img-img" src="assets/img/slotitem/125.png">';
    var bucketimg2 = '<img style="height:20px;" class="img-img" src="assets/img/slotitem/120.png">';
    var bucketimg3 = '<img style="height:20px;" class="img-img" src="assets/img/slotitem/120.png">';
    var bucketret = "";
    bucketships.sort(function(a,b){return b[1]-a[1]});
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
        var x1 = bucketships[i][4] & 7;
        var x2 = (bucketships[i][4] >> 3) & 7;
        var x3 = (bucketships[i][4] >> 6) & 7;
        for(var j=0;j<x1;j++){
          bucketret = bucketret + bucketimg;
        }
        for(var j=0;j<x2;j++){
          bucketret = bucketret + bucketimg2;
        }
        for(var j=0;j<x3;j++){
          bucketret = bucketret + bucketimg3;
        }
      }
      if(fleetmap[bucketships[i][0]]!=undefined){
        bucketret = bucketret + "("+fleetmap[bucketships[i][0]]+")";
      }
      var orderofShip = this.getPage(shiplvarr,bucketships[i][0]);
      var page = Math.floor(orderofShip/10)+1;
      var pageorder = (orderofShip+1) % 10;
      if(pageorder==0){
        pageorder=10;
      }
      var pagestr = page + "." + pageorder;


      bucketret = bucketret + "";
      bucketret = bucketret + "<br>";
    }

    var rret = '闪船：<br>' + ret + '<br>' + '桶/大发船：<br>' + bucketret +'<br>';

    return new Date().toLocaleString() + "<br>" + rret;
  }

  getShipTypeAndName(infoshipid){
    var shipinfo = this.props.$ships[infoshipid];
    if(shipinfo==undefined){
      return ["error","error"]
    }
    var shiptype = shipinfo.api_stype;
    var shipname = shipinfo.api_name;
    var shipTypeInfo = this.props.$shipTypes[shiptype];
    var shipTypeStr = shipTypeInfo.api_name;
    return [shipTypeStr,shipname];
  }

  reRend(){
    var ret = this.getAllCondShip();
    document.getElementById("showcond").innerHTML = ret ;
  }



  test(){

    var fleetmap = this.getfleetmap();
    var allships = this.props.ships
    var condships = {};
    var bucketships = [];
    var allbucketsId = this.getAllBucketsId();
    var bucketret = "";
    var shiplvarr = [];
    for (var p in allships){
      var ship = allships[p];
      var cond = ship.api_cond;
      var lv = ship.api_lv;
      var infoshipid = ship.api_ship_id;
      shiplvarr.push([p,lv*1000+infoshipid]);
      var shiptypenamearr = this.getShipTypeAndName(infoshipid);
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
        if(allbucketsId[slots[i]]!=undefined){
          var itemtype = allbucketsId[slots[i]];
          if(itemtype==75){ //运输桶
            numofbuckets ++ ;
          }else if(itemtype == 68){//大发动艇
            numofbuckets += 8;
          }else if(itemtype == 193){//特大发动艇
            numofbuckets += 64;
          }

        }
      }
      if(numofbuckets>0){
        bucketships.push([p,lv,shipname,cond,numofbuckets]);
      }
    }
    bucketships.sort(function(a,b){return b[1]-a[1]});
    return [fleetmap,condships,bucketships];
  }



  render() {
    const condshipinfo = this.test();
    const fleetmap = condshipinfo[0];
    const condships = condshipinfo[1];
    const bucketships = condshipinfo[2];
    const shiptypes = Object.keys(condships);
    return (
      <div id="fetchcond" className="fetchcond">
        <link rel="stylesheet" href={join(__dirname, 'fetchcond.css')} />
        <div>{new Date().toLocaleString()}</div>
        <div id="showcond">
          {
            shiptypes.map(function (shiptype) {
            const conddetail = condships[shiptype];
            const list = conddetail.list;
            list.sort(function(a,b){return b[1]-a[1]});
            return(
              <div>
                <div>{shiptype}:{conddetail.count}</div>
                <div>{list.map(function(ship){
                  const condi = ship[3];
                  let condstyle;
                  if(condi>=53){
                    condstyle = "ship-cond poi-ship-cond-53 dark";
                  }else if(condi>=50){
                    condstyle = "ship-cond poi-ship-cond-50 dark";
                  }else{
                    condstyle = "ship-cond poi-ship-cond-49 dark";
                  }
                  let fleetstr = "";
                  if(fleetmap[ship[0]]!=undefined){
                    fleetstr = "("+fleetmap[ship[0]]+")";
                  }
                  return(
                    <div>
                      lv.{ship[1]} {ship[2]}<span className={condstyle}>★{ship[3]}</span>{fleetstr}
                    </div>
                  )
                })}<br/></div>
              </div>
              )
            })
          }
          <div></div>
          <div>桶/大发船:</div>
          {
            bucketships.map(function(ship){
              const condi = ship[3];
              let condstyle;
              if(condi>=53){
                condstyle = "ship-cond poi-ship-cond-53 dark";
              }else if(condi>=50){
                condstyle = "ship-cond poi-ship-cond-50 dark";
              }else{
                condstyle = "ship-cond poi-ship-cond-49 dark";
              }
              let fleetstr = "";
              if(fleetmap[ship[0]]!=undefined){
                fleetstr = "("+fleetmap[ship[0]]+")";
              }
              const x1 = ship[4] & 7;
              const x2 = (ship[4] >> 3) & 7;
              const x3 = (ship[4] >> 6) & 7;
              let x1img = [];
              let x2img = [];
              let x3img = [];
              for(var i=0;i<x1;i++){
                x1img.push(1);
              }
              for(var i=0;i<x2;i++){
                x2img.push(1);
              }
              for(var i=0;i<x3;i++){
                x3img.push(1);
              }
              return(
                <div>
                  lv.{ship[1]} {ship[2]}<span className={condstyle}>★{ship[3]}</span>
                  <span>
                    for(var i=0;i<x1;i++){
                      <img style={{width:'20px'}} className="img-img" src="assets/img/slotitem/125.png"></img>
                    }
                  </span>
                  {
                    x1img.map(function(){
                      return(
                        <img style={{width:'20px'}} className="img-img" src="assets/img/slotitem/125.png"></img>
                      )
                    })
                  }
                  {
                    x2img.map(function(){
                      return(
                        <img style={{width:'20px'}} className="img-img" src="assets/img/slotitem/120.png"></img>
                      )
                    })
                  }
                  {
                    x3img.map(function(){
                      return(
                        <img style={{width:'20px'}} className="img-img" src="assets/img/slotitem/120.png"></img>
                      )
                    })
                  }
                  {fleetstr}
                </div>
              )
            })
          }
        </div>
        <div></div>
        <div><br></br></div>
      </div>
    )
  }
})