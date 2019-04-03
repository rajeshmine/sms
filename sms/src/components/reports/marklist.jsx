import _ from 'lodash';
import React, { Component, Fragment } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import XlsExport from 'xlsexport';
import { textFilter } from 'react-bootstrap-table2-filter';
import { Row, Col, Container } from 'reactstrap'
import ToastService from 'services/toastService'
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default class MarkReportList extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      data: {
        client: "", entity: "", branch: "", department: "", batch: "", userType: ""
      },
      cdata: [],
      columns: [],
      columnHeaders: { "keys": [], "def": {} },
      hideColumns: [],
      sort: [],
      isPageLoading: true,
      isLoading: false,
      modal: false,
      success: [],
      selected: [],
      exportData: [],
      allKeys: [],
      toggleColumns: false,
      labels: {},
      clientIds: [], entityIds: [], branchIds: [], departmentIds: [], batchIds: [],
    }
  }


  async componentDidMount() {
    const labels = this.getDefaultClientLabels();
    const { type, form, data } = this.props;
    await this.initTableData();
    if (form === 'gpa')
      return await this.setState({
        data: data[form],
        type, labels,
        isPageLoading: false
      })
    return await this.setState({
      data: data["cce"]['Scholastic'],
      cdata: data["cce"]['co-scholastic'],
      type, labels,
      isPageLoading: false
    })
  }


  initTableData = async () => {
   
    const { hideColumns } = this.state;
    let { form } = this.props;
    let columnHeaders;
    if (form === 'cce')
      form = 'Scholastic';
    columnHeaders = this.getColumnHeaders(form, this.props.prefixUrl);
    const columns = this.getColumns('client', columnHeaders, hideColumns);
    const t = this.getColumnHeaders('co-scholastic', this.props.prefixUrl);
    const coColumns = this.getColumns('client', t, hideColumns);
    await this.setState({ columns, coColumns: coColumns || [], columnHeaders, hideColumns })
  }


  isColumnVisible = (key) => {
    return !_.includes(this.state.hideColumns, key)
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
 
  printDocument() {
    const input = document.getElementById('divToPrint');
    html2canvas(input)
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF();
        pdf.addImage(imgData, 'JPEG', 0, 0);
        // pdf.output('dataurlnewwindow');
        pdf.save("download.pdf");
      });
  }

  async exceltable(format) {
    let d;
    const { exportData } = this.state
    const { data } = this.props
    if (format === 'selecteduserxls') d = this.downloadxls(exportData)
    if (format === 'alluserxls') d = this.downloadxls(data)
    var xls = new XlsExport(d)
    xls.exportToXLS('UserList.xls')
  }


  downloadxls(data) {
    let dataarr = []
    if (data.length > 0) {
      for (let item of data) {
        let obj = {
          "User ID": item.uid, "Password": item.password, "Email Id": item.email, "Mobile No": item.mobile, "Title": item.title, "Name": item.firstName + item.middleName + item.lastName, "Gender": item.gender, "DOB": item.dob, "BloodGroup": item.bloodGroup, "MotherTongue": item.motherTongue, "Caste": item.caste, "Religion": item.religion, "Aadhaar Number": item.aadharNo, "Nationality": item.nationality, "Role": item.type
        }
        dataarr.push(obj)
      }
      return dataarr
    } else {
      return dataarr
    }
  }


  setFormApi = (formApi) => {
    this.formApi = formApi;
  }


  previewClient = {
    renderer: row => (
      <div>
        <h6>{row.name}</h6>
        {row.address && <p>{row.address}</p>}
      </div>
    )
  };

  getColumns(type, columnsHeaders, hideColumns) {
    let columns = []
    const { keys, def } = columnsHeaders;

    _.forEach(keys, (key) => {
      columns.push({ ...def[key], hidden: _.includes(hideColumns, key) })
    })
    return columns;
  }

  getColumnHeaders(type, prefixUrl = "", dynamicLabels = {}) {
    // "offlineTime", "onlineTime",
    let allKeys = ["skill"]
    let excludeKeys = []
  
    const { data } = this.props;

    switch (type) {
      case 'gpa':
        excludeKeys = ["skill"];
        allKeys.push(_.keys(data['gpa'][0]))
        break;
      case 'Scholastic':
        allKeys.push(_.keys(data['cce']['Scholastic'][0]))
        excludeKeys = ["skill"];
        break;
      case 'co-scholastic':
        excludeKeys = ["skill"];
        allKeys.push(_.keys(data['cce']['co-scholastic'][0]))
        break;
      default:
        excludeKeys = ["skill"];
        break;
    }

    allKeys = _.uniq(allKeys)
    allKeys = [].concat.apply([], allKeys)

    let keys = _.filter(allKeys, (v) => !_.includes(excludeKeys, v))
    let def = {
      "sno": { dataField: 'sno', isDummyField: true, text: "S.No", formatter: this.serialNumberFormatter },

      "skill": { dataField: 'skillName', text: `Skill`, sort: true },

    }
    _.map(allKeys, v => {
      def[v] = { dataField: v, text: v, sort: true }
    });

    return { "keys": keys, "def": def }
  }

  getDefaultClientLabels() {
    return {

    }
  }

  serialNumberFormatter(cell, row, rowIndex, formatExtraData) {
    return rowIndex + 1
  }
  onlinedateFormatter(cell, row, rowIndex, formatExtraData) {
    return row.from.date + '-' + row.to.date
  }
  onlinetimeFormatter(cell, row, rowIndex, formatExtraData) {
    return row.from.time + '-' + row.to.time
  }

  getTextFilter(type = "default") {
    return textFilter({
      placeholder: '',
      delay: 1000
    })
  }

  handleError(...err) {
    return ToastService.Toast("Something went wrong.Please try again later", "default");
  }

  markrangeFormater = (cell, row, rowIndex, formatExtraData) => {
    const { from, to } = cell
    return `${from} - ${to}`;
  }
  
  render() {

    const { isPageLoading, isLoading, data, columns, coColumns, cdata } = this.state; 
    var studentData = data[0] 
    const { form, formData, studentUid } = this.props; 

    return (
      <Fragment >
        {!isPageLoading && <Fragment>
          <div className="text-right">
            <button type="submit" onClick={this.printDocument} className="btn btn-primary btn-sm">Print</button>
          </div>

          {!isLoading &&
            <Container fluid>

              <Row>
                <Col sm={1}></Col>
                <Col sm={10}>
                  <div id="divToPrint">
                    <Row>
                      <Col sm={12} md={12} style={{ textAlign: 'center' }}>
                        <h6>Progress Mark Report</h6>
                        <p>Assesment Year : {formData.batch} </p>
                      </Col>
                    </Row>

                    <Row>
                      <Col sm={12} md={6}>
                        <p><strong>ID :</strong> {studentUid} </p>
                        <p><strong>Name :</strong> {studentData.name} </p>
                      </Col>
                      <Col sm={12} md={6} style={{ textAlign: 'end' }}>
                        <p><strong>Department : </strong>{formData.department} </p>
                        <p><strong>Batch :</strong> {formData.batch}  </p>
                      </Col>
                    </Row>

                    {form === 'gpa' &&
                      <h6> GPA Mark List</h6>
                    }
                    {form === 'cce' &&
                      <h6> Scholastic Mark List</h6>
                    }
                    <BootstrapTable
                      keyField="_id"
                      data={data}
                      columns={columns}
                      bootstrap4
                      classes="table table-bordered table-hover table-sm"
                      wrapperClasses="table-responsive"
                      noDataIndication={'No data to display here'}
                    />
                    <br /><br />
                    {form === 'cce' &&

                      <h6>Co-Scholastic Mark List</h6>
                    }
                    {form === 'cce' &&
                      <BootstrapTable
                        keyField="_id"
                        data={cdata}
                        columns={coColumns}
                        bootstrap4
                        classes="table table-bordered table-hover table-sm"
                        wrapperClasses="table-responsive"
                        noDataIndication={'No data to display here'}
                      />
                    }
                  </div>
                </Col>
                <Col sm={1}></Col>
              </Row>
            </Container>
          }
        </Fragment>
        }
      </Fragment >
    );
  }
}
