import Joi from 'joi-browser';
import _ from 'lodash';
import React, { Component } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory  from 'react-bootstrap-table2-filter';
import paginationFactory from 'react-bootstrap-table2-paginator';

import { deleteCredentials } from '../../services/clientCredentialService'; 
import ToastService from 'services/toastService'



export default class CredentialsList extends Component {
    state = {
        clientIds: [], entityIds: [], branchIds: [],
    }

    async componentDidMount() {

        const { data, form } = this.props 

        if (form === 'sms') {
            if (data && data.length > 0 && data[0].sms !== undefined && data[0].sms !== [] && data[0].sms.length > 0) {
                this.setState({ data }, () => { })
                await this.initTableData()
            } else {
                this.setState({ data: [] }, () => { })
                await this.initTableData()
            }
        }
        if (form === 'mail') {
            if (data && data.length > 0 && data[0].email !== undefined && data[0].email !== [] && data[0].email.length > 0) {
                this.setState({ data }, () => { })
                await this.initTableData()
            } else {
                this.setState({ data: [] }, () => { })
                await this.initTableData()
            }
        }

    }

    schema = {
        branch: Joi.string().required().label("Department"),
        client: Joi.string().required().label("Client"),
        entity: Joi.string().required().label("Entity")
    };

    initTableData = async () => {
        const { hideColumns } = this.state;
        const columnHeaders = this.getColumnHeaders(this.props.form, this.props.prefixUrl);
        const columns = getColumns(columnHeaders, hideColumns);
        await this.setState({ columns, columnHeaders, hideColumns })
    }

    getColumnHeaders(form, prefixUrl = "") {
        let allKeys = ["UserName", "Mail Id", "AccessKey", "Url", "Password", "Sender", "actions"];
        let excludeKeys = [], username;
        switch (form) {
            case "mail":
                excludeKeys = ["Url", "Password", "Sender", "AccessKey"]
                break;
            case "sms":
                excludeKeys = ["Mail Id", "AccessKey"]
                break;
            default:
                break;
        }
        if (form === 'mail')
            username = `email[0].userName`
        if (form === 'sms')
            username = `sms[0].userName`

        let keys = _.filter(allKeys, (v) => !_.includes(excludeKeys, v))
        let def = {
            "sno": { dataField: 'sno', isDummyField: true, text: "S.No", formatter: serialNumberFormatter },
            "UserName": { dataField: `${username}`, text: 'UserName ', sort: true },
            "Mail Id": { dataField: 'email[0].mail', text: 'Mail Id ', sort: true },
            "AccessKey": { dataField: 'email[0].accessKey', text: 'AccessKey', sort: true },
            "Url": { dataField: 'sms[0].url', text: 'Url', sort: true },
            "Password": { dataField: 'sms[0].senderId', text: 'Password ', sort: true },
            "Sender": { dataField: 'sms[0].senderId', text: 'Sender ', sort: true },
            "actions": { dataField: 'actions', isDummyField: true, text: "Actions", formatter: this.actionsFormatter }
        }

        return { "keys": keys, "def": def }
    }


    actionsFormatter = (cell, row, rowIndex, formatExtraData) => {
       
        let links = []
        links.push(<div onClick={() => this.editFun(row)} className='badge badge-warning'>Edit</div>)
        if (row.status === 'active') {
            links.push(<div onClick={() => this.deleteCredentials(row)} className='badge badge-danger'>Delete</div>)
        }
        return <div className="actions">{links.concat(" ")}</div>
    }

    editFun = (data) => {
        const { form } = this.props
        if (form === 'mail') {
            let path = `/credentials/mail/edit`
            this.props.props.history.push({
                pathname: path,
                state: {
                    data
                }
            })
        } else {
            let path = `/credentials/sms/edit`
            this.props.props.history.push({
                pathname: path,
                state: {
                    data
                }
            })
        }
    }

    deleteCredentials = async (row) => {
        const { refreshTable } = this.props;
        const { form } = this.props
        let response;
        if (form === 'sms') {
            let params = `client=${row.client}&entity=${row.entity}&branch=${row.branch}&userName=${row.sms[0].userName}&type=sms`
      
            response = await deleteCredentials(params)
        } else if (form === 'mail') {
            let params = `client=${row.client}&entity=${row.entity}&branch=${row.branch}&userName=${row.email[0].userName}&type=email`
            response = await deleteCredentials(params)
        }
        if (response.data.statusCode !== 1) return ToastService.Toast(response.data.message,   'default');
        if (response.data.statusCode === 1) {
            await ToastService.Toast(response.data.message,'default');
            refreshTable()
        }
    }

    render() {
        const options = {
            paginationSize: 4,
            pageStartIndex: 1,
            sizePerPage: 100,
            alwaysShowAllBtns: true,
            hideSizePerPage: true,
            hidePageListOnlyOnePage: true,
            firstPageText: 'First',
            prePageText: 'Back',
            nextPageText: 'Next',
            lastPageText: 'Last',
            nextPageTitle: 'First page',
            prePageTitle: 'Pre page',
            firstPageTitle: 'Next page',
            lastPageTitle: 'Last page',
            showTotal: true
        };
        const { data, columns } = this.state; 
        return (
            <React.Fragment >
                {data &&
                    <BootstrapTable
                        keyField="_id"
                        data={data}
                        columns={columns}
                        bootstrap4
                        pagination={paginationFactory(options)}
                        classes="table table-bordered table-hover table-sm"
                        wrapperClasses="table-responsive"
                        filter={filterFactory()}
                        noDataIndication={'No data to display here'}

                    />
                }
            </React.Fragment>)
    }
}



function serialNumberFormatter(cell, row, rowIndex, formatExtraData) {
    return rowIndex + 1
}

function getColumns(columnsHeaders, hideColumns) {
    let columns = []
    const { keys, def } = columnsHeaders;

    _.forEach(keys, (key) => {
        columns.push({ ...def[key], hidden: _.includes(hideColumns, key) })
    })
    return columns;
}