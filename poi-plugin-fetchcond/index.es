import React, {Component} from 'react'
import {connect} from 'react-redux'
import {createSelector} from 'reselect'
import {Button, Container, Row, Col, Tabs, Tab, ListGroup, ListGroupItem,
  Nav, NavItem, Content, Pane, NavDropdown, MenuItem,
  FormControl} from 'react-bootstrap'

import {store} from 'views/create-store'

import {join} from 'path'

// Import selectors defined in poi
import {extensionSelectorFactory} from 'views/utils/selectors'

const EXTENSION_KEY = 'poi-plugin-fetchcond'
const fs = require('fs');
// This selector gets store.ext['poi-plugin-click-button']
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
    $shipTypes: state.const.$shipTypes,
  }),
  null, null, {pure: false}
)(class PluginClickButton extends Component {
  constructor(props) {
    super(props)
    this.state = {
      "test":"testinfo",
      notify_cond:[],
      needload:true
    }
  }

  componentWillReceiveProps(nextProps) {

  }

  getfleetmap() {
    var fleetarr = this.props.fleets;
    var fleetmap = {};
    for (var i = 0; i < fleetarr.length; i++) {
      var nships = fleetarr[i].api_ship;
      for (var j = 0; j < nships.length; j++) {
        fleetmap[nships[j]] = "第" + (i + 1) + "艦隊";
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
    var allships = this.props.ships
    var condships = {};
    var bucketships = [];
    var allbucketsId = this.getAllBucketsId();
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
      if (cond >= 50) {
        if (condships[shiptype] == undefined) {
          condships[shiptype] = {"count": 1, list: [[p, lv, shipname, cond]]}
        } else {
          var oldcount = condships[shiptype].count;
          var oldlist = condships[shiptype].list;
          oldlist.push([p, lv, shipname, cond]);
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

  add_notify(){
    var anc_hour = document.getElementById("anc_hour").value;
    var anc_minute = document.getElementById("anc_minute").value;
    var anc_shiptype = document.getElementById("anc_shiptype").value;
    var anc_compare = document.getElementById("anc_compare").value;
    var anc_number = document.getElementById("anc_number").value;
    var anc_daily = document.getElementById("anc_daily").value;
    console.log(anc_hour,anc_minute,anc_shiptype,anc_compare,anc_number);
    var nownc = this.state.notify_cond;
    nownc.push([anc_hour,anc_minute,anc_shiptype,anc_compare,anc_number,anc_daily]);
    var savepath = join(window.APPDATA_PATH, 'cond_config','cond_notify.json');
    fs.writeFileSync(savepath, JSON.stringify(nownc));
  }

  load_notify(){
    var needload = this.state.needload;
    if(needload){
      var savedpath = join(window.APPDATA_PATH, 'cond_config','cond_notify.json');
      try{
        var datastr = fs.readFileSync(savedpath,'utf-8');
        var nownc = eval("(" + datastr + ")");
        this.setState({notify_cond:nownc,needload:false});
        return nownc;
      }catch(e){
        console.log(e);
        return [];
      }
    }else{
      return this.state.notify_cond;
    }
  }

  render() {
    const condshipinfo = this.getAllCondShip();
    const fleetmap = condshipinfo[0];
    const condships = condshipinfo[1];
    const bucketships = condshipinfo[2];
    const allShipTypes = this.props.$shipTypes;
    const allShipTypeId = Object.keys(allShipTypes);
    let nownc = this.load_notify();
    console.log('nownc:'+nownc);
    let hours = [];
    let minutes = [];
    let numbers = [];
    for(var i=0;i<24;i++){
      hours.push(i);
    }
    for(var i=0;i<60;i++){
      minutes.push(i);
    }
    for(var i=0;i<30;i++){
      numbers.push(i);
    }
    // 合并舰船种类
    let shiptypes = ["驱逐", "轻巡", "重巡", "战舰", "空母", "潜艇", "其他"];
    const mergeShip = (type) => {
      switch (type) {
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
          return ["揚陸艦", "工作艦", "補給艦", "潜水母艦"];
      }
    };

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
                    { "桶船" }
                  </NavItem>
                </Nav>
              </Col>
              <Col sm={12}>
                <Tab.Content>
                  {
                    shiptypes.map((shiptype, index) => {
                      if (shipCount[shiptype]) {
                        let listgroup = [], types = mergeShip(shiptype);
                        types.map((type) => {
                          const conddetail = condships[type], list = conddetail ? conddetail.list : [];
                          list.sort((a, b) => {
                            return b[1] - a[1]
                          });
                          if (conddetail) {
                            listgroup.push(<ListGroupItem active><span className="title-type">{type}:{conddetail ? conddetail.count : 0}</span></ListGroupItem>)
                          }
                          list.map((ship) => {
                            listgroup.push(
                              <ListGroupItem>
                                lv.{ship[1]} {fleetmap[ship[0]] ? '(' + fleetmap[ship[0]] + ')' : ''} {ship[2]}<span className={creteMoraleClass(ship[3])}>★{ship[3]}</span>
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
                              lv.{ship[1]} {ship[2]} {fleetmap[ship[0]] ? '(' + fleetmap[ship[0]] + ')' : ''} <span className={creteMoraleClass(ship[3])}>★{ship[3]}</span> {ximg}
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
        <div id="show_notify_cond" style={{display:""}}>
          {
            nownc.map(function(anotify){
              let dailystr;
              switch(anotify[5]) {
                case "0":
                  dailystr = "每天";
                  break;
                case "1":
                  dailystr = "周一";
                  break;
                case "2":
                  dailystr = "周二";
                  break;
                case "3":
                  dailystr = "周三";
                  break;
                case "4":
                  dailystr = "周四";
                  break;
                case "5":
                  dailystr = "周五";
                  break;
                case "6":
                  dailystr = "周六";
                  break;
                case "7":
                  dailystr = "周日";
                  break;
              }
              return(
                <div>
                  <span style={{width:"50px"}}>{dailystr}</span>
                  <span dangerouslySetInnerHTML={{__html: "&nbsp&nbsp&nbsp"}}>
                  </span>
                  <span style={{width:"35px"}}>{anotify[0]}</span>:
                  <span style={{width:"35px"}}>{anotify[1]}</span>
                  <span dangerouslySetInnerHTML={{__html: "&nbsp&nbsp&nbsp"}}>
                  </span>
                  <span style={{width:"50px"}}>{anotify[2]}</span>
                  <span dangerouslySetInnerHTML={{__html: "&nbsp&nbsp&nbsp"}}>
                  </span>
                  <span style={{width:"50px"}}>{anotify[3]}</span>
                  <span dangerouslySetInnerHTML={{__html: "&nbsp&nbsp&nbsp"}}>
                  </span>
                  <span style={{width:"35px"}}>{anotify[4]}</span>
                  <span dangerouslySetInnerHTML={{__html: "&nbsp&nbsp&nbsp"}}>
                  </span>
                  <Button>删除提醒</Button>
                </div>
              )
            })
          }
        </div>
        <div id="add_notify_cond" style={{display:""}}>
          <FormControl id="anc_daily" style={{width:"50px",display:'inline','text-align':'center'}} componentClass="select">
            <option value="0">每天</option>
            <option value="1">周一</option>
            <option value="2">周二</option>
            <option value="3">周三</option>
            <option value="4">周四</option>
            <option value="5">周五</option>
            <option value="6">周六</option>
            <option value="7">周日</option>
          </FormControl>
          <span dangerouslySetInnerHTML={{__html: "&nbsp&nbsp&nbsp"}}>
          </span>
          <FormControl id="anc_hour" style={{width:"35px",display:'inline','text-align':'center'}} componentClass="select">
            {hours.map(function(e){
              return(
                <option value={e}>{e}</option>
              )
            })}
          </FormControl>
          <span dangerouslySetInnerHTML={{__html: "&nbsp:&nbsp"}}>
          </span>
          <FormControl id="anc_minute" style={{width:"35px",display:'inline','text-align':'center'}} componentClass="select">
            {minutes.map(function(e){
              return(
                <option value={e}>{e}</option>
              )
            })}
          </FormControl>
          <span dangerouslySetInnerHTML={{__html: "&nbsp&nbsp&nbsp"}}>
          </span>
          <FormControl id="anc_shiptype" style={{width:"50px",display:'inline'}} componentClass="select">
            {
              allShipTypeId.map(function(ashiptype){
                let getShortShiptype = function(shiptype){
                  switch(shiptype)
                  {
                    case "海防艦":
                      return "海防";
                      break;
                    case "駆逐艦":
                      return "駆逐";
                      break;
                    case "軽巡洋艦":
                      return "軽巡";
                      break;
                    case "重雷装巡洋艦":
                      return "雷巡";
                      break;
                    case "重巡洋艦":
                      return "重巡";
                      break;
                    case "航空巡洋艦":
                      return "航巡";
                      break;
                    case "軽空母":
                      return "軽母";
                      break;
                    case "戦艦":
                      return "戦艦";
                      break;
                    case "航空戦艦":
                      return "航戦";
                      break;
                    case "正規空母":
                      return "空母";
                      break;
                    case "超弩級戦艦":
                      return "超弩";
                      break;
                    case "潜水艦":
                      return "潜艇";
                      break;
                    case "潜水空母":
                      return "潜母";
                      break;
                    case "補給艦":
                      return "補給";
                      break;
                    case "水上機母艦":
                      return "水母";
                      break;
                    case "揚陸艦":
                      return "揚陸艦";
                      break;
                    case "装甲空母":
                      return "装母";
                      break;
                    case "工作艦":
                      return "工作艦";
                      break;
                    case "練習巡洋艦":
                      return "練巡";
                      break;
                    case "潜水母艦":
                      return "潜水母艦";
                      break;
                    default:
                      return shiptype;
                      break;
                  }
                }
                let shiptypeobj = allShipTypes[ashiptype];
                let shotshiptype = getShortShiptype(shiptypeobj.api_name);
                return(
                  <option value={shiptypeobj.api_name}>
                    {shotshiptype}
                  </option>
                )
              })
            }
          </FormControl>
          <span dangerouslySetInnerHTML={{__html: "&nbsp&nbsp&nbsp"}}>
          </span>
          <FormControl id="anc_compare" style={{width:"50px",display:'inline','text-align':'center'}} componentClass="select">
            <option value="小于" key="小于">小于</option>
            <option value="大于" key="大于">大于</option>
          </FormControl>
          <span dangerouslySetInnerHTML={{__html: "&nbsp&nbsp&nbsp"}}>
          </span>
          <FormControl id="anc_number" style={{width:"35px",display:'inline','text-align':'center'}} componentClass="select">
            {numbers.map(function(e){
              return(
                <option value={e}>{e}</option>
              )
            })}
          </FormControl>
          <Button onClick={this.add_notify.bind(this)}>添加提醒</Button>
        </div>
      </div>
    )


  }
});