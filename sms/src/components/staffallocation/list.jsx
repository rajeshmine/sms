
import React, { Component } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory , { textFilter } from 'react-bootstrap-table2-filter';
import paginationFactory from 'react-bootstrap-table2-paginator';

import {  deleteStaffAllocation } from 'services/staffAllocationService';
import ToastService from 'services/toastService';

export default class StaffAllocationList extends Component {

    state = {
        data: []
    }

    async componentDidMount() {
        const { data } = this.props      
        await this.setState({ data })
        this.tableDate()
    }

    actionsFormatter = (cell, row, rowIndex, formatExtraData) => {
        let links = []
        links.push(<div onClick={() => this.editFun(`/staff/edit/staffallocation/`, row)} className='badge badge-warning'>Edit</div>)
        links.push(<div onClick={() => actionSetting(row)} className='badge badge-danger'>Delete</div>)
        return <div className="actions">{links.concat(" ")}</div>
    }

    editFun = (url, data) => {
        let row = data
        this.props.props.history.push({
            pathname: url,
            state: {
                row
            }
        })
    }

    async tableDate() {        
        let data = this.state.data
        for (let item of data) {          
            if (item) {
                await this.setState({
                    homeworkView: data
                })
            }
        }
    }


    getTextFilter(type = "default") {
        return textFilter({
          placeholder: '',
          delay: 1000
        })
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
        const columns = [
            { text: "Date", sort: true, hidden: false, dataField: "date" },
            { text: "Staff ID", sort: true, hidden: false, dataField: "staffId" ,filter: this.getTextFilter() },
            { text: "Staff Name", sort: true, hidden: false, dataField: "staffName" ,filter: this.getTextFilter() },

            { text: "Hour", sort: true, hidden: false, dataField: "hour" },
            { text: "Work", sort: true, hidden: false, dataField: "description" },
            { dataField: 'actions', isDummyField: true, text: "Actions", formatter: this.actionsFormatter }

        ];
        const {  homeworkView } = this.state
        return (
            <React.Fragment >

                <br />
                {
                    homeworkView &&
                    <BootstrapTable
                        keyField="staffId"
                        data={homeworkView}
                        columns={columns}
                        bootstrap4
                        pagination={paginationFactory(options)}
                        classes="table table-bordered table-hover table-sm"
                        wrapperClasses="table-responsive"
                        filter={filterFactory()}

                    />
                }
            </React.Fragment>)
    }
}

async function actionSetting(row) {  
    let params = `client=${row.client}&entity=${row.entity}&branch=${row.branch}&department=${row.department}&batch=${row.batch}&staffId=${row.staffId}`
    let res = await deleteStaffAllocation(params)  
    if (res.data.statusCode === 1) return ToastService.Toast(res.data.message, 'default')
}

