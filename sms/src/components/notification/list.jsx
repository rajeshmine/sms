import Joi from 'joi-browser';
import _ from 'lodash';
import React, { Component } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';
import paginationFactory from 'react-bootstrap-table2-paginator';
 
import ToastService from 'services/toastService'
import { deleteScheduleDetails } from '../../services/scheduleService'


export default class NotificationList extends Component {

    state = {
        clientIds: [], entityIds: [], branchIds: [],
    }

    async componentDidMount() {
        const { data } = this.props
      
        this.setState({ data }, () => { })
        await this.initTableData()
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
        let allKeys = ["Type", "Title", "NoofDays", "Subject", "Marks", "Remarks", "Description", "BannerImage", "URL", "Mode", "FromDate", "ToDate", "Syllabus", "TotalMark", "NoofTimes", "actions"];
        let excludeKeys = [];
        switch (scheduleType) {
            case "exam":
                excludeKeys = ["NoofDays", "Subject", "BannerImage", "URL", "NoofTimes", "Marks", "Remarks", "Type", "Syllabus"]
                break;
            case "event":
                excludeKeys = ["NoofDays", "Subject", "BannerImage", "Marks", "Remarks", "Mode", "NoofTimes", "Syllabus", "TotalMark", "Type"]
                break;

        }
        let keys = _.filter(allKeys, (v) => !_.includes(excludeKeys, v))
        let def = {
            "sno": { dataField: 'sno', isDummyField: true, text: "S.No", formatter: serialNumberFormatter },
            "Type": { dataField: 'type', text: 'Type', sort: true, filter: getTextFilter() },
            "Title": { dataField: 'title', text: 'Title', sort: true, filter: getTextFilter() },
            "NoofDays": { dataField: 'attendance.noOfTimesTaken', text: 'No of Days', sort: true, filter: getTextFilter() },
            "Subject": { dataField: 'title', text: 'Subject', sort: true, filter: getTextFilter() },
            "Marks": { dataField: 'assignment[0].mark', text: 'Marks', sort: true, filter: getTextFilter() },
            "Remarks": { dataField: 'title', text: 'Remarks', sort: true, filter: getTextFilter() },
            "Description": { dataField: 'desc', text: 'Description', sort: true, filter: getTextFilter() },
            "BannerImage": { dataField: 'title', text: 'Banner Image', sort: true, filter: getTextFilter() },
            "URL": { dataField: 'event[0].website.url', text: 'URL', sort: true, filter: getTextFilter() },
            "Mode": { dataField: 'exam[0].mode', text: 'Mode', sort: true, filter: getTextFilter() },
            "FromDate": { dataField: 'from.date', text: 'From Date', sort: true, filter: getTextFilter() },
            "ToDate": { dataField: 'to.date', text: 'To Date', sort: true, filter: getTextFilter() },
            "Syllabus": { dataField: 'exam[0].syllabus', text: 'Syllabus', sort: true, filter: getTextFilter() },
            "TotalMark": { dataField: 'exam[0].outoff', text: 'Total Mark', sort: true, filter: getTextFilter() },
            "NoofTimes": { dataField: 'attendance[0].noOfTimesTaken', text: 'No of Times', sort: true, filter: getTextFilter() },
            "actions": { dataField: 'actions', isDummyField: true, text: "Actions", formatter: this.actionsFormatter }
        }
        return { "keys": keys, "def": def }
    }
    actionsFormatter = (cell, row, rowIndex, formatExtraData) => {
        let links = []
        links.push(<div onClick={() => this.editFun(`/schedule/edit/`, row)} className='badge badge-warning'>Edit</div>)
        links.push(<div onClick={() => this.deleteScheduleTypes(row)} className='badge badge-danger'>Delete</div>)
        return <div className="actions">{links.concat(" ")}</div>
    }

    editFun = (url, scheduledata) => {
        const { scheduleType } = this.props
        let path = url + scheduleType;
        this.props.props.history.push({
            pathname: path,
            state: {
                scheduledata
            }
        })
    }

    deleteScheduleTypes = async (row) => {
        let response;
        let params = `client=${row.client}&entity=${row.entity}&branch=${row.branch}&id=${row._id}`
        response = await deleteScheduleDetails(params)
        if (response.data.statusCode !== 1) return ToastService.Toast(response.data.message,  'default');
        if (response.data.statusCode === 1) {
            await ToastService.Toast(response.data.message, 'default');
            this.initTableData()
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

