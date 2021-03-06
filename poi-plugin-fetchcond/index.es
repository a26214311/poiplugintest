import React, {Component} from 'react'
import {connect} from 'react-redux'
import {createSelector} from 'reselect'
import { Container, Row, Col, Tabs, Tab, ListGroup, ListGroupItem, Nav, NavItem, Content, Pane} from 'react-bootstrap'

import {store} from 'views/create-store'

import {join} from 'path'

import {extensionSelectorFactory} from 'views/utils/selectors'

const EXTENSION_KEY = 'poi-plugin-fetchcond';

const pluginDataSelector = createSelector(
  extensionSelectorFactory(EXTENSION_KEY),
  (state) => state || {}
)

export const reactClass = connect(
  state => ({
    horizontal: state.config.poi.layout || 'horizontal',
    $ships: state.const.$ships,
    ships: state.info.ships,
    fleets: state.info.fleets,
    $equips: state.const.$equips,
    equips: state.info.equips,
    $shipTypes: state.const.$shipTypes
  }),
  null, null, {pure: false}
)(class PluginFetchCond extends Component {

  getfleetmap() {
    var fleetarr = this.props.fleets;
    var fleetmap = {};
    for (var i = 0; i < fleetarr.length; i++) {
      var nships = fleetarr[i].api_ship;
      for (var j = 0; j < nships.length; j++) {
        fleetmap[nships[j]] = i + 1;
      }
    }
    return fleetmap;
  }

  getAllCondShip() {
    try {
      var ret = this.getAllCondShipD();
      return ret;
    } catch (e) {
      console.log(e);
      return "unknown error";
    }
  }

  getAllBucketsId() {
    var allEquips = this.props.equips;
    var ret = {};
    for (var p in allEquips) {
      if (allEquips[p].api_slotitem_id == 75 || allEquips[p].api_slotitem_id == 68 || allEquips[p].api_slotitem_id == 193) {
        ret[p] = allEquips[p].api_slotitem_id;
      }
    }
    return ret;
  }

  getItemTypeMap(){
    var allEquips = this.props.equips;
    var $equip = this.props.$equips;
    var ret = {};
    for (var p in allEquips) {
      var id=allEquips[p].api_slotitem_id
      var type = $equip[id].api_type[3]
      ret[p]=type;
    }
    return ret;
  }

  getShipTypeAndName(infoshipid) {
    var shipinfo = this.props.$ships[infoshipid];
    if (shipinfo == undefined) {
      return ["error", "error"]
    }
    var shiptype = shipinfo.api_stype;
    var shipname = shipinfo.api_name;
    var shipTypeInfo = this.props.$shipTypes[shiptype];
    var shipTypeStr = shipTypeInfo.api_name;
    return [shipTypeStr, shipname];
  }

  getAllCondShipD() {
    var fleetmap = this.getfleetmap();
    var allships = this.props.ships;
    var condships = {};
    var bucketships = [];
    var allbucketsId = this.getAllBucketsId();
    var itemtypes = this.getItemTypeMap();
    var shiplvarr = [];
    for (var p in allships) {
      var ship = allships[p];
      var cond = ship.api_cond;
      var lv = ship.api_lv;
      var infoshipid = ship.api_ship_id;
      shiplvarr.push([p, lv * 1000 + infoshipid]);
      var shiptypenamearr = this.getShipTypeAndName(infoshipid);
      var shiptype = shiptypenamearr[0];
      var shipname = shiptypenamearr[1];
      var equips = ship.api_slot;
      var equiptype = [];
      for(var i=0;i<equips.length;i++){
        if(equips[i]>0){
          equiptype.push(itemtypes[equips[i]]);
        }
      }
      //console.log(shipname,equiptype,equips);
      if (cond >= 50) {
        if (condships[shiptype] == undefined) {
          condships[shiptype] = {"count": 1, list: [[p, lv, shipname, cond,equiptype]]}
        } else {
          var oldcount = condships[shiptype].count;
          var oldlist = condships[shiptype].list;
          oldlist.push([p, lv, shipname, cond,equiptype]);
          var newdata = {"count": oldcount + 1, list: oldlist};
          condships[shiptype] = newdata;
        }
      }
      var slots = ship.api_slot;
      var numofbuckets = 0;
      for (var i = 0; i < slots.length; i++) {
        if (allbucketsId[slots[i]] != undefined) {
          var itemtype = allbucketsId[slots[i]];
          if (itemtype == 75) { //运输桶
            numofbuckets++;
          } else if (itemtype == 68) {//大发动艇
            numofbuckets += 8;
          } else if (itemtype == 193) {//特大发动艇
            numofbuckets += 64;
          }

        }
      }
      if (numofbuckets > 0) {
        bucketships.push([p, lv, shipname, cond, numofbuckets]);
      }
    }
    bucketships.sort(function (a, b) {
      return b[1] - a[1]
    });
    return [fleetmap, condships, bucketships];
  }

  render() {
    const condshipinfo = this.getAllCondShip();
    const fleetmap = condshipinfo[0];
    const condships = condshipinfo[1];
    const bucketships = condshipinfo[2];
    // 合并舰船种类
    let shiptypes = ["全部", "驱逐", "轻巡", "重巡", "战舰", "空母", "潜艇", "其他"];
    const mergeShip = (type) => {
      switch (type) {
        case "全部":
          return ["駆逐艦", "軽巡洋艦", "重雷装巡洋艦", "重巡洋艦", "航空巡洋艦", "戦艦", "航空戦艦", "超弩級戦艦", "水上機母艦", "軽空母", "正規空母", "装甲空母", "潜水艦", "潜水空母", "揚陸艦", "工作艦", "補給艦", "練習巡洋艦", "潜水母艦"];
        case "驱逐":
          return ["駆逐艦"];
        case "轻巡":
          return ["軽巡洋艦", "重雷装巡洋艦"];
        case "重巡":
          return ["重巡洋艦", "航空巡洋艦"];
        case "战舰":
          return ["戦艦", "航空戦艦", "超弩級戦艦"];
        case "空母":
          return ["水上機母艦", "軽空母", "正規空母", "装甲空母"];
        case "潜艇":
          return ["潜水艦", "潜水空母"];
        default:
          return ["揚陸艦", "工作艦", "補給艦", "練習巡洋艦", "潜水母艦","海防艦"];
      }
    };

    //const equipIconId = equipData ? $equip.api_type[3] : 0
    //const item = <SlotitemIcon className="slotitem-img" slotitemId={equipIconId} />




    // 生成闪船样式
    const creteMoraleClass = (morale) => {
      let moraleStyle = "ship-cond dark";
      if (morale >= 53) {
        return moraleStyle + " poi-ship-cond-53";
      }
      if (morale >= 50) {
        return moraleStyle + " poi-ship-cond-50";
      }
      return moraleStyle + " poi-ship-cond-49";
    };

    // 统计同类船总数
    let shipCount = {};
    shiptypes.map((shiptype) => {
      let count = 0;
      mergeShip(shiptype).map((type) => {
        count += condships[type] ? condships[type].count : 0;
      });
      shipCount[shiptype] = count;
    });

    // 获取舰队位置
    const getFleet = (ship) => {
      let fleet = fleetmap[ship], fleetStyle = 'fleet-group';
      if(fleet){
        fleetStyle += ' group-' + fleet;
        return(
          <span className={fleetStyle}>
            {"第" + fleet + "艦隊"}
          </span>
        )
      }
    };

    return (
      <div id="fetchcond" className="fetchcond">
        <link rel="stylesheet" href={join(__dirname, 'fetchcond.css')}/>
        <div id="showcond">
          <Tab.Container defaultActiveKey={0} id="ship-type">
            <Row className="clearfix">
              <Col sm={12}>
                <Nav bsStyle="tabs">
                  {
                    shiptypes.map((shiptype, index) => {
                      if(shipCount[shiptype]){
                        return (
                          <NavItem eventKey={index}>
                            {[shiptype, <span className="badge">{shipCount[shiptype]}</span>]}
                          </NavItem>
                        )
                      }
                    })
                  }
                  <NavItem eventKey={shiptypes.length}>
                    {["桶船", <span className="badge">{bucketships.length}</span>]}
                  </NavItem>
                </Nav>
              </Col>
              <Col sm={12} className="list-container">
                <Tab.Content>
                  {
                    shiptypes.map((shiptype, index) => {
                      if (shipCount[shiptype]) {
                        let listgroup = [], types = mergeShip(shiptype);
                        types.map((type) => {
                          const conddetail = condships[type], list = conddetail ? conddetail.list : [];
                          list.sort((a, b) => {
                            if((a[3]>49&&b[3]>49)||(a[3]<49&&b[3]<49)){
                              return b[1] - a[1]
                            }else{
                              return b[3] - a[3]
                            }
                          });
                          if (conddetail) {
                            listgroup.push(
                              <ListGroupItem active>
                                <span className="title-type">
                                  {[type, <span className="badge">{conddetail ? conddetail.count : 0}</span>]}
                                </span>
                              </ListGroupItem>
                            )
                          }
                          list.map((ship) => {
                            //console.log(ship[4])
                            listgroup.push(
                              <ListGroupItem>
                                lv.{ship[1]} {getFleet(ship[0])} {ship[2]}<span className={creteMoraleClass(ship[3])}>★{ship[3]}</span>
                                {ship[4].map(function(itemtype){
                                  //console.log(itemtype)
                                  var imgurl = "assets/img/slotitem/"+itemtype+".png";
                                  return(
                                    <img className="img-items" src={imgurl}></img>
                                  )
                                })}
                              </ListGroupItem>
                            )
                          })
                        });
                        return (
                          <Tab.Pane eventKey={index}>
                            <ListGroup>
                              { listgroup }
                            </ListGroup>
                          </Tab.Pane>
                        )
                      }
                    })
                  }
                  <Tab.Pane eventKey={shiptypes.length}>
                    <ListGroup>
                      {
                        bucketships.map(function (ship) {
                          const x1 = ship[4] & 7;
                          const x2 = (ship[4] >> 3) & 7;
                          const x3 = (ship[4] >> 6) & 7;
                          let ximg = [];
                          for (let i = 0; i < x1; i++) {
                            ximg.push(<img className="img-items" src="assets/img/slotitem/125.png"></img>);
                          }
                          for (let i = 0; i < x2; i++) {
                            ximg.push(<img className="img-items" src="assets/img/slotitem/120.png"></img>);
                          }
                          for (let i = 0; i < x3; i++) {
                            ximg.push(<img className="img-items" src="assets/img/slotitem/120.png"></img>);
                          }
                          return (
                            <ListGroupItem>
                              lv.{ship[1]} {ship[2]} {getFleet(ship[0])} <span className={creteMoraleClass(ship[3])}>★{ship[3]}</span> {ximg}
                            </ListGroupItem>
                          )
                        })
                      }
                    </ListGroup>
                  </Tab.Pane>
                </Tab.Content>
              </Col>
            </Row>
          </Tab.Container>
        </div>
      </div>
    )
  }
});