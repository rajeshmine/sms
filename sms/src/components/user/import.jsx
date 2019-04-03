import 'styles/App.scss';

import Select from "components/common/select";
import _ from 'lodash';
import React, { Component } from 'react';
import update from 'react-addons-update';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';
import paginationFactory from 'react-bootstrap-table2-paginator';
import {
    Breadcrumb,
    BreadcrumbItem,
    Collapse,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    UncontrolledButtonDropdown, Container, Row, Col, Modal, ModalBody, ModalHeader, Form

} from 'reactstrap';
import { CSVLink } from "react-csv";
import { NavLink } from 'react-router-dom';
import XlsExport from 'xlsexport';
import XLSX from 'xlsx';
import Service from '../../services/service';

const dataSample = [{
    "User ID": "", "Password": "", "Email Id": "", "Mobile No": "", "Title": "", "Name": "",
    "Gender": "", "DOB": "", "BloodGroup": "", "MotherTongue": "", "Caste": "", "Religion": "", "Aadhaar Number": "", "Nationality": "", "Email Id": "", "Mobile No": "",
    "Address": "", "Secondary Email": "", "Secondary Mobile No": "", "Secondary Address": "",
    "tenth Percentage": "", "tenth Name": "", "tenth Affiliated": "", "tenth From": "", "tenth To": "", "tenth Other details": "", "twelth Percentage": "", "twelth Name": "", "twelth Affiliated": "", "twelth From": "", "twelth To": "", "twelth Other details": "", "ug Percentage": "", "ug Name": "", "ug Affiliated": "", "ug From": "", "ug To": "",
    "ug Other details": "", "Project Name": "", "Date": "", "Project Ongoing": "", "Associated With": "", "Project URL": "", "Description": "", "Organisation": "",
    "Role": "", "Admission Number": "", "DOJ": "", "Department": "", "Batch": "",
    "Father Name": "", "Father Mobile No": "", "Father Email Id": "", "Father Occupation": "",
    "Father Income": "", " Mother Name": "", "Mother Mobile No": "", "Mother Email Id": "",
    "Mother Occupation": "", "Mother Income": "", "Extra Curricular": "", "Title": "",
    "Description": "",
}]


export default class User extends Component {
    state = {
        data: [],
        type: "",
        columns: [],
        columnHeaders: { "keys": [], "def": {} },
        hideColumns: [],
        sort: [],
        isPageLoading: true,
        isLoading: false,
        modal: false,
        errors: [],
        success: [],
        selected: [],
        exportData: [],
        toggleColumns: false,
        labels: {},
        types: [
            {
                name: 'caste',
                _id: 'caste'
            },
            {
                name: 'category',
                _id: 'category'
            },
            {
                name: 'department',
                _id: 'department'
            },
            {
                name: 'language',
                _id: 'language'
            },
            {
                name: 'religion',
                _id: 'religion'
            },
            {
                name: 'boardtype',
                _id: 'boardtype'
            },
            {
                name: 'batch',
                _id: 'batch'
            },
            {
                name: 'state',
                _id: 'state'
            }
        ]
    }
    constructor(props) {
        super(props);
        this.bulkModalToggle = this.bulkModalToggle.bind(this);

    }
    async componentDidMount() {
        const labels = getDefaultClientLabels();
        const { type, prefixUrl } = this.props;
     
        await this.initTableData()
        await this.setState({ data: this.props.data, type, labels, isPageLoading: false }, () => {

        })
       
    }

    formatdownload() {
        var xls = new XlsExport(dataSample);
        xls.exportToXLS('Users.xls');
    }


