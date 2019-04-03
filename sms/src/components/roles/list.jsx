import React, { Component } from 'react';
import Joi from 'joi-browser';
import _ from 'lodash';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { deleteRoles } from '../../services/rolesService'
import ToastService from 'services/toastService'

export default class RolesList extends Component {

    state = {
        clientIds: [], entityIds: [], branchIds: [],
    }

    async componentDidMount() {
        const { data, rightsData } = this.props;
        this.setState({ data, rightsData });
        await this.initTableData();
    }

    schema = {
        branch: Joi.string().required().label("Department"),
        client: Joi.string().required().label("Client"),
        entity: Joi.string().required().label("Entity")
    };

    initTableData = async () => {
        const { hideColumns } = this.state;
        const columnHeaders = this.getColumnHeaders(this.props.scheduleType, this.props.prefixUrl);
        const columns = getColumns(columnHeaders, hideColumns);
        await this.setState({ columns, columnHeaders, hideColumns })
    }

    getColumnHeaders(scheduleType, prefixUrl = "") {
        let allKeys = ["Type", "actions"];
        let excludeKeys = [];
        let keys = _.filter(allKeys, (v) => !_.includes(excludeKeys, v))
        let def = {
            "sno": { dataField: 'sno', isDummyField: true, text: "S.No", formatter: serialNumberFormatter },
            "Type": { dataField: 'type', text: 'Type', sort: true, filter: getTextFilter() },

            "actions": { dataField: 'actions', isDummyField: true, text: "Actions", formatter: this.actionsFormatter }
        }
        return { "keys": keys, "def": def }
    }

    actionsFormatter = (cell, row, rowIndex, formatExtraData) => {
        const { rightsData } = this.state;
        let _form = "Role";
        let links = [];
        // rightsData && rightsData[_form] && rightsData[_form].view.value &&
        //     links.push(<div onClick={() => this.editFun(`/roles/view`, row)} className='badge badge-success'>View</div>)
        rightsData && rightsData[_form] && rightsData[_form].edit.value &&
            links.push(<div onClick={() => this.editFun(`/roles/edit`, row)} className='badge badge-warning'>Edit</div>)
        rightsData && rightsData[_form] && rightsData[_form].delete.value &&
            links.push(<div onClick={() => this.deleteTypes(row)} className='badge badge-danger'>Delete</div>)
        rightsData && rightsData[_form] && rightsData[_form].assign.value &&
            links.push(<div onClick={() => this.assignRoles(`/roles/assign`, row)} className='badge badge-danger'>Assign</div>)
        return <div className="actions">{links.concat(" ")}</div>
    }

    editFun = (url, Rolesdata) => {
     
        this.props.props.history.push({
            pathname: url,
            state: {
                Rolesdata
            }
        })
    }

    assignRoles = async (url, Rolesdata) => {
        this.props.props.history.push({
            pathname: url,
            state: {
                Rolesdata
            }
        })

    }
    deleteTypes = async (row) => {
        let params = `client=${row.client}&entity=${row.entity}&branch=${row.branch}&refid=${row._id}`
        let response = await deleteRoles(params)
        if (response.data.statusCode !== 1) return ToastService.Toast(response.data.message, 'default'); // Check Datas
        if (response.data.statusCode === 1) {
            await ToastService.Toast(response.data.message, 'default');
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

function getTextFilter(type = "default") {
    return textFilter({
        placeholder: '',
        delay: 1000
    })
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