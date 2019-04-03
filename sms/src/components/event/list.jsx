import Joi from 'joi-browser';
import _ from 'lodash';
import React, { Component } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';
import paginationFactory from 'react-bootstrap-table2-paginator';

import { deleteEvent } from '../../services/eventService'
import ToastService from 'services/toastService'

export default class EventList extends Component {

    state = {
        clientIds: [], entityIds: [], branchIds: [],
    }

    async componentDidMount() {
        let Data = [];
        const { eventformType, rightsData } = this.props
        this.setState({ rightsData })
        if (eventformType === 'addAttendees') {
            const { data } = this.props
            Data = data
            this.setState({ Data }, () => { })
            await this.initTableData()
        } else if (eventformType === 'gallery') {
            const { data } = this.props
            Data = [];
            for (let item of data) {
                item['event'].map(sitem => {
                    sitem["title"] = item["title"];
                    return ''
                });
                Data.push(_.concat(item['event']));
            }
            Data = [].concat.apply([], Data);
            this.setState({ Data })
            await this.initTableData()
        }
    }

    schema = {
        branch: Joi.string().required().label("Department"),
        client: Joi.string().required().label("Client"),
        entity: Joi.string().required().label("Entity")
    };

    initTableData = async () => {
        const { hideColumns } = this.state;
        const columnHeaders = this.getColumnHeaders(this.props.eventformType, this.props.prefixUrl);
        const columns = getColumns(columnHeaders, hideColumns);
        await this.setState({ columns, columnHeaders, hideColumns })
    }

    getColumnHeaders(eventformType, prefixUrl = "") { //dynamic headers        
        let allKeys = ["Event Name", "Student Name", "Department ID", "Batch Id", "Fee", "Event", "BannerImage", "actions"];
        let excludeKeys = [];
        switch (eventformType) {
            case "addAttendees":
                excludeKeys = ["BannerImage", "Event"]
                break;
            case "gallery":
                excludeKeys = ["Event Name", "Student Name", "Department ID", "Batch Id", "Fee", "actions"]
                break;
            default:
                break;
        }
        let keys = _.filter(allKeys, (v) => !_.includes(excludeKeys, v))
        let def = {
            "sno": { dataField: 'sno', isDummyField: true, text: "S.No", formatter: serialNumberFormatter },
            "Event Name": { dataField: 'event', text: 'Event Name ', sort: true, filter: getTextFilter() },
            "Student Name": { dataField: 'studentName', text: 'Student Name ', sort: true, filter: getTextFilter() },
            "Department ID": { dataField: 'departmentId', text: 'Department ID', sort: true, filter: getTextFilter() },
            "Batch Id": { dataField: 'batchId', text: 'Batch Id', sort: true, filter: getTextFilter() },
            "Fee": { dataField: 'fee', text: 'Fee', sort: true, filter: getTextFilter() },
            "Event": { dataField: 'title', text: 'Event', sort: true, filter: getTextFilter() },
            "BannerImage": { dataField: 'BannerImage', isDummyField: true, text: "BannerImage", formatter: this.imageFormatter },


            "actions": { dataField: 'actions', isDummyField: true, text: "Actions", formatter: this.actionsFormatter }
        }
        return { "keys": keys, "def": def }
    }

    imageFormatter = (cell, row, rowIndex, formatExtraData) => {
        let data = row.gallery[0].url
        return (
            <div className="icon" style={{ backgroundImage: `url(${data})`, width: '150px', height: "100px" }}></div>
        )
    }

    actionsFormatter = (cell, row, rowIndex, formatExtraData) => {
        const { rightsData } = this.state;
        const { eventformType } = this.props;
        let _form = eventformType;
        let links = []
        rightsData && rightsData[_form] && rightsData[_form].edit.value &&
            links.push(<div onClick={() => this.editFun(`/event/edit/`, row)} className='badge badge-warning'>Edit</div>)
        rightsData && rightsData[_form] && rightsData[_form].delete.value && row.status === 'active' &&
            links.push(<div onClick={() => this.deleteAttendees(row)} className='badge badge-danger'>Delete</div>)
        rightsData && rightsData[_form] && rightsData[_form].delete.value && row.status !== 'active' &&
            links.push(<div onClick={() => this.deleteAttendees(row)} className='badge badge-danger'>UnBlock</div>)

        return <div className="actions">{links.concat(" ")}</div>
    }

    editFun = (url, eventdata) => {
        const { eventformType } = this.props
        let path = url + eventformType;
        this.props.props.history.push({
            pathname: path,
            state: {
                eventdata
            }
        })
    }

    deleteAttendees = async (row) => {
        const { refreshTable } = this.props; 
        let response;
        let params = `client=${row.client}&entity=${row.entity}&branch=${row.branch}&departmentId=${row.departmentId}&batchId=${row.batchId}&student=${row.student}&event=${row.event}`
        response = await deleteEvent(params)
        if (response.data.statusCode !== 1) return ToastService.Toast(response.data.message,'default');
        if (response.data.statusCode === 1) {
            await ToastService.Toast(response.data.message,'default');
            refreshTable();   
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
        const { Data, columns } = this.state;
        return (
            <React.Fragment >
                {Data &&
                    <BootstrapTable
                        keyField="_id"
                        data={Data}
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

function getTextFilter(type = "default") { //Bootstrap filter
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

