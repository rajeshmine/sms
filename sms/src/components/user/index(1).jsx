import React, { Component } from 'react';
import Header from 'components/common/header';
import SideNav from 'components/common/sideNav';
import UserList from './list';
import RestService from 'services/restService';
import Service from 'services/service';
import {getsuserListData } from 'services/userService';
import {getCurrentUser } from 'services/authService';
export default class UserRoot extends Component {
  state = {
    data: [

    ],
    parentData: [],
    prefixUrl: "",
    isPageLoading: true,
    isLoading: true,
    type:'',
    client:'',
    entity:'',
    department:'',
    branch:'',
    batch:'',
    uid:'',
  }

  async componentDidMount() {
   this.checkLoggedIn(); 
    const { clientId, entityId, branchId, departmentId, batchId } = this.props.match.params
    let refIds = []
    let prefixUrl = []
    if (clientId) {
      prefixUrl.push(clientId);
      refIds.push({ 'id': clientId, 'type': 'client' })
    }
    if (entityId) {
      prefixUrl.push(entityId);
      refIds.push({ 'id': entityId, 'type': 'entity' })
    }
    if (branchId) {
      prefixUrl.push(branchId);
      refIds.push({ 'id': branchId, 'type': 'branch' })
    }
    if (departmentId) {
      prefixUrl.push(departmentId);
      refIds.push({ 'id': departmentId, 'type': 'department' })
    }
    if (batchId) {
      prefixUrl.push(batchId);
      refIds.push({ 'id': batchId, 'type': 'batch' })
    }
    const url = prefixUrl.join("/");
    this.setState({ parentData: refIds, prefixUrl: url, isPageLoading: false })
  }
  generateSampleData = () => {
    let d = this.state.data;
    for (let i = 3; i < 100; i++) {
      d.push({ ...this.state.data[1], id: i })
    }
    return d;
  }  
  async checkLoggedIn() {  
    const loginInfo = await getCurrentUser()   
      this.setState({  
        type:loginInfo.role,
        client:loginInfo.client,
        entity:loginInfo.entity,
        department:loginInfo.department,
        branch:loginInfo.branch,
        batch:loginInfo.batch,
        uid:loginInfo.uid,
      },()=>{
        this.getUser((Data) => {
          this.setState({ data: Data, isLoading: false })
        });
      })
}
 getUser = async (callback) => {
    let d = this.state.data;
    let url=''
    const { type,client ,entity,department,branch,batch,uid} = this.state; 
    switch(type){
        case "sadmin":
          url = `usersList?type=${type}`
          break
        case "admin":
          url = `usersList?type=${type}`
          break
        case "client":
          url = `usersList?client=${client}&type=${type}`
          break
        case "entity":
          url = `usersList?client=${client}&type=${type}&entity=${entity}`
          break        
        case "branch":
          url = `usersList?client=${client}&type=${type}&entity=${entity}&branch=${branch}`
          break
        case "department":
          url = `usersList?client=${client}&type=${type}&entity=${entity}&branch=${branch}&department=${department}`
          break
        case "batch":
          url = `usersList?usersList?client=${client}&type=${type}&entity=${entity}&branch=${branch}&department=${department}&batch=${batch}`
          break
        case "student":
          url = `usersList?usersList?client=${client}&type=${type}&entity=${entity}&branch=${branch}&department=${department}&batch=${batch}&uid=${uid}`
          break
        case "parent":
          url = `usersList?usersList?client=${client}&type=${type}&entity=${entity}&department=${department}&batch=${batch}&uid=453&branch=${branch}`
          break
        default:
          url=''
          break
    }   
    const data = await getsuserListData(url)
    if (data.data.statusCode === 1) {
        const Data = data.data.data 
        callback (Data)
    }
  }

  render() {
    const { isPageLoading, type, isLoading, errors, data, parentData, prefixUrl } = this.state;
    return (
      <React.Fragment >
        <div className="row no-gutters bg-white page-clients">
          <Header />
          <div className="col-3 col-md-2">
            <SideNav />
          </div>
          <div className="col-9 col-md-10 p-3">
            {!isPageLoading && !isLoading && <UserList
              type={type}
              data={data}
              parentData={parentData}
              prefixUrl={prefixUrl} />}
          </div>
        </div>
      </React.Fragment >
    );
  }
}

