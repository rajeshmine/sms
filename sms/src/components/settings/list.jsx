import _ from 'lodash';
import React, { Component } from 'react'; 
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { NavLink } from 'react-router-dom';

import { deleteParticularType, settingsTitleDelete, deletegeneralSettings, deleteSettingsReligion } from '../../services/settingsService'


export default class SettingsList extends Component {

    state = { data: [], columns: [], }

    async componentDidMount() {
      
        const { data, rightsData } = this.props
    
        this.setState({ data, rightsData })
        await this.assignColumns()
    }

    async  assignColumns() {
        const { formType } = this.props
        if (formType === 'department' || formType === 'batch' || formType === 'boardtype' || formType === 'religion' || formType === 'title') {
          
            await this.setState({
                columns: [
                    { dataField: 'code', text: 'Code' },
                    { dataField: 'shortName', text: 'Short Name' },
                    { dataField: 'displayName', text: 'Name', filter: textFilter() },
                    { dataField: 'actions', isDummyField: true, text: "Actions", formatter: this.actionsFormatter }
                ]
            })
        } else if (formType === 'language') {
            await this.setState({
                columns: [
                    { dataField: 'code', text: 'Code' },
                    { dataField: 'name', text: 'Name', filter: textFilter() },
                    { dataField: 'actions', isDummyField: true, text: "Actions", formatter: this.actionsFormatter }
                ]
            })
        } else if (formType === 'caste') {
            await this.setState({
                columns: [
                    { dataField: 'code', text: 'Code' },
                    { dataField: 'shortName', text: 'Name' },
                    { dataField: 'name', text: 'Full Name', filter: textFilter() },
                    { dataField: 'actions', isDummyField: true, text: "Actions", formatter: this.actionsFormatter }
                ]
            })
        } else if (formType === 'subcaste') {
            await this.setState({
                columns: [
                    { dataField: 'code', text: 'Code' },
                    { dataField: 'name', text: 'Name', filter: textFilter() },
                    { dataField: 'actions', isDummyField: true, text: "Actions", formatter: this.actionsFormatter }
                ]
            })
        } else if (formType === 'state') {
            await this.setState({
                columns: [

                    { dataField: 'country', text: 'Country Code' },
                    { dataField: 'code', text: 'Id' },
                    { dataField: 'name', text: 'State Name', filter: textFilter() },
                    { dataField: 'actions', isDummyField: true, text: "Actions", formatter: this.actionsFormatter }
                ]
            })
        }
    }

    actionsFormatter = (cell, row, rowIndex, formatExtraData) => {

        const { rightsData } = this.state;
        const { formType } = this.props;
        let _form = _.upperFirst(formType);
     
        let links = []

        rightsData && rightsData[_form] && rightsData[_form].edit.value &&
            links.push(<div onClick={() => this.editFun(`/settings/edit/${formType}`, row)} className='badge badge-warning'>Edit</div>)
        rightsData && rightsData[_form] && rightsData[_form].delete.value &&
            links.push(<div onClick={() => this.actionSetting(row)} className='badge badge-danger'>Delete</div>)
      
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

    actionSetting = async (row) => {
      
        const { refreshTable, formType } = this.props
        const {  _id } = row
        let res = '';
        if ((formType === 'department') || (formType === 'batch')) {
            let params = `client=${row.client}&entity=${row.entity}&branch=${row.branch}&id=${row._id}`
            res = await deleteParticularType(params)
        } else if ((formType === 'title')) {
            let title = `id=${row._id}`
            res = await settingsTitleDelete(title)
           
        } else if ((formType === 'religion')) {
            let religion = `id=${row._id}`
            res = await deleteSettingsReligion(religion)
            
        } else if ((formType === 'state')) {
            let params = `country?type=state&id=${_id}`
            res = await deletegeneralSettings(params)
           
        } else if ((formType === 'language')) {

            let params = `language?type=language&id=${_id}`
            res = await deletegeneralSettings(params)
           
        }

        else {
            let params = ''
            if ((formType === 'subcaste') || (formType === 'caste')) {
                params = `caste?type=${formType}&id=${_id}`
            } else {
                params = formType
            }
            res = await deletegeneralSettings(params)
        }
        if (res.data.statusCode === 1) {            
            refreshTable();
        }
    }

    adduserNavigation() {
        const { formType } = this.props
        return <NavLink className="btn btn-primary btn-sm" to={`/settings/add/${formType}`}>+ Add {formType}</NavLink>
    }

    render() {
        const options = {
            paginationSize: 4,
            pageStartIndex: 1,
            sizePerPage: 50,
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
        const { data, columns } = this.state
        return (
            <React.Fragment >

               
                {columns.length > 0 &&
                    <BootstrapTable
                        keyField="uid"
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