    readFile = e => {
        var headerVal = Object.keys(dataSample[0])
        if (e.target.files[0].size <= 2000000) {
          
            e.stopPropagation(); e.preventDefault();
            const rABS = true;
            const files = e.target.files;
            const f = files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                var data = e.target.result;
                if (!rABS) data = new Uint8Array(data);
                const wb = XLSX.read(data, { type: rABS ? 'binary' : 'array' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const datas = XLSX.utils.sheet_to_json(ws, { range: 1, header: headerVal });
                this.setState({ ws: datas, file: f });
            };
            if (rABS) reader.readAsBinaryString(f); else reader.readAsArrayBuffer(f);
        } else {
            alert("File size can not exceed 2 MB");
        }
    }


    initTableData = async () => {
      
        const columnHeaders = getColumnHeaders(this.props.type, this.props.prefixUrl);

        const hideColumns = this.state.hideColumns;
        const columns = getColumns('client', columnHeaders, hideColumns);

        await this.setState({ columns, columnHeaders, hideColumns })
    }

    isColumnVisible = (key) => {
        return !_.includes(this.state.hideColumns, key)
    }

    toggleColumn = async (i) => {
        this.setState({ isLoading: true })
        await this.setState(prevState => {
            let hidden = prevState.columns[i] && prevState.columns[i]['hidden'] ? prevState.columns[i]['hidden'] : false
            var index = this.state.hideColumns.indexOf(prevState.columns[i]['dataField'])
            let hideColumns = this.state.hideColumns
            if (!hidden) {
                hideColumns.push(prevState.columns[i]['dataField'])
            } else {
                if (index !== -1) {
                    hideColumns.splice(index, 1)
                }
            }

            return {
                columns: update(this.state.columns, { [i]: { hidden: { $set: !hidden } } }),
                hideColumns
            }
        })
        this.setState({ isLoading: false })

    }

    handleOnSelect = (row, isSelect) => {
        if (isSelect) {
           
            this.setState(() => ({
                selected: [...this.state.selected, row.uid],
                exportData: [...this.state.exportData, row],
            }));
        } else {
            this.setState(() => ({
                selected: this.state.selected.filter(x => x !== row.uid),
                exportData: this.state.exportData.filter(x => x !== row),
            }));
        }
    }

    handleOnSelectAll = (isSelect, rows) => {
        const ids = rows.map(r => r.uid);

        if (isSelect) {
         
            this.setState(() => ({
                selected: ids,
                exportData: rows
            }));
        } else {
            this.setState(() => ({
                selected: [],
                exportData: []
            }));
        }
    }


    renderSelect(name, label, options) {
        const { data, errors } = this.state;
        return (
            <Select
                name={name}
                value={data[name]}
                label={label}
                options={options}
                onChange={this.handleChange}
                error={errors[name]}
                optionName="name"
                optionId="_id"
            />
        );
    }


    renderButton(name, type, className, funcal) {
        return (
            <button
                type={type}
                className={className}
                onClick={funcal}
            >{name}
            </button>
        );
    }

    toggleColumns = () => {
        this.setState({ toggleColumns: !this.state.toggleColumns });
    }


    bulkModalToggle() {

        this.setState({
            modal: !this.state.modal,
            modalsize: "lg",
        });
    }



    exceltable(format) {
        const { exportData } = this.state
        let data = []
     
        let datavalue = [
            { firstname: "Ahmed", lastname: "Tomi", email: "ah@smthing.co.com" },
            { firstname: "Raed", lastname: "Labes", email: "rl@smthing.co.com" },
            { firstname: "Yezzi", lastname: "Min l3b", email: "ymin@cocococo.com" }
        ];




        for (let item of exportData) {
         
            let Obj = { "User ID": item.uid, "Email Id": item.email, "Mobile No": item.mobile, "Title": "", "Name": "", "Gender": "", "DOB": "", "BloodGroup": "", "MotherTongue": "", "Caste": "", "Religion": "", "Aadhaar Number": "", "Nationality": "", "Address": "", "Secondary Email": "", "Secondary Mobile No": "", "Secondary Address": "", "tenth Percentage": "", "tenth Name": "", "tenth Affiliated": "", "tenth From": "", "tenth To": "", "tenth Other details": "", "twelth Percentage": "", "twelth Name": "", "twelth Affiliated": "", "twelth From": "", "twelth To": "", "twelth Other details": "", "ug Percentage": "", "ug Name": "", "ug Affiliated": "", "ug From": "", "ug To": "", "ug Other details": "", "Project Name": "", "Date": "", "Project Ongoing": "", "Associated With": "", "Project URL": "", "Description": "", "Organisation": "", "Role": "", "Admission Number": "", "DOJ": "", "Department": "", "Batch": "", "Father Name": "", "Father Mobile No": "", "Father Email Id": "", "Father Occupation": "", "Father Income": "", " Mother Name": "", "Mother Mobile No": "", "Mother Email Id": "", "Mother Occupation": "", "Mother Income": "", "Extra Curricular": ""}
            data.push(Obj);
        }
      
        if (format === 'csv') {

        }
        if (format === 'xls') {
         

        }
        // if(exportData.length > 0){
        //     var xls = new XlsExport(this.state.tableExportValues)
        //     xls.exportToXLS('UserList.xls')    
        // }       
    }


    render() {
        const { isPageLoading, isLoading, errors, type, labels, data, columnHeaders: { keys: colKeys, def: colDef }, columns } = this.state;

        const excludeToggleFields = ["sno", "actions"];
        const { parentData, prefixUrl } = this.props;

        const selectRow = {
            mode: 'checkbox',
            clickToSelect: true,
            //clickToExpand: true,
            selected: this.state.selected,
            onSelect: this.handleOnSelect,
            onSelectAll: this.handleOnSelectAll,
            bgColor: '#b7e4ff',
            selectionHeaderRenderer: ({ mode, checked, indeterminate, ...rest }) => {

                return (
                    <div className="custom-control custom-control-inline mr-0  custom-checkbox">
                        <input type={mode} className="custom-control-input" checked={checked} indeterminate={indeterminate ? indeterminate.toString() : "false"} {...rest} />
                        <label className="custom-control-label"></label>
                    </div>
                )
            },
            selectionRenderer: ({ mode, ...rest }) => (
                <div className="custom-control custom-control-inline mr-0 custom-checkbox">
                    <input type={mode} className="custom-control-input" {...rest} />
                    <label className="custom-control-label"></label>
                </div>
            )
        }




        const options = {
            paginationSize: 4,
            pageStartIndex: 1,
            sizePerPage: 2,
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
                    <Breadcrumb>
                        <BreadcrumbItem><NavLink to="/dashboard">Dashboard</NavLink></BreadcrumbItem>
                        {parentData && parentData.map(d => (
                            <BreadcrumbItem><NavLink to={`/${d.type}/${d.id}`}>{d.id}</NavLink></BreadcrumbItem>))
                        }
                        <BreadcrumbItem active>{labels[type][0]}</BreadcrumbItem>
                    </Breadcrumb>
                    <div className="d-md-flex align-items-md-center justify-content-md-between">
                        <h6>{labels[type][0]}</h6>

                        <div>

                            <button className="btn btn-outline-light btn-sm" onClick={this.toggleColumns}>Columns</button> &nbsp;
                            {/* <button className="btn btn-outline-secondary btn-sm">Export</button> &nbsp; */}
                            <UncontrolledButtonDropdown >
                                <DropdownToggle caret className="btn btn-outline-secondary btn-sm">Download</DropdownToggle>
                                <DropdownMenu>
                                    <DropdownItem header>Excel Format</DropdownItem>
                                    <DropdownItem>All {labels[type][0]}</DropdownItem>
                                    <DropdownItem onClick={() => { this.exceltable('xls') }} >Selected {labels[type][0]}</DropdownItem>
                                    <DropdownItem divider />
                                    <DropdownItem header>CSV Format</DropdownItem>
                                    <DropdownItem>All {labels[type][0]}</DropdownItem>
                                    <DropdownItem>
                                        <CSVLink data={this.state.data} headers={this.state.headers} filename={"User.csv"}>   Selected {labels[type][0]} </CSVLink>


                                    </DropdownItem>

                                </DropdownMenu>
                            </UncontrolledButtonDropdown> &nbsp;
                            <button className="btn btn-outline-secondary btn-sm" onClick={this.bulkModalToggle}>Bulk Upload</button> &nbsp;
                            <NavLink className="btn btn-primary btn-sm" to={`/${type}/new`}>+ Add {labels[type][1]}</NavLink>
                        </div>
                    </div>

                    <Collapse isOpen={this.state.toggleColumns}>
                        <div className="alert alert-info alert-sm">
                            <div className="d-flex align-items-center justify-content-between">
                                <h6>Show/Hide Columns </h6>
                                {/* <button className="btn btn-link btn-sm" onClick={this.initTableData}>Reset to default visible columns</button> */}
                            </div>
                            {colKeys.map((k, i) => {
                                if (excludeToggleFields.indexOf(k) > -1)
                                    return

                                return <div key={`toggle_${k}`} className="custom-control custom-control-inline col-6 col-md-2 custom-checkbox">
                                    <input type="checkbox" className="custom-control-input" checked={this.isColumnVisible(k)}
                                        onChange={(e) => this.toggleColumn(i)} id={`toggle_${k}`} />
                                    <label className="custom-control-label" htmlFor={`toggle_${k}`}>{colDef[k]['desc'] ? colDef[k]['desc'] : colDef[k]['text']}</label>
                                </div>
                            })}
                        </div>
                    </Collapse>
                    {!isLoading &&
                        <div>
                            <BootstrapTable
                                keyField="uid"
                                data={data}
                                columns={columns}
                                bootstrap4
                                classes="table table-bordered table-hover table-sm"
                                wrapperClasses="table-responsive"
                                filter={filterFactory()}
                                pagination={paginationFactory(options)}
                                selectRow={selectRow}
                                expandRow={previewClient}
                            />

                        </div>
                    }
                </React.Fragment>
                }
                <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className} size={this.state.modalsize}>
                    <ModalHeader toggle={this.toggle}>Import / Export</ModalHeader>
                    <ModalBody>
                        <Container>
                            <Form onSubmit={(e) => this.modalFormDatas(e)}>
                                <Row>
                                    <Col sm="12" >
                                        <h6>Choose Details</h6>
                                    </Col>
                                </Row>
                                <Row style={{ marginTop: '30px' }}>
                                    <Col sm="4">
                                        {this.renderSelect("client", "Client", this.state.types)}
                                    </Col>
                                    <Col sm="4">
                                        {this.renderSelect("entity", "Entity", this.state.types)}
                                    </Col>
                                    <Col sm="4">
                                        {this.renderSelect("branch", "Branch", this.state.types)}
                                    </Col>
                                </Row><br />
                                <Row style={{ marginTop: '30px' }}>
                                    <Col sm="4">
                                        {this.renderSelect("department", "Department", this.state.types)}
                                    </Col>
                                    <Col sm="4">
                                        {this.renderSelect("batch", "Batch", this.state.types)}
                                    </Col>

                                </Row><br />
                                <Row className="justify-content-center">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Microsoft_Excel_2013_logo.svg/2000px-Microsoft_Excel_2013_logo.svg.png" style={{ width: '150px', height: '150px' }} onClick={this.formatdownload} />
                                </Row>
                                <Row className="justify-content-center">
                                    <div>
                                        <p>Click the icon to download the format</p>
                                    </div>
                                </Row>
                                <Row>
                                    <input
                                        id="upload"
                                        ref="upload"
                                        type="file"
                                        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                                        onChange={(event) => { this.readFile(event) }}
                                    />
                                </Row>
                                <Row className="justify-content-end" >
                                    {this.renderButton("Cancel", "button", 'btn btn-warning cancel', this.bulkModalToggle)}
                                    {this.renderButton("Save", "submit", 'btn btn-primary', this.saveDetails)}
                                </Row>
                            </Form>
                        </Container>
                    </ModalBody>
                </Modal>

            </React.Fragment >
        );
    }
}

