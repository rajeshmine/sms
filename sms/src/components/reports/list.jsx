import _ from 'lodash';
import React, { Component } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledButtonDropdown } from 'reactstrap';
import XlsExport from 'xlsexport';
import ToastService from 'services/toastService'

import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';


export default class ReportList extends Component {

    state = {
        data: []
    }

    async componentDidMount() {
        const { data, rightsData } = this.props
        await this.setState({ data, rightsData })
        await this.initTableData()
    }

    initTableData = async () => {

        const { hideColumns } = this.state;
        const columnHeaders = await this.getColumnHeaders(this.props.type, this.props.prefixUrl);

        const columns = this.getColumns(columnHeaders, hideColumns);
        await this.setState({ columns, columnHeaders, hideColumns })
    }


    async exceltable(format) {
        const { type } = this.props
        let d;
        const { data } = this.state

        if (data && data.length > 0) {
            d = this.downloadxls(data)
            var xls = new XlsExport(d)
            if (type === 'assignment') {
                xls.exportToXLS('AssignmentList.xls')
            } else if (type === 'homework') {
                xls.exportToXLS('HomeworkList.xls')
            } else if (type === 'staff') {
                xls.exportToXLS('StaffList.xls')
            }
        } else {
            ToastService.Toast('Data Not Found!!!', "default")
        }

    }

    downloadxls(data) {
        const { type } = this.props
        let dataarr = []

        if (data && data.length > 0) {
            if (type === 'assignment') {
                for (let item of data) {
                    let obj = {
                        "User ID": item.studentId, "Topic": item.topic, "Subject": item.subject, "Marks": item.marks, "Total Mark": item.totalMarks, "Remarks": item.remarks
                    }
                    dataarr.push(obj)
                }
            } else if (type === 'homework') {
                for (let item of data) {
                    let obj = {
                        "User ID": item.studentId, "Topic": item.topic, "Subject": item.subject, "Remarks": item.remarks, "Status": item.status
                    }
                    dataarr.push(obj)
                }
            }
            return dataarr
        } else {
            return dataarr
        }
    }

    getTextFilter(type = "default") {
        return textFilter({
            placeholder: '',
            delay: 1000
        })
    }

    async getColumnHeaders(type, prefixUrl = "") {
        let allKeys = ["UserID", "Name", "Subject", "Topic", "Marks", "TotalMarks", "PaidAmount", "PaidDate", "Amount", "FineAmount", "Remarks", "Status", "sMark", "sReMark"];
        let excludeKeys = [];
        if (type === "attendance") {
            const { formdata: { month, year } } = this.props;
            let days = new Date(year, month, 0).getDate();
            await this.setState({
                days
            })
        }

        let def = {
            "sno": { dataField: 'sno', isDummyField: true, text: "S.No", formatter: this.serialNumberFormatter },
            "UserID": { dataField: 'studentId', text: 'User ID', sort: true, filter: this.getTextFilter(), },
            "Name": { dataField: 'name', text: 'Name', sort: true },
            "Topic": { dataField: 'topic', text: 'Topic', sort: true },
            "Marks": { dataField: 'marks', text: 'Marks', sort: true },
            "Status": { dataField: 'status', text: 'Status', sort: true },
            "Remarks": { dataField: 'remarks', text: 'Remarks', sort: true },
            "TotalMarks": { dataField: 'totalMarks', text: 'Total Marks', sort: true },
            "Subject": { dataField: 'subject', text: 'Subject', sort: true },
            "PaidAmount": { dataField: 'paidAmount', text: 'Paid Amount', sort: true },
            "PaidDate": { dataField: 'paidDate', text: 'Paid Date', sort: true },
            "Amount": { dataField: 'amount', text: 'Total Amount', sort: true },
            "FineAmount": { dataField: 'fineAmount', text: 'Fine Amount', sort: true },
            // Staff Report
            "sMark": { dataField: 'examReport[0].subjects[0].mark', text: 'Mark', sort: true },
            "sReMark": { dataField: 'examReport[0].subjects[0].remarks', text: 'Remark', sort: true },

        }
        switch (type) {

            case "attendance":
                const { formdata: { month, year } } = this.props;
                let days = new Date(year, month, 0).getDate();
                for (let i = 1; i <= days; i++) {
                    allKeys.push(i);
                    def[i] = { dataField: [i], text: i, sort: true, formatter: this.presentStatusFormatter, formatExtraData: `${i}` }
                }
                excludeKeys = ["Subject", "Topic", "sMark", "Marks", "TotalMarks", "PaidAmount", "PaidDate", "Amount", "FineAmount", "sReMark", "Remarks", "Status"]
                break;
            case "assignment":
                excludeKeys = ["Status", "PaidAmount", "PaidDate", "Amount", "FineAmount", "sReMark", "Remarks", "sMark"]
                break;
            case "homework":
                excludeKeys = ["Marks", "TotalMarks", "PaidAmount", "PaidDate", "Amount", "FineAmount", "sReMark", "Remarks", "sMark"]
                break;
            case "fees":
                excludeKeys = ["Subject", "Topic", "Marks", "TotalMarks", "sReMark", "Remarks"]
                break;
            case "staff":
                excludeKeys = ["Subject", "Topic", "Marks", "TotalMarks", "PaidAmount", "PaidDate", "Amount", "FineAmount", "Remarks", "Status",]
                break;
            default:
                excludeKeys = []
                break;
        }

        let keys = _.filter(allKeys, (v) => !_.includes(excludeKeys, v))
        return { "keys": keys, "def": def }
    }

    getColumns(columnsHeaders, hideColumns) {
        let columns = []
        const { keys, def } = columnsHeaders;
        _.forEach(keys, (key) => {
            columns.push({ ...def[key], hidden: _.includes(hideColumns, key) })
        })
        return columns;
    }

    presentStatusFormatter(cell, row, rowIndex, formatExtraData) {
        if (row[formatExtraData]) {
            if (row[formatExtraData]) {
                let status = row[formatExtraData].status;
                if (status === "P") {
                    return <span className="present">&#x2713;</span>
                } else {
                    return <span className="absent">X</span>;
                }
            } else {
                return '-';
            }
        }
        return '-'
    }
    serialNumberFormatter(cell, row, rowIndex, formatExtraData) {
        return rowIndex + 1
    }

    render() {
        //  const { type } = this.props
        const { data, columns } = this.state

        const { type, rightsData } = this.props
        let _form = _.upperFirst(type);

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
        return (
            <React.Fragment >
                <div className="d-md-flex align-items-md-center justify-content-md-between">

                    <div>
                        {
                            rightsData && rightsData[_form] && rightsData[_form].export && rightsData[_form].export.value && type !== 'attendance' && type !== 'staff' &&
                            <UncontrolledButtonDropdown >
                                <DropdownToggle caret className="btn btn-outline-secondary btn-sm" style={{ color: "#fff" }}>Download</DropdownToggle>
                                <DropdownMenu>
                                    <DropdownItem onClick={() => { this.exceltable('alluserxls') }}> Excel Format</DropdownItem>
                                </DropdownMenu>
                            </UncontrolledButtonDropdown>}&nbsp;
                    </div>
                </div>
                <br />
                {
                    columns &&
                    <BootstrapTable
                        keyField="studentId"
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