

import _ from 'lodash';
import React, { Component } from 'react';
import update from 'react-addons-update';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';
import paginationFactory from 'react-bootstrap-table2-paginator';


export default class ClientList extends Component {
    state = {
        data: [],
        type: "",
        columns: [],
        columnHeaders: { "keys": [], "def": {} },
        hideColumns: [],
        sort: [],
        isPageLoading: true,
        isLoading: false,
        errors: [],
        success: [],
        selected: [],
        exportData: [],
        toggleColumns: false,
        labels: {}
    }

    async componentDidMount() {
        const labels = this.getDefaultClientLabels();
        const { type } = this.props;      
        await this.initTableData()
        await this.setState({ data: this.props.data, type, labels, isPageLoading: false })
    }

    initTableData = async () => {
      
        const columnHeaders = this.getColumnHeaders(this.props.type, this.props.prefixUrl);
        const hideColumns = this.state.hideColumns;
        const columns = this.getColumns('client', columnHeaders, hideColumns);

        await this.setState({ columns, columnHeaders, hideColumns })
    }

    isColumnVisible = (key) => {
        return !_.includes(this.state.hideColumns, key)
    }

    toggleColumn = async (i) => {
        this.setState({ isLoading: true })
        await this.setState(prevState => {
            let hidden = prevState.columns[i] && prevState.columns[i]['hidden'] ? prevState.columns[i]['hidden'] : false;
            var index = this.state.hideColumns.indexOf(prevState.columns[i]['dataField'])
            let hideColumns = this.state.hideColumns
            if (!hidden) {
                hideColumns.push(prevState.columns[i]['dataField'])
            } else {
                if (index !== -1) {
                    hideColumns.splice(index, 1);
                }
            }

            return {
                columns: update(this.state.columns, { [i]: { hidden: { $set: !hidden } } }),
                hideColumns
            }
        })
        this.setState({ isLoading: false })
    }

    toggleColumns = () => {
        this.setState({ toggleColumns: !this.state.toggleColumns });
    }

    getColumns(type, columnsHeaders, hideColumns = []) {
        let columns = []
        const { keys, def } = columnsHeaders
        _.forEach(keys, (key) => {
            columns.push({ ...def[key], hidden: _.includes(hideColumns, key) })
        })
        return columns
    }

    getColumnHeaders(type, prefixUrl = "", dynamicLabels = {}) {
        let allKeys = ["name", "uid", "examName", "examId", "marks", "remarks", "totalmarks"]
        let excludeKeys = [];
        let keys = _.filter(allKeys, (v) => !_.includes(excludeKeys, v))
        let def = {
            "sno": { dataField: 'sno', isDummyField: true, text: "S.No", formatter: this.serialNumberFormatter },
            "name": { dataField: 'name', text: `Name`, filter: this.getTextFilter(), sort: true },
            "uid": { dataField: 'uid', text: `UserID`, filter: this.getTextFilter(), sort: true },
            "examName": { dataField: 'examName', text: `Exam Name`, filter: this.getTextFilter(), sort: true },
            "examId": { dataField: 'examId', text: `Exam Id`, filter: this.getTextFilter(), sort: true },
            "marks": { dataField: 'marks', text: `Marks`, sort: true },
            "remarks": { dataField: 'remarks', text: `Remarks`, sort: true },
            "totalmarks": { dataField: 'totalMarks', text: `Total Marks`, sort: true },
        }
        return { "keys": keys, "def": def }
    }

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    getDefaultClientLabels() {
        return {

        }
    }

    serialNumberFormatter(cell, row, rowIndex, formatExtraData) {
        return rowIndex + 1
    }




    getTextFilter(type = "default") {
        return textFilter({
            placeholder: '',
            delay: 1000
        })
    }




    redirectTo = (url) => {
        window.location.reload()
    }


    render() {
        const { isPageLoading, isLoading,  data, columns } = this.state;
       
        const options = {
            paginationSize: 4,
            pageStartIndex: 1,
            sizePerPage: 50,
            alwaysShowAllBtns: true, // Always show next and previous button
            hideSizePerPage: true, // Hide the sizePerPage dropdown always
            hidePageListOnlyOnePage: true, // Hide the pagination list when only one page
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
                {!isPageLoading && <React.Fragment>
                    {!isLoading &&
                        <div>
                            <BootstrapTable
                                keyField="id"
                                data={data}
                                columns={columns}
                                bootstrap4
                                classes="table table-bordered table-hover table-sm"
                                wrapperClasses="table-responsive"
                                filter={filterFactory()}
                                pagination={paginationFactory(options)}
                                noDataIndication={'No data to display here'}

                            />
                        </div>
                    }
                </React.Fragment>
                }
            </React.Fragment >
        );
    }
}