const previewClient = {
    renderer: row => (
        <div>
            <h6>{row.name}</h6>
            {row.address && <p>{row.address}</p>}
        </div>
    )
};

function getColumns(type, columnsHeaders, hideColumns) {
    let columns = []
    const { keys, def } = columnsHeaders;

    _.forEach(keys, (key) => {
        columns.push({ ...def[key], hidden: _.includes(hideColumns, key) })
    })
    return columns;
}

function getColumnHeaders(type, prefixUrl = "", dynamicLabels = {}) {

    let labels = dynamicLabels['user'] ? dynamicLabels : getDefaultClientLabels()
    // let allKeys = ["name", "noClient", "noEntity", "noBranch", "noDepartment", "noBatch", "noAdmin", "noStudent", "noStaff", "actions"]
    // "sno", 
    let allKeys = ["client", "entity", "branch", "department", "batch", "uid", "Name", "mobile", "email", "pictureUrl", "status", "password", "temporaryAddress", "permanantAddress", "actions"]


    let excludeKeys = [];
    switch (type) {
        case "admin":
            excludeKeys = ["noClient"]
            break;
        case "staff":
            excludeKeys = ["noClient", "noEntity"]
            break;
        case "student":
            excludeKeys = ["noClient", "noEntity", "noBranch"]
            break;

    }

    let keys = _.filter(allKeys, (v) => !_.includes(excludeKeys, v))
    let def = {
        "sno": { dataField: 'sno', isDummyField: true, text: "S.No", formatter: serialNumberFormatter, },
        "client": {
            dataField: 'clientName', text: `${labels["client"][1]}Name`, filter: getTextFilter(), sort: true, headerStyle: (colum, colIndex) => {
                return { width: '120 ', textAlign: 'center' };
            }
        },
        "entity": { dataField: 'entity', text: `${labels['entity'][1]}Name`, filter: getTextFilter(), sort: true },
        "branch": { dataField: 'branch', text: `${labels['branch'][1]}Name`, filter: getTextFilter(), sort: true },
        "department": { dataField: 'data[organization]', text: `${labels['department'][1]}Name`, filter: getTextFilter(), sort: true },
        "batch": { dataField: 'uid', text: `${labels['batch'][1]}Name`, filter: getTextFilter(), sort: true },
        "uid": { dataField: 'uid', text: `${labels['uid'][1]}`, filter: getTextFilter(), sort: true },
        "Name": { dataField: 'displayName', text: `${labels['Name'][1]}Name`, filter: getTextFilter(), sort: true },


        "mobile": { dataField: 'uid', text: `${labels['mobile'][1]}`, filter: getTextFilter(), sort: true },
        "email": { dataField: 'uid', text: `${labels['email'][1]}`, filter: getTextFilter(), sort: true },

        "pictureUrl": { dataField: 'uid', text: `${labels['pictureUrl'][1]}`, filter: getTextFilter(), sort: true, formatter: pictureurlFormatter },
        "status": { dataField: 'uid', text: `${labels['status'][1]}`, filter: getTextFilter(), sort: true },
        "password": { dataField: 'password', text: `${labels['password'][1]}`, filter: getTextFilter(), sort: true },
        "temporaryAddress": { dataField: 'uid', text: `${labels['temporaryAddress'][1]}`, filter: getTextFilter(), sort: true },
        "permanantAddress": { dataField: 'uid', text: `${labels['permanantAddress'][1]}`, filter: getTextFilter(), sort: true },


        "actions": { dataField: 'actions', isDummyField: true, text: "Actions", formatter: actionsFormatter }
    }
    return { "keys": keys, "def": def }
}

