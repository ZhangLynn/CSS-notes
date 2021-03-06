import React from 'react';
import {Modal,Input,Button,Icon} from 'antd';
import { jsPlumb } from 'jsplumb';
import uuidv1 from 'uuid/v1';
import $ from 'jquery'


const DynamicAnchors = ['Left']
const connectorStyle = { stroke: '#7AB02C', strokeWidth: 2, joinstyle: 'round' }
const connectorHoverStyle = { stroke: '#5c96bc', strokeWidth: 3 }
const endpointStyle = { fill: 'transparent', stroke: '#7AB02C', radius: 7, strokeWidth: 1 }
const endpointHoverStyle = { fill: '#5c96bc', stroke: '#5c96bc', radius: 7, strokeWidth: 1 }
const anEndpoint = {
  connector: 'Straight',
  endpoint: 'Dot',
  isSource: true,
  isTarget: true,
  paintStyle: endpointStyle,
  hoverPaintStyle: endpointHoverStyle,
  connectorStyle: connectorStyle,
  connectorHoverStyle: connectorHoverStyle
}
const Common = {
  anchor: 'AutoDefault',
  connector: 'Straight',
  endpoint: 'Dot',
  paintStyle: connectorStyle,
  hoverPaintStyle: connectorHoverStyle,
  endpointStyle,
  endpointHoverStyle,
    MaxConnections:20,
  // overlays:[
  //     ["Custom", {
  //         create:function(component) {
  //             return $("<button id='overlaybtn'>hhh</button>");
  //         },
  //         location:0.7,
  //         id:"customOverlay",
  //         // visible:false,
  //     }]
  // ]
}
export default class RightArea extends React.Component {
  state = {
    initialized: false,
    dialogVisible: false,
    datas: null,
    dialogTitle: '',
    labelText: '',
    nodes: [],
    edges: [],
      datas_right:null,
      nodes_right:[],
      edges_right:[],
    info: null,
  }

  componentDidMount() {
    this.init();
    this.refs.nodes = [];
    this.refs.nodes_right=[]
    let contanier=document.getElementById("contanier");
    let _this=this;
    contanier.addEventListener("scroll",function(){
        // _this.rjsp.repaintEverything()
    })
      window.onresize=function () {
          // _this.rjsp.repaintEverything()
      }
  }
  componentWillMount = () => {

  }
  hideModal = () => {
    this.setState({dialogVisible:false});
  }

  init = () => {
    this.rjsp = jsPlumb.getInstance({
        Connector: "Straight",
        Container: "contanier",
        ConnectionOverlays: [
        ['Arrow', { location: 1, id: 'arrow', width: 11, length: 11 }],
          ["Label", {  //标签参数设置
              location: 0.1,
              cssClass: "aLabel", //hover时label的样式名
              events: {
                  click:info=>{
                      console.log(info);
                  }
              },
              id:"foo",
              visible: true
          }],
          ["Custom", {
              create:component=> {
                  // console.log(component);
                  function editConnector(component){
                      console.log(component);
                  }
                  let div=document.createElement("div");
                  div.id="overlaybtn";
                  div.innerText="wo";
                  return div;
                  // console.log(this);
                  // return render(<div id='overlaybtn'><i class='icon' id='editOverlay'>编辑 </i><i class='icon'> 删除</i></div>);
                  // return $("<div id='overlaybtn'><i class='icon' id='editOverlay'>编辑 </i><i class='icon'> 删除</i></div>");
              },
              location:0.7,
              id:"customOverlay",
              visible:false,
              // events:{
              //   click:info=>{
              //       console.log(info);
              //   }
              // }
          }]
      ],
    })
    // this.props.jsp.droppable(this.refs.right, { drop: this.jspDrop })
    this.rjsp.bind('beforeDrop', this.jspBeforeDrop);
    // this.rjsp.bind("click",this.showEditConnectionBtn);
    this.fetchData();
      this.fetchDataRight()
  }

  fetchData () {
    var jsonString = '{"nodes":[{"id":"64d442f0-3d3a-11e8-bf11-4737b922d1c3","text":"11开始"},{"id":"64d442f0-3d3a-11e8-bf11-4737b922d31c3","text":"11开始"},{"id":"64d442f0-3d3a-11e8-bwf11-4737b922d1c3","text":"11开始"},{"id":"64d442f0-3d3a-11e8-bf11-4737b92d1c3","text":"11开始"},{"id":"64d442f0-3d3a-11e8-bf11-4737b922d1sc3","text":"11开始"},{"id":"6575b310-3d3a-11e8-bf11-4737b922d1c3","text":"过程"},{"id":"660cea00-3d3a-11e8-bf11-4737b922d1c3","text":"结束"}]}';
    var nodeData = JSON.parse( jsonString );
    this.setState({datas:nodeData, nodes: nodeData.nodes, edges: nodeData.edges},() => {
      this.initNodes(this.refs.nodes);
      // this.initEdges(nodeData.edges);
    });
  }
    fetchDataRight () {
        var jsonString = '{"nodes":[{"className":"square","id":"64d442f0-3d3a-11e8-bf11-4737b9221c3","text":"11开始","style":{"left":"372px","top":"29px"}},{"className":"circle","id":"6575b310-3d3a-11e8-bf11-4737b922d14c3","text":"过程","style":{"left":"357.515625px","top":"1750px"}},{"className":"rect","id":"660cea0f0-3d3a-11e8-bf11-4737b922d1c3","text":"结束","style":{"left":"388.515625px","top":"350px"}}]}';
        var nodeData = JSON.parse( jsonString );
        this.setState({datas_right:nodeData, nodes_right: nodeData.nodes},() => {
            this.initNodes(this.refs.nodes_right,"right");
        });
    }

  jspBeforeDrop = (info) => {
    info.targetId = info.dropEndpoint.elementId
    let connections = this.rjsp.getConnections({ source: info.sourceId, target: info.targetId })
    if (info.targetId === info.sourceId) {
      Modal.warning({
        title: '不可以自己连接自己'
      });
    } else {
      if (connections.length === 0) {  // 检察是否已经建立过连接
        this.setState({info});
        this.addEdge(info);
      } else {
        Modal.warning({
          title: '两个节点之间只能有一条连接'
        })
      }
    }
  }

  jspDrop = (info) =>{
    this.setState({info});
    let nodes = JSON.parse(JSON.stringify(this.state.nodes));
    nodes.push(this.createNode(info.drag.el, info.drop.el));
    this.setState({nodes},()=>{
      this.initNodes(this.refs.nodes[this.state.nodes.length-1]);
    });
  }

  createNode = (dragEl, dropEl) => {
    let rect = dropEl.getBoundingClientRect()
    return {
      className: dragEl.classList[0],
      id: uuidv1(),
      text: dragEl.innerText,
      style: {
        left: this.props.pos[0] - rect.left - dropEl.clientLeft + 'px',
        top: this.props.pos[1] - rect.top - dropEl.clientTop + 'px'
        // lineHeight: dragEl.clientHeight + 'px'
      }
    }
  }

