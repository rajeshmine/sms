import React, { Component } from 'react';
import { Container, Row, Col, FormGroup, Label, Input, Modal, ModalBody, ModalHeader, Form, Button } from 'reactstrap';
import * as FAIcons from 'react-icons/fa';
import { DateRange } from 'react-date-range';
import { format } from 'date-fns';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import SimpleReactValidator from 'simple-react-validator';

// import './style.scss'; 
import TabItem from 'components/common/tabItem';
import CustomCard from 'components/common/customCard';
import RestService from 'services/restService';
import Service from 'services/service';

const BASE_URL = 'http://localhost:5000/';
const data = new FormData();

export default class AddClient extends Component {

  constructor(props, context) {
    super(props, context)
    this.validator = new SimpleReactValidator();
    this.state = {
      isEditForm: false, // Check Edit or insert
      images: [],
      imageUrls: [],
      message: '',
      imgUrl: '',
      type: '',
      code: '',
      internalCode: '',
      password:'',
      uid :'',
      name: '',
      shortName: '',
      category: '',
      categoryName: '',
      categorCode: '',
      rules: '',
      affiliation: '',
      typeLists: [],
      categoryList: [],
      committeeName: '',
      committeeDescription: '',
      modal: false,
      addCommitteeMembers: [{
        displayName: '',
        title: '',
        pictureUrl: '',
        desc: ''
      }],
      primaryEmailid: '',
      primaryContactNumber: '',
      PrimaryAddressDoorno: '',
      PrimaryAddressLandmark: '',
      PrimaryAddressCountry: '',
      PrimaryAddressState: '',
      PrimaryAddressCity: '',
      PrimaryAddressPincode: '',
      primaryaddressFax: '',
      academicDateRange: {
        selection: {
          startDate: this.formatDateDisplay(new Date()),
          endDate: this.formatDateDisplay(new Date()),
          key: 'selection',
        },
      },
      sessionDateRanges: {
        selection: {
          startDate: this.formatDateDisplay(new Date()),
          endDate: this.formatDateDisplay(new Date()),
          key: 'selection',
        },
      },
      vacationDateRanges: {
        selection: {
          startDate: this.formatDateDisplay(new Date()),
          endDate: this.formatDateDisplay(new Date()),
          key: 'selection',
        },
      },
      admissionDateRanges: {
        selection: {
          startDate: this.formatDateDisplay(new Date()),
          endDate: this.formatDateDisplay(new Date()),
          key: 'selection',
        },
      },
      isDatePickerOpen: false,
      isSessionDatePicker: false,
      isVacationDatePicker: false,
      isAdminssionDatePicker: false,
    };
    this.toggle = this.toggle.bind(this);
    this.academicDatePicker = this.academicDatePicker.bind(this);
    this.sessionDatePicker = this.sessionDatePicker.bind(this);
    this.vacationDatePicker = this.vacationDatePicker.bind(this);
    this.admissionDatePicker = this.admissionDatePicker.bind(this);
    this.checkInsertorEdit = this.checkInsertorEdit.bind(this);
    this.editValueSet = this.editValueSet.bind(this);

  }