function getDefaultClientLabels() {
    return {
        "client": ["Clients", "Client"],
        "entity": ["Entities", "Entity"],
        "branch": ["Branches", "Branch"],
        "department": ["Departments", "Department"],
        "batch": ["Batches", "Batch"],
        "uid": ["UserId", "UserId"],
        "Name": ["User", "User"],
        "password": ["Password", "Password"],
        "mobile": ["Mobile", "Mobile"],
        "email": ["Email", "Email"],
        "pictureUrl": ["pictureUrl", "pictureUrl"],
        "status": ["status", "status"],
        "password": ["password", "password"],
        "temporaryAddress": ["temporaryAddress", "temporaryAddress"],
        "permanantAddress": ["permanantAddress", "permanantAddress"],


        "users": ["Users", "Users"]
    }
}

function serialNumberFormatter(cell, row, rowIndex, formatExtraData) {
    return rowIndex + 1
}

function pictureurlFormatter(cell, row, rowIndex, formatExtraData) {
    return (
        <div className="clientpicture">
            <img src={row.pictureUrl} />

        </div>
    )
}
function clientNameFormatter(cell, row, rowIndex, formatExtraData) {
    return (
        <div className="clientName">
            <div className="icon" style={{ backgroundImage: `url(${row.icon})` }}></div>
            {cell}
        </div>
    )
}