  initNodes = (node,pos) => {
    // this.rjsp.draggable(node, {constrain:true});
    this.rjsp.setSuspendDrawing(true);
      let anchor="Right";
      if(pos==="right"){
          anchor="Left"
      }
      node.map(value=>{
          this.rjsp.addEndpoint(value.id,{uuid:value.id, isSource:true, isTarget:true,maxConnections: -1,},{anchor:"Right"})
      })
      // node.map(value=>{
      //   this.rjsp.addEndpoint(value.id,{
      //       uuid:value.id,
      //       connector: 'Straight',
      //       endpoint: 'Dot',
      //       isSource: true,
      //       isTarget: true,
      //       paintStyle: endpointStyle,
      //       hoverPaintStyle: endpointHoverStyle,
      //       connectorStyle: connectorStyle,
      //       connectorHoverStyle: connectorHoverStyle
      //   },{anchor})
      // })
      // DynamicAnchors.map(anchor => this.rjsp.addEndpoint(node, anEndpoint, { anchor }));
    //todo 只有下面这行没有dom存在会报错 can not find parentNode of null
    // this.rjsp.addEndpoint("0",{uuid:"ep0_0", isSource:true, isTarget:true});
    // this.rjsp.addEndpoint("1",{uuid:"ep1_0", isSource:true, isTarget:true});
    //   this.rjsp.addEndpoint("2",{uuid:"ep2_0", isSource:true, isTarget:true});
    // this.rjsp.addEndpoint("0",{uuid:"ep1"});
    // this.rjsp.addEndpoint("1",{uuid:"ep2"});
    // this.rjsp.connect({ uuids:["64d442f0-3d3a-11e8-bf11-4737b922d1c3","64d442f0-3d3a-11e8-bf11-4737b9221c3"] });
      // this.rjsp.connect({ uuids:["64d442f0-3d3a-11e8-bf11-4737b922d1c3","6575b310-3d3a-11e8-bf11-4737b922d14c3"] });
    this.rjsp.setSuspendDrawing(false,true);
  }

  initEdges = (edges) => {
    this.rjsp.setSuspendDrawing(true);
    let _this=this;
    let connectors=edges.map(edge => this.rjsp.connect(edge, Common))
      connectors.map(connector=>{
          connector.bind("click",function(){
              let overlay=connector.getOverlay("customOverlay");
              overlay.show();
              // let editEle=document.getElementById("editOverlay");
              // editEle.addEventListener('click',function(){
              //     _this.rjsp.deleteConnection(connector)
              // })
        })
      })
      // console.log(edges);
      // edges.map(edge => this.rjsp.connect(edge, Common).getOverlay('foo').setLabel(edge.labelText))
    this.rjsp.setSuspendDrawing(false,true);
  }

  showEditConnectionBtn=(info)=>{
      console.log(info);
      let connect=info.connector;
      let id=connect.getId();
      console.log(id);
      info.hideOverlay('Custom');

  }
  //   deleteEdge=(info)=>{
  //
  //     Modal.confirm({
  //         title:"删除连线",
  //         content:"确认删除这个连接关系吗?",
  //         onOk(){
  //             if(mapSourceId){
  //                 _this.rjsp.deleteConnectionsForElement(info.source.id)//删除指定连线
  //                 _this.setState({
  //                     connect_edges:_this.state.connect_edges.filter(edge=>{
  //                         if(edge.source===sourceId&&edge.target===targetId){
  //                             return false
  //                         }else{
  //                             return true
  //                         }
  //                     })
  //                 });
  //                 _this.props.removeMapModel({"access_token":"311",'id':mapSourceId});
  //
  //             }else {
  //                 console.log("删除连线失败 没有mapSourceId");
  //             }
  //
  //         },
  //         onCancel() {},
  //     })
  // }

  editLabelText = (info) => {
      console.log(info);
      this.setState({dialogVisible:true, info: info.component, labelText:info.labelText});
  }

  activeElem = () => {
    console.log('activeElem');
  }

  deleteNode = (event,node) => {
    event.stopPropagation();
    this.rjsp.deleteConnectionsForElement(node.id);
    let edges = this.rjsp.getAllConnections().map(connection => {
      return {
        source: connection.sourceId,
        target: connection.targetId,
        labelText: connection.getOverlay('label').labelText
      }
    });
    let nodes = Object.assign([],this.state.nodes);
    nodes.splice(nodes.findIndex(n=>n.id===node.id),1);
    this.setState({datas:{nodes,edges},nodes,edges}, ()=>{
      this.reload();
    });
  }
  
