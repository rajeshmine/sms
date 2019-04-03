import React, { Component } from 'react';
import { Col, Row, Container, Button } from 'reactstrap';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import * as FAIcons from 'react-icons/fa';
// import logo from './../../../images/logo.jpg';

import TabItem from 'components/common/tabItem';
import CustomCard from 'components/common/customCard';
import deleteIcon from './../../images/delete.svg';
import editIcon from './../../images/editer.png';
import RestService from 'services/restService';
import Service from 'services/service';
import ToastService from 'services/toastService'

// import './style.scss';

export default class ViewClient extends Component {

  constructor(props) {
    super(props)
    this.state = {
      filtertype: {},
    }
    this.buttonFormatter = this.buttonFormatter.bind(this);
    this.editFormatter = this.editFormatter.bind(this);
    this.viewFormatter = this.viewFormatter.bind(this);
    this.sendData = this.sendData.bind(this);
  }

  componentWillMount() {
    this.viewClient();
  }

  viewClient() {
    RestService.viewClient((result) => { 
      if (result.statusCode === 1 && result.data instanceof Array) {
        this.setState({ viewClient: result.data })
      }
      else {
        this.setState({ viewClient: [] })
      }
    })
  }

  deleteClient(type, code) {
    Service.showConfirm('Are you sure? You want to delete this data!!!', '', 'Deleted', (result) => {
      if (result) {
        let obj = {
          "type": type,
          "code": code
        }
        RestService.deleteClient(obj, (result) => {
          if (result.statusCode !== 1) return Service.showAlert(result.message, '', 'Failed');
          ToastService.Toast("Deleted Successfully.",'default');
          this.viewClient();
        })
      }
    });
  }

  editClientsDetails(row) {
    let self = this;
    self.props.history.push({
      pathname: '/main/add-client',
      state: {
        clientData: row,
        isEditForm: true
      }
    });

  }

  sendData(row) {
    let self = this;
    self.props.history.push({
      pathname: '/main/view-client-details',
      state: {
        ViewclientData: row
      }
    });
  }

  buttonFormatter(cell, row) {
    return <img src={deleteIcon} onClick={() => this.deleteClient(row.type, row.code)}
      className="img-responsive deletebtn" alt="delete" />;
  }

  editFormatter(cell, row) {
    return <img src={editIcon} onClick={() => this.editClientsDetails(row)} className="img-responsive editbtn" alt="edit" />;
  }

  viewFormatter(cell, row) {
    return <Button onClick={() => this.sendData(row)} color="primary">View</Button>
  }

  format(cell, row) {
    return cell[0].category[0].name;
  }

  format1(cell, row) {
    return cell[0].affiliation.university;
  }

  format2(cell, row) {
    return cell[0].commitee[0].Name;
  }

  render() {
    this.options = {
      sizePerPage: 5,
      sizePerPageList: [5, 10, 25, 50, 100],
      pageStartIndex: 1,
      paginationSize: 1,
      prePage: 'Prev',
      nextPage: 'Next',
      paginationPosition: 'bottom',
    };


    return (
      <Container fluid>
        <br />
        <Row>
          <h6>View Institution</h6>
        </Row>
        <Row>
          <Col sm="3">
            <TabItem icon={<FAIcons.FaUserPlus />} text={"Add Institution"} to="/main/add-client" />
          </Col>
          <Col sm="3">
            <TabItem icon={<FAIcons.FaFileAlt />} text={"View Institution"} active />
          </Col>
        </Row>
        <CustomCard>
          <Row>
            <BootstrapTable data={this.state.viewClient} striped hover bordered condensed options={this.options} pagination version='4' search={true} exportCSV={false} scrollTop={'Bottom'} >
              <TableHeaderColumn isKey dataField='type' rowSpan='2'
              >Type</TableHeaderColumn>
              <TableHeaderColumn rowSpan='2' dataField='organization' dataFormat={this.format} dataSort >Category</TableHeaderColumn>
              <TableHeaderColumn rowSpan='2' dataField='organization' dataFormat={this.format1} dataSort >Affilication</TableHeaderColumn>
              <TableHeaderColumn rowSpan='2' dataField='organization' dataFormat={this.format2} dataSort >Committe Name</TableHeaderColumn>
              <TableHeaderColumn row='0' colSpan='2' dataField='price' dataAlign="center" >Actions</TableHeaderColumn>
              <TableHeaderColumn row="1" colSpan='1' dataAlign="center" columnTitle="Edit" dataFormat={this.editFormatter} >Edit</TableHeaderColumn>
              <TableHeaderColumn row="1" colSpan='1' dataAlign="center" columnTitle="Delete" dataFormat={this.buttonFormatter} >Delete</TableHeaderColumn>
              <TableHeaderColumn row="1" colSpan='1' dataAlign="center" columnTitle="View" dataFormat={this.viewFormatter} >View</TableHeaderColumn>
            </BootstrapTable>
          </Row>
        </CustomCard>
      </Container >
    );
  }
}

