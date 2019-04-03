import 'styles/client.scss';

import Header from 'components/common/header';
import SideNav from 'components/common/sideNav';
import React, { Component, Fragment } from 'react';
import { getClients } from 'services/clientService';
import ClientList from './list';
import { rightsData } from 'services/rolesService';
import _ from 'lodash';
export default class Clients extends Component {
    state = {
        data: [],
        parentData: [],
        prefixUrl: "",
        isPageLoading: true,
        isLoading: false,
        clientTable: false
    }

    async componentWillMount() {
        await this.props.isPageLoadingTrue();
    }
    async componentDidMount() {
        const { session } = this.props;
        await this.rightsData(session);
        await this.getClients();
    }
    getClients = async() => {        
        let clientData;
        let prefixUrl = ''
        const { type, clientid, entityid, branchid,  } = this.props.match.params;
        let data = [];
        switch (type) {
            case 'client':
                clientData = await getClients('type=sadmin')
                clientData = clientData.data;
                prefixUrl = ''
                break
            case 'entity':

                clientData = await getClients(`type=client&client=${clientid}`)
                clientData = clientData.data

                prefixUrl = `${clientid}`
                break
            case 'branch':

                clientData = await getClients(`type=entity&client=${clientid}&entity=${entityid}`)
                clientData = clientData.data

                prefixUrl = `${clientid}/${entityid}`
                break
            case 'department':
                clientData = await getClients(`type=branch&client=${clientid}&entity=${entityid}&branch=${branchid}`)
                clientData = clientData.data

                prefixUrl = `${clientid}/${entityid}/${branchid}`
                break
            case 'batch':
             
                break
            default:
                break;
        }


        let obj, name;
        if (clientData.statusCode === 1) {
            for (let item of clientData.data) { 
                if (type === "client")
                    name = item.name && item.name.name
                if (type === "entity")
                    name = item.name && item.name[0] && item.name[0].name
                if (type === "branch")
                    name = item.name
                if (type === "department")
                    name = item.name && item.name.shortName
                obj = {
                    "type": type,
                    "id": item.id,
                    "icon": item.name.icon || '',
                    "name": name || '',
                    "noEntity": (item.Entity && item.Entity.length) || 0,
                    "noBranch": (item.Branch && item.Branch.length) || 0,
                    "noDepartment": (item.Department && item.Department.length) || 0,
                    "noBatch": (item.Batch && item.Batch.length) || 0,
                    "noStudent": (item.Student && item.Student.length) || 0,
                    "noStaff": (item.Staff && item.Staff.length) || 0,
                    "row": item
                }
                data.push(obj);
            }
        } else {
            data = [];
        } 
        let refIds = [];
        const url = prefixUrl;
        await this.setState({ clientTable: false })
        await this.setState({ data, type, parentData: refIds, prefixUrl: url, isPageLoading: false, clientTable: true })
    }



    rightsData = async (session) => {

        let res = await rightsData("clients", session); 
        let excludeModules = [];
        await _.map(_.keys(res), async v => {
            await _.map(_.keys(res[v]), k => {
                if (res[v][k]["value"])
                    return excludeModules.push(v.toLowerCase())
            })
        }) 
        await this.setState({ excludeModules, rightsData: res || {} }) 
    }

    renderClientList() {
        const { data, parentData, prefixUrl, type, rightsData } = this.state;
        return <ClientList type={type}
            data={data}
            parentData={parentData}
            prefixUrl={prefixUrl} props={this.props}
            rightsData={rightsData} 
            refreshTable = {this.getClients} />
    }
    render() {
        const {  rightsData } = this.state;
        const { session } = this.props;
        return (
            <Fragment>
                {session &&
                    <div className="row no-gutters bg-white page-client">
                        <Header props={this.props} />
                        <div className="col-3 col-md-2 sidemenu-wrapper">
                            <SideNav props={this.props} />
                        </div>
                        <div className="col-9 col-md-10 p-3 content">
                            {this.state.clientTable && rightsData &&
                                this.renderClientList()
                            }
                        </div>
                    </div>
                }
            </Fragment>
        );
    }
}