  addEdge = (info) => {
      let _this=this;
        let connector=this.rjsp.connect({ uuids:[info.sourceId,info.targetId] });
        // this.rjsp.connect({ source: info.sourceId, target: info.targetId },Common)
      // let connector=this.rjsp.connect({ source: info.sourceId, target: info.targetId }, Common);
      connector.bind("click",function(){
          let overlay=connector.getOverlay("customOverlay");
          overlay.show();
          // let editEle=document.getElementById("editOverlay");
          // editEle.addEventListener('click',function(){
          //     _this.rjsp.deleteConnection(connector)
          // })
      })
  }

  reload = () => {
    this.clearAll();
    this.setState({
      nodes: this.state.datas.nodes,
      edges: this.state.datas.edges
    })
    this.rjsp.bind('beforeDrop', this.jspBeforeDrop);
    this.initNodes(this.refs.nodes.filter(refNode=>refNode));  // 删除一个节点后，它对应的ref为null，要去掉
    this.initEdges(this.state.edges);
  }

  clearAll = () => {
    this.rjsp.reset();
    this.setState({nodes:[]});
  }

  changeLabel = (e) => {
    let value = e.target.value;
    this.setState({labelText:value});
  }

  saveLabel = () => {
    this.state.info.getOverlay('label').setLabel(this.state.labelText);
    this.hideModal();
  }

  saveDatas = () => {
    let datas = {
      nodes: this.state.nodes.map((node, index) => {
        node.style = this.getStyle(this.refs.nodes[index])
        return node
      }),
      edges: this.rjsp.getAllConnections().map(connection => {
        return {
          source: connection.sourceId,
          target: connection.targetId,
          labelText: connection.getOverlay('label').labelText
        }
      })
    }
    this.setState({datas});
    this.props.saveDatas(datas);
  }

  getStyle (node) {
    let container = this.refs.right.getBoundingClientRect()
    let rect = node.getBoundingClientRect()
    return {
      left: rect.left - container.left - this.refs.right.clientLeft + 'px',
      top: rect.top - container.top + - this.refs.right.clientTop + 'px'
    }
  }

  render(){
    const arr=[1,2,3,4]
    return (
      <div id="contanier" className="right-area" ref="right">
        <div className="left">
            {
              arr.map((value,index)=>{
                return(
                    <div className="source">
                      <div className="title">hhhh</div>
                        {this.state.nodes.map((node,index)=>{
                            return(
                                <div
                                    key={index}
                                    className={'node circle'}
                                    id={node.id}
                                    ref={nodes=>this.refs.nodes[index]=nodes}
                                    // style={node.style}
                                    onClick={this.activeElem}
                                >
                                    {node.text+"left"}
                                    <div className="delete-btn" onClick={event=>this.deleteNode(event,node)}>X</div>
                                </div>
                            )
                        })}
                    </div>
                )
              })
            }
            {/*{this.state.nodes.map((node,index)=>{*/}
                {/*return(*/}
                    {/*<div*/}
                        {/*key={index}*/}
                        {/*className={'node circle'}*/}
                        {/*id={node.id}*/}
                        {/*ref={nodes=>this.refs.nodes[index]=nodes}*/}
                        {/*// style={node.style}*/}
                        {/*onClick={this.activeElem}*/}
                    {/*>*/}
                        {/*{node.text+"left"}*/}
                        {/*<div className="delete-btn" onClick={event=>this.deleteNode(event,node)}>X</div>*/}
                    {/*</div>*/}
                {/*)*/}
            {/*})}*/}
        </div>
        <div className="right">
            {
                arr.map((value,index)=>{
                    return(
                        <div className="source">
                            <div className="title">hhhh</div>
                            {this.state.nodes_right.map((node,index)=>{
                                return(
                                    <div
                                        key={index}
                                        className={'node circle'}
                                        id={node.id}
                                        ref={nodes=>this.refs.nodes_right[index]=nodes}
                                        // style={node.style}
                                        onClick={this.activeElem}
                                    >
                                        {node.text+"right"}
                                        <div className="delete-btn" onClick={event=>this.deleteNode(event,node)}>X</div>
                                    </div>
                                )
                            })}
                        </div>
                    )
                })
            }

        </div>

      </div>
    );
  }
}