  componentWillMount() {
    this.getType();
    this.getCategory();
    this.checkInsertorEdit();
  }

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value
    }, () => {
      this.setState({
        categoryName: this.state.category.split('~')[0],
        categorCode: this.state.category.split('~')[1],
      })
    });
  }

  handleRangeChange(which, payload) {
    this.setState({
      [which]: {
        ...this.state[which],
        ...payload,
      },
    });
  }

  academicDatePicker() {
    this.setState({
      isDatePickerOpen: !this.state.isDatePickerOpen,
      isSessionDatePicker: false,
      isVacationDatePicker: false,
      isAdminssionDatePicker: false,
    });
  }

  sessionDatePicker() {
    this.setState({
      isSessionDatePicker: !this.state.isSessionDatePicker,
      isDatePickerOpen: false,
      isVacationDatePicker: false,
      isAdminssionDatePicker: false,
    });
  }

  vacationDatePicker() {
    this.setState({
      isVacationDatePicker: !this.state.isVacationDatePicker,
      isDatePickerOpen: false,
      isSessionDatePicker: false,
      isAdminssionDatePicker: false,
    });
  }

  admissionDatePicker() {
    this.setState({
      isAdminssionDatePicker: !this.state.isAdminssionDatePicker,
      isDatePickerOpen: false,
      isSessionDatePicker: false,
      isVacationDatePicker: false,
    });
  }

  formatDateDisplay(date, defaultText) {
    if (!date) return defaultText;
    return format(date, 'YYYY-MM-DD');
  }

  getType() {
    var Data = [
      "entity",
      "school",
      "college",
      "university"
    ]
    var Types = Data.map((result, i) => {
      return (
        <option key={i} value={result}>{result}</option>
      )
    })
    this.setState({ typeLists: Types })
  }

  getCategory() {
    RestService.getCategory((result) => {
      if (result.data) {
        var Types = result.data.map((result, i) => {
          return (
            <option key={i} value={result.displayName + '~' + result.code}>{result.displayName}</option>
          )
        })
        this.setState({ categoryList: Types })
      }
    })
  }

  addClient() {
    let obj = {
      "type": this.state.type,
      "code": this.state.code,
      "uid ": this.state.uid,
      "password": this.state.password,
      "internalCode": this.state.internalCode,
      "shortName": this.state.shortName,
      "displayName": this.state.name,
      "rules": this.state.rules,
      "year": {
        "academicYear": {
          "from": this.formatDateDisplay(this.state.academicDateRange.selection.startDate),
          "to": this.formatDateDisplay(this.state.academicDateRange.selection.endDate)
        },
        "sessionPeriod": {
          "from": this.formatDateDisplay(this.state.sessionDateRanges.selection.startDate),
          "to": this.formatDateDisplay(this.state.sessionDateRanges.selection.endDate)
        },
        "vacationPeriod": {
          "from": this.formatDateDisplay(this.state.vacationDateRanges.selection.startDate),
          "to": this.formatDateDisplay(this.state.vacationDateRanges.selection.endDate)
        },
        "admissionPeriod": {
          "from": this.formatDateDisplay(this.state.admissionDateRanges.selection.startDate),
          "to": this.formatDateDisplay(this.state.admissionDateRanges.selection.endDate)
        }
      },
      "organization": [
        {
          "logo": {
            "type": "",
            "url": this.state.imgUrl,
            "width": "400",
            "height": "500",
            "title": "logo"
          },
          "category": [
            {
              "code": this.state.categorCode,
              "name": this.state.categoryName
            }
          ],
          "commitee": [
            {
              "Name": this.state.committeeName,
              "desc": this.state.committeeDescription,
              "members": this.state.addCommitteeMembers,
            }
          ],
          "affiliation": {
            "university": this.state.affiliation
          }
        }
      ],
      "address": [
        {
          "id": "002",
          "address1": this.state.PrimaryAddressDoorno,
          "address2": "",
          "landmark": this.state.PrimaryAddressLandmark,
          "city": this.state.PrimaryAddressCity,
          "pincode": this.state.PrimaryAddressPincode,
          "state": this.state.PrimaryAddressState,
          "country": this.state.PrimaryAddressCountry,
          "fax": this.state.primaryaddressFax,
          "displayFullAddress": this.state.PrimaryAddressDoorno + this.state.PrimaryAddressLandmark +
            this.state.PrimaryAddressCity + this.state.PrimaryAddressState + this.state.PrimaryAddressCountry + this.state.primaryaddressFax +
            this.state.PrimaryAddressPincode

        }
      ],
      "contactNo": {
        "primary": this.state.primaryContactNumber,
        "secondary": ""
      },
      "email": {
        "primary": this.state.primaryEmailid,
        "secondary": ""
      },
    }
   
    RestService.addClient(obj, (result) => { 
      if (result.statusCode === 1) {
        Service.showAlert('Your Details Stored Successfully', '', 'Success');
      }
    })
  }

  selectImages = (event) => {
    let images = []
    for (var i = 0; i < event.target.files.length; i++) {
      images[i] = event.target.files.item(i);
    }
    images = images.filter(image => image.name.match(/\.(jpg|jpeg|png|gif)$/))
    let message = `${images.length} valid image(s) selected`
    this.setState({ images, message })
    data.append("image", images[0]);
    return this.uploadImages((res) => {
      return this.setState({ imgUrl: BASE_URL + res.imageUrl }, function () { 
      });
    });
  }

  uploadImages = (callback) => {
    let url = BASE_URL + 'upload';
    fetch(url, {
      method: 'POST',
      body: data
    }).then(res => res.json()).then(res => {
      callback(res);
    })
  }

  handleCommiteeMembersNameChange = (idx) => (evt) => {
    const newCommitteMembers = this.state.addCommitteeMembers.map((addCommitteeMembers, sidx) => {
      if (idx !== sidx) return addCommitteeMembers;
      return { ...addCommitteeMembers, [evt.target.name]: evt.target.value };
    });
    this.setState({ addCommitteeMembers: newCommitteMembers }, () => {
    });
  }

  handleAddCommitteeMembers = () => {
    this.setState({ addCommitteeMembers: this.state.addCommitteeMembers.concat([{ displayName: '', title: '', pictureUrl: '', desc: '' }]) });
  }

  toggle() {
    this.setState({
      modal: !this.state.modal,
      modalsize: "lg",
    });
  }

  modalFormDatas(e) {
    e.preventDefault()
    this.setState({
      modal: !this.state.modal,
      modalsize: "lg",
    });
  }

  checkInsertorEdit() {
    if (this.props.location.state === undefined) return;
    if (this.props.location.state.isEditForm) return this.editValueSet(this.props.location.state.clientData);
    this.setState({ isEditForm: false });
  }

  editValueSet(data) {
    this.setState({
      id: data._id,
      imgUrl: data.organization[0].logo.url,
      type: data.type,
      code: data.code,
      internalCode: data.internalCode,
      name: data.displayName,
      shortName: data.shortName,
      category: data.organization[0].category[0].name + '~' + data.organization[0].category[0].code,
      rules: data.rules,
      affiliation: data.organization[0].affiliation.university,
      committeeName: data.organization[0].commitee[0].Name,
      committeeDescription: data.organization[0].commitee[0].desc,
      addCommitteeMembers: data.organization[0].commitee[0].members,
      primaryEmailid: data.email.primary,
      primaryContactNumber: data.contactNo.primary,
      PrimaryAddressDoorno: data.address[0].address1,
      PrimaryAddressLandmark: data.address[0].landmark,
      PrimaryAddressCountry: data.address[0].country,
      PrimaryAddressState: data.address[0].state,
      PrimaryAddressCity: data.address[0].city,
      PrimaryAddressPincode: data.address[0].pincode,
      primaryaddressFax: data.address[0].fax,
      isEditForm: true,
      academicDateRange: {
        selection: {
          startDate: new Date(data.year.academicYear.from),
          endDate: new Date(data.year.academicYear.to),
          key: 'selection',
        },
      },
      sessionDateRanges: {
        selection: {
          startDate: new Date(data.year.sessionPeriod.from),
          endDate: new Date(data.year.sessionPeriod.to),
          key: 'selection',
        },
      },
      vacationDateRanges: {
        selection: {
          startDate: new Date(data.year.vacationPeriod.from),
          endDate: new Date(data.year.vacationPeriod.to),
          key: 'selection',
        },
      },
      admissionDateRanges: {
        selection: {
          startDate: new Date(data.year.admissionPeriod.from),
          endDate: new Date(data.year.admissionPeriod.to),
          key: 'selection',
        },
      },
    });
  }

  updateClient() {
    let obj = {
      "address": [
        {
          "id": "002",
          "address1": this.state.PrimaryAddressDoorno,
          "address2": "",
          "landmark": this.state.PrimaryAddressLandmark,
          "city": this.state.PrimaryAddressCity,
          "pincode": this.state.PrimaryAddressPincode,
          "state": this.state.PrimaryAddressState,
          "country": this.state.PrimaryAddressCountry,
          "fax": this.state.primaryaddressFax,
          "displayFullAddress": this.state.PrimaryAddressDoorno + this.state.PrimaryAddressLandmark +
            this.state.PrimaryAddressCity + this.state.PrimaryAddressState + this.state.PrimaryAddressCountry + this.state.primaryaddressFax +
            this.state.PrimaryAddressPincode
        }
      ],
      "code": this.state.code,
      "contactNo": {
        "primary": this.state.primaryContactNumber,
        "secondary": ""
      },
      "displayName": this.state.name,
      "email": {
        "primary": this.state.primaryEmailid,
        "secondary": " "
      },
      "internalCode": this.state.internalCode,
      "organization": [
        {
          "affiliation": {
            "university": this.state.affiliation
          },
          "category": [
            {
              "code": this.state.categorCode,
              "name": this.state.categoryName
            }
          ],
          "commitee": [
            {
              "Name": this.state.committeeName,
              "desc": this.state.committeeDescription,
              "members": this.state.addCommitteeMembers,
            }
          ],
          "logo": {
            "height": "500",
            "title": "",
            "type": "",
            "url": this.state.imgUrl,
            "width": "400"
          }
        }
      ],
      "rules": this.state.rules,
      "shortName": this.state.shortName,
      "type": this.state.type,
      "year": {
        "academicYear": {
          "from": this.formatDateDisplay(this.state.academicDateRange.selection.startDate),
          "to": this.formatDateDisplay(this.state.academicDateRange.selection.endDate)
        },
        "sessionPeriod": {
          "from": this.formatDateDisplay(this.state.sessionDateRanges.selection.startDate),
          "to": this.formatDateDisplay(this.state.sessionDateRanges.selection.endDate)
        },
        "vacationPeriod": {
          "from": this.formatDateDisplay(this.state.vacationDateRanges.selection.startDate),
          "to": this.formatDateDisplay(this.state.vacationDateRanges.selection.endDate)
        },
        "admissionPeriod": {
          "from": this.formatDateDisplay(this.state.admissionDateRanges.selection.startDate),
          "to": this.formatDateDisplay(this.state.admissionDateRanges.selection.endDate)
        }
      }
    }
    
    RestService.updateClient(obj, (result) => {
      if (result.statusCode === 1) {
        Service.showAlert('Your Details Updated Successfully', '', 'Success');
        this.setState({ isEditForm: false })
      }
    })
  }

  saveDetails(e) {
    e.preventDefault();
    if (this.validator.allValid()) {
      if (!this.state.isEditForm) return this.addClient();
      if (this.state.isEditForm) return this.updateClient();
      this.setState({ isEditForm: false });
    } else {
      this.validator.showMessages();
      this.forceUpdate();
    }
  }
  render() {
    return (
      <Container fluid>
        <br />
        <Row>
          <h6>Add Institution</h6>
        </Row>
        <Row>
          <Col sm="3">
            <TabItem icon={<FAIcons.FaUserPlus />} text={"Add Institution"} active />
          </Col>
          <Col sm="3">
            <TabItem icon={<FAIcons.FaFileAlt />} text={"View Institution"} to="/main/view-client"/>
          </Col>
        </Row>
        <CustomCard>
          <Row>
            <h6>Institution Details</h6>
          </Row>
          <Form onSubmit={(e) => this.saveDetails(e)} >
            <Row>
              <Col sm="4">
                <FormGroup>
                  <Label for="Type">Type</Label>
                  <Input type="select"
                    name="type"
                    value={this.state.type}
                    id="exampleSelect"
                    onChange={e => this.handleChange(e)}
                  >
                    <option defaultValue>-- Select -- </option>
                    {this.state.typeLists}
                  </Input>
                  <span className="text-danger">
                    {this.validator.message(' Type', this.state.type, 'required')}
                  </span>
                </FormGroup>
              </Col>
              <Col sm="4">
                <FormGroup>
                  <Label for="uid">Username</Label>
                  <Input
                    type="text"
                    name="uid"
                    value={this.state.uid}
                    placeholder="Username"
                    onChange={e => this.handleChange(e)}
                  />
                  <span className="text-danger">
                    {this.validator.message('Username', this.state.code, 'required')}
                  </span>
                </FormGroup>
              </Col>
              <Col sm="4">
                <FormGroup>
                  <Label for="password">Password</Label>
                  <Input type="password"
                    name="password"
                    placeholder="Password"
                    value={this.state.password}
                    onChange={e => this.handleChange(e)}
                  />
                  <span className="text-danger">
                    {this.validator.message('Password', this.state.internalCode, 'required')}
                  </span>
                </FormGroup>
              </Col>
            </Row>
            <Row>

              <Col sm="4">
                <FormGroup>
                  <Label for="Code">Code</Label>
                  <Input
                    type="text"
                    name="code"
                    value={this.state.code}
                    placeholder="Code"
                    onChange={e => this.handleChange(e)}
                  />
                  <span className="text-danger">
                    {this.validator.message('code', this.state.code, 'required')}
                  </span>
                </FormGroup>
              </Col>
              <Col sm="4">
                <FormGroup>
                  <Label for="International Code">Internal Code</Label>
                  <Input type="text"
                    name="internalCode"
                    placeholder="Internal Code"
                    value={this.state.internalCode}
                    onChange={e => this.handleChange(e)}
                  />
                  <span className="text-danger">
                    {this.validator.message('internalCode', this.state.internalCode, 'required')}
                  </span>
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col sm="4">
                <FormGroup>
                  <Label for="Name">Name</Label>
                  <Input type="text"
                    name="name"
                    value={this.state.name}
                    placeholder="Enter Name"
                    onChange={e => this.handleChange(e)}
                  />
                  <span className="text-danger">
                    {this.validator.message('name', this.state.name, 'required')}
                  </span>
                </FormGroup>
              </Col>
              <Col sm="4">
                <FormGroup>
                  <Label for="ShortName">ShortName</Label>
                  <Input type="text"
                    name="shortName"
                    value={this.state.shortName}
                    placeholder="Short Name"
                    onChange={e => this.handleChange(e)}
                  />
                  <span className="text-danger">
                    {this.validator.message('shortName', this.state.shortName, 'required')}
                  </span>
                </FormGroup>
              </Col>
              <Col sm="4">
                <FormGroup>
                  <Label for="logo">Logo</Label>
                  <Input type="file"
                    placeholder="Logo" accept="image/*" onChange={this.selectImages}
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col sm="4">
                <FormGroup>
                  <Label>Academic Year</Label>
                  <Input type="text" value={this.formatDateDisplay(this.state.academicDateRange.selection.startDate) + ' to ' + this.formatDateDisplay(this.state.academicDateRange.selection.endDate)} onClick={this.academicDatePicker} />
                </FormGroup>
                {
                  this.state.isDatePickerOpen ? <DateRange
                    onChange={this.handleRangeChange.bind(this, 'academicDateRange')}
                    moveRangeOnFirstSelection={false}
                    ranges={[this.state.academicDateRange.selection]}
                    className={'PreviewArea bg-white'}
                  /> : ''
                }
              </Col>
              <Col sm="4">
                <FormGroup>
                  <Label>Session Period</Label>
                  <Input type="text"
                    value={this.formatDateDisplay(this.state.sessionDateRanges.selection.startDate) + ' to ' + this.formatDateDisplay(this.state.sessionDateRanges.selection.endDate)} onClick={this.sessionDatePicker}
                    placeholder="Session Period"
                  />
                </FormGroup>
                {
                  this.state.isSessionDatePicker ? <DateRange
                    onChange={this.handleRangeChange.bind(this, 'sessionDateRanges')}
                    moveRangeOnFirstSelection={false}
                    ranges={[this.state.sessionDateRanges.selection]}
                    className={'PreviewArea bg-white'}
                  /> : ''
                }
              </Col>
              <Col sm="4">
                <FormGroup>
                  <Label>Vacation Period</Label>
                  <Input type="text"
                    value={this.formatDateDisplay(this.state.vacationDateRanges.selection.startDate) + ' to ' + this.formatDateDisplay(this.state.vacationDateRanges.selection.endDate)} onClick={this.vacationDatePicker}
                    placeholder="Vacation Period"
                  />
                </FormGroup>
                {
                  this.state.isVacationDatePicker ? <DateRange
                    onChange={this.handleRangeChange.bind(this, 'vacationDateRanges')}
                    moveRangeOnFirstSelection={false}
                    ranges={[this.state.vacationDateRanges.selection]}
                    className={'PreviewArea bg-white'}
                  /> : ''
                }
              </Col>
            </Row>
            <Row>
              <Col sm="4">
                <FormGroup>
                  <Label>Admission Period</Label>
                  <Input type="text"
                    value={this.formatDateDisplay(this.state.admissionDateRanges.selection.startDate) + ' to ' + this.formatDateDisplay(this.state.admissionDateRanges.selection.endDate)} onClick={this.admissionDatePicker}
                    placeholder="Admission Period"
                  />
                </FormGroup>
                {
                  this.state.isAdminssionDatePicker ? <DateRange
                    onChange={this.handleRangeChange.bind(this, 'admissionDateRanges')}
                    moveRangeOnFirstSelection={false}
                    ranges={[this.state.admissionDateRanges.selection]}
                    className={'PreviewArea bg-white'}
                  /> : ''
                }
              </Col>
              <Col sm="4">
                <FormGroup>
                  <Label for="Organization Name">Category</Label>
                  <Input type="select"
                    name="category"
                    value={this.state.category}
                    id="exampleSelect"
                    onChange={e => this.handleChange(e)}
                  >
                    <option defaultValue>-- Select -- </option>
                    {this.state.categoryList}
                  </Input>
                  <span className="text-danger">
                    {this.validator.message('category', this.state.category, 'required')}
                  </span>
                </FormGroup>
              </Col>
              <Col sm="4">
                <FormGroup>
                  <Label for="Code">Affiliation</Label>
                  <Input type="text"
                    name="affiliation"
                    placeholder="Affiliation"
                    value={this.state.affiliation}
                    onChange={e => this.handleChange(e)}
                  />
                  <span className="text-danger">
                    {this.validator.message('affiliation', this.state.affiliation, 'required')}
                  </span>
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col>
                <FormGroup>
                  <Label for="Code">Rules & Regulations</Label>
                  <Input type="textarea"
                    name="rules"
                    value={this.state.rules}
                    placeholder="Rules & Regulations"
                    onChange={e => this.handleChange(e)}
                  />
                  <span className="text-danger">
                    {this.validator.message('rules', this.state.rules, 'required')}
                  </span>
                </FormGroup>

              </Col>
            </Row>
            <Row>
              <Col sm="12">
                <Label>Click Here to add committee Details :  </Label> <Button color="primary" onClick={this.toggle}>Add Committee</Button>
              </Col>
            </Row>
            <Row>
              <h5>Comunication Details</h5>
            </Row>
            <Row>
              <Col sm="4">
                <FormGroup>
                  <Label for="Email ID">Email ID</Label>
                  <Input type="email"
                    value={this.state.primaryEmailid}
                    name="primaryEmailid"
                    placeholder="Email ID"
                    onChange={e => this.handleChange(e)}
                  />
                  <span className="text-danger">
                    {this.validator.message(' Emailid', this.state.primaryEmailid, 'required')}
                  </span>
                </FormGroup>
              </Col>
              <Col sm="4">
                <FormGroup>
                  <Label for="Mobile">Mobile No</Label>
                  <Input type="number"
                    name="primaryContactNumber"
                    value={this.state.primaryContactNumber}
                    maxLength={10}
                    placeholder="Mobile No"
                    onChange={e => this.handleChange(e)}
                  />
                  <span className="text-danger">
                    {this.validator.message('ContactNumber', this.state.primaryContactNumber, 'required')}
                  </span>
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <h5>Primary Address</h5>
            </Row>
            <Row>
              <Col sm="2">
                <FormGroup>
                  <Input type="text"
                    name="PrimaryAddressDoorno"
                    value={this.state.PrimaryAddressDoorno}
                    placeholder="Door No"
                    onChange={e => this.handleChange(e)}
                  />
                  <span className="text-danger">
                    {this.validator.message(' Doorno', this.state.PrimaryAddressDoorno, 'required')}
                  </span>
                </FormGroup>
              </Col>
              <Col sm="4">
                <Input type="text"
                  name="PrimaryAddressLandmark"
                  value={this.state.PrimaryAddressLandmark}
                  placeholder="Landmark"
                  onChange={e => this.handleChange(e)}
                />
                <span className="text-danger">
                  {this.validator.message(' Landmark', this.state.PrimaryAddressLandmark, 'required')}
                </span>
              </Col>
            </Row>
            <Row>
              <Col sm="2">
                <FormGroup>
                  <Input type="text"
                    value={this.state.PrimaryAddressCountry}
                    name="PrimaryAddressCountry"
                    placeholder="Country"
                    onChange={e => this.handleChange(e)}
                  />
                  <span className="text-danger">
                    {this.validator.message(' Country', this.state.PrimaryAddressCountry, 'required')}
                  </span>
                </FormGroup>
              </Col>
              <Col sm="2">
                <Input type="text"
                  name="PrimaryAddressState"
                  value={this.state.PrimaryAddressState}
                  placeholder="State"
                  onChange={e => this.handleChange(e)}
                />
                <span className="text-danger">
                  {this.validator.message(' State', this.state.PrimaryAddressState, 'required')}
                </span>
              </Col>
              <Col sm="2">
                <Input type="text"
                  name="PrimaryAddressCity"
                  value={this.state.PrimaryAddressCity}
                  placeholder="City"
                  onChange={e => this.handleChange(e)}
                />
                <span className="text-danger">
                  {this.validator.message(' City', this.state.PrimaryAddressCity, 'required')}
                </span>
              </Col>
            </Row>
            <Row>
              <Col sm="4">
                <FormGroup>
                  <Input type="number"
                    name="PrimaryAddressPincode"
                    value={this.state.PrimaryAddressPincode}
                    placeholder="Pincode"
                    onChange={e => this.handleChange(e)}
                  />
                  <span className="text-danger">
                    {this.validator.message(' Pincode', this.state.PrimaryAddressPincode, 'required')}
                  </span>
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col sm="4">
                <FormGroup>
                  <Input type="text"
                    placeholder="Fax"
                    name="primaryaddressFax"
                    value={this.state.primaryaddressFax}
                    onChange={e => this.handleChange(e)}
                  />
                  <span className="text-danger">
                    {this.validator.message(' Fax', this.state.primaryaddressFax, 'required')}
                  </span>
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col sm="12" className="d-flex justify-content-end" >
                <Button color="primary" type="submit">Save</Button>
              </Col>
            </Row>
          </Form>
        </CustomCard>
        <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className} size={this.state.modalsize}>
          <ModalHeader toggle={this.toggle}>Add Commitee</ModalHeader>
          <ModalBody>
            <Container>
              <Form onSubmit={(e) => this.modalFormDatas(e)}>
                <Row>
                  <Col sm="12" >
                    <h6>Committee Details</h6>
                  </Col>
                </Row>
                <Row style={{ marginTop: '30px' }}>
                  <Col sm="5">
                    <FormGroup>
                      <Label>Name</Label>
                      <Input type="text"
                        name="committeeName"
                        value={this.state.committeeName}
                        placeholder="Enter Name"
                        onChange={e => this.handleChange(e)}
                        required
                      />

                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col sm="12">
                    <FormGroup>
                      <Label>Description</Label>
                      <Input type="textarea"
                        name="committeeDescription"
                        value={this.state.committeeDescription}
                        placeholder="Description"
                        onChange={e => this.handleChange(e)}
                        rows="3"
                        required
                      />

                    </FormGroup>
                  </Col>
                </Row>
                <hr />
                <Row>
                  <Col sm="12">
                    <h6>Add Committee Members</h6>
                  </Col>
                  <Col sm="12" className="d-flex justify-content-end" >
                    <Button color="primary" style={{ marginTop: '30px' }}
                      onClick={this.handleAddCommitteeMembers} >
                      {<FAIcons.FaPlus />} Add Member</Button>
                  </Col>
                </Row>
                {
                  this.state.addCommitteeMembers.map((addCommitteeMembers, idx) => (
                    <div className="addCommitteeMembers" key={idx}>
                      <Row>
                        <Col sm="5">
                          <FormGroup>
                            <Label>Name</Label>
                            <Input type="text"
                              placeholder="Enter Name"
                              name="displayName"
                              value={addCommitteeMembers.displayName}
                              onChange={this.handleCommiteeMembersNameChange(idx)}
                              required
                            />

                          </FormGroup>
                        </Col>
                      </Row>
                      <Row>
                        <Col sm="6">
                          <FormGroup>
                            <Label>Title</Label>
                            <Input type="text"
                              placeholder="Enter Title"
                              name="title"
                              value={addCommitteeMembers.title}
                              onChange={this.handleCommiteeMembersNameChange(idx)}
                              required
                            />

                          </FormGroup>
                        </Col>
                        <Col sm="6">
                          <FormGroup>
                            <Label>Image</Label>
                            <Input type="file"
                              name="pictureUrl"
                              value={addCommitteeMembers.pictureUrl} accept="image/*"
                              onChange={this.handleCommiteeMembersNameChange(idx)}
                            />
                          </FormGroup>
                        </Col>
                      </Row>
                      <Row>
                        <Col sm="12">
                          <FormGroup>
                            <Label>Description</Label>
                            <Input type="textarea"
                              placeholder="Enter Descriptions"
                              name="desc"
                              value={addCommitteeMembers.desc}
                              onChange={this.handleCommiteeMembersNameChange(idx)}
                              rows="3"
                              required
                            />
                          </FormGroup>
                        </Col>
                      </Row>
                    </div>
                  ))
                }
                <Row className="justify-content-end">
                  <Button color="warning" type="button" onClick={this.toggle} style={{ marginRight: '10px' }}>Cancel</Button>
                  <Button color="primary" type="submit">Save</Button>
                </Row>
              </Form>
            </Container>
          </ModalBody>
        </Modal>
      </Container >
    );
  }
}

