function clientLinkFormatter(cell, row, rowIndex, formatExtraData) {
    let links = []
    let { type, prefixUrl } = formatExtraData;
  
    prefixUrl = prefixUrl === "" ? row.id : prefixUrl;
    switch (type) {
        case "entity":
            links.push(<NavLink to={`/${prefixUrl}/entities`} className='badge badge-light'>{cell}</NavLink>)
            break;
        case "branch":
            links.push(<NavLink to={`/${prefixUrl}/branches`} className='badge badge-light'>{cell}</NavLink>)
            break;
        case "department":
            links.push(<NavLink to={`/${prefixUrl}/departments`} className='badge badge-light'>{cell}</NavLink>)
            break;
        case "batch":
            links.push(<NavLink to={`/${prefixUrl}/batches`} className='badge badge-light'>{cell}</NavLink>)
            break;
        default:
            links.push(cell)

    }
    return <div className="">{links.concat(" ")}</div>
}

function getTextFilter(type = "default") {
    return textFilter({
        placeholder: '',
        delay: 1000
    })
}

function actionsFormatter(cell, row, rowIndex, formatExtraData) {
    let links = []

    switch (row.type) {
        case "client":
            break
    }
    links.push(<NavLink to={`/${row.type}/${row.id}`} className='badge badge-success'>View</NavLink>)
    links.push(<NavLink to={`/${row.type}/${row.id}/edit`} className='badge badge-warning'>Edit</NavLink>)
    links.push(<NavLink to={`/${row.type}/${row.id}/delete`} className='badge badge-danger'>Delete</NavLink>)
    return <div className="actions">{links.concat(" ")}</div>
}

