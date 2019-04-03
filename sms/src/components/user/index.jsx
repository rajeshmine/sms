import React, { Component } from 'react';
import Header from 'components/common/header';
import SideNav from 'components/common/sideNav';
import UserList from './list';
import { getsuserListData } from 'services/userService';
import { rightsData } from 'services/rolesService';
import _ from 'lodash'
export default class UserRoot extends Component {
  state = {
    data: [

    ],
    parentData: [],
    prefixUrl: "",
    isPageLoading: true,
    isLoading: true,
    type: '',
    client: '',
    entity: '',
    department: '',
    branch: '',
    batch: '',
    uid: '',
  }
  async componentWillMount() {
    await this.props.isPageLoadingTrue();
  }

  async componentDidMount() {
    const { session } = this.props;
    await this.rightsData(session);
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

  rightsData = async (session) => {

    let res = await rightsData("user", session);

    let excludeModules = [];
    await _.map(_.keys(res), async v => {
      await _.map(_.keys(res[v]), k => {
        if (res[v][k]["value"])
          return excludeModules.push(v.toLowerCase())
      })
    })

    await this.setState({ excludeModules, rightsData: res || {} })

  }



  generateSampleData = () => {
    let d = this.state.data;
    for (let i = 3; i < 100; i++) {
      d.push({ ...this.state.data[1], id: i })
    }
    return d;
  }

    checkLoggedIn =async () => {
    let type = '';
    let { session: { data: sessionData } } = this.props;
    const { userType, userLevel, client, entity, branch, department, batch, uid } = sessionData;

    if (userType === 'staff')
      type = userLevel || userType;
    else
      type = userType;

    await this.setState({
      type: type,
      client: client,
      entity: entity,
      department: department,
      branch: branch,
      batch: batch,
      uid: uid,
      isLoading: true
    })
    await this.getUser((Data) => {
      this.setState({ data: Data, isLoading: false })
    });
  }

  getUser = async (callback) => {
    let url = ''
    const { type, client, entity, department, branch, batch, uid } = this.state;

    switch (type) {
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
      case "staff":
        url = `usersList?usersList?client=${client}&type=${type}&entity=${entity}&branch=${branch}&department=${department}&batch=${batch}`
        break
      case "student":
        url = `usersList?usersList?client=${client}&type=${type}&entity=${entity}&branch=${branch}&department=${department}&batch=${batch}&uid=${uid}`
        break
      case "parent":
        url = `usersList?usersList?client=${client}&type=${type}&entity=${entity}&department=${department}&batch=${batch}&uid=453&branch=${branch}`
        break
      default:
        url = ''
        break
    }
    const data = await getsuserListData(url)
    if (data.data.statusCode === 1) {
      const Data = data.data.data
      callback(Data)
    } else {
      callback([])
    }
  }

  render() {
    const { isPageLoading, type, isLoading, data, parentData, prefixUrl, rightsData } = this.state;
    const { session } = this.props;
    return (
      <React.Fragment >
        {session &&
          <div className="row no-gutters bg-white page-clients">
            <Header props={this.props} />
            <div className="col-3 col-md-2">
              <SideNav props={this.props} />
            </div>
            <div className="col-9 col-md-10 p-3">
              {!isPageLoading && !isLoading && rightsData && <UserList
                rightsData={rightsData}
                type={type}
                data={data}
                parentData={parentData}
                prefixUrl={prefixUrl}
                props={this.props} 
                checkLoggedIn= {this.checkLoggedIn}
                />}
            </div>
          </div>
        }
      </React.Fragment >
    );
  }
}

