import 'styles/App.scss';
import React, { Component, Fragment } from 'react';
import Joi from 'joi-browser';
import { Col, Row, Container } from 'reactstrap';
import ToastService from 'services/toastService'
 


import { Form, Scope } from 'informed';
import { Input,  CustomSelect,  RTimePicker } from 'components/common/forms';
import { getScheduleDetails, insertclassTimetable, getstaffList, getsubjectList, updateclassTimetable } from 'services/timetableService';
import { getselectData } from 'services/userService';
import moment from 'moment';
export default class ClassForm extends Component {
  state = {
    data: {
      client: "", entity: "", branch: "", department: "", batch: "", examname: "", subject: "",
      timeTable: [], noofperiods: 1, staff: ""
    },
    clientIds: [], entityIds: [], branchIds: [], departmentIds: [], batchIds: [], days: [],
    subjects: [], staffs: [],
    parentData: [],
    prefixUrl: "",
    type: '',

    isClient: true, isEntity: true, isBranch: true, isDepartment: true, isBatch: true

  }

  helper = {
    noofperiods: <Fragment>No of Periods less than  <b>10 .</b> </Fragment>,
}
  async componentDidMount() {
    const { data } = this.state;
    const { actiontype,  } = this.props;
    this.selectoptGet(`clients`, "clientIds");
    await this.feildCheck()
    if (actiontype === "edit") {
      this.setState({ isEditForm: true });
      const { location: { state } } = this.props.props;
      if (state !== undefined)
        return this.formStateCheck(state);
    }
    else {
      this.formApi.setValues(data);
      this.addTimeTable("", "", "", "", "", "")
    }

  }

  formStateCheck = async (data) => {
    let noofperiods = data.ClassTT.length
    data.noofperiods = noofperiods
    data.timeTable = data.ClassTT
    await this.setState({ data });
    try {
      await this.clientDatas('client');
      await this.clientDatas('entity');
      await this.clientDatas('branch');
      await this.clientDatas('department');
      await this.clientDatas('batch');
      await this.formApi.setValues(data);
    } catch (err) {
      this.handleError()
    }
  }

  handleError(...err) {   
    return ToastService.Toast("Something went wrong.Please try again later", "default");
  }

  schema = {
    client: Joi.string().required().label("client"),
    entity: Joi.string().required().label("Entity"),
    branch: Joi.string().required().label("Branch"),
    department: Joi.string().required().label("Department"),
    batch: Joi.string().required().label("Batch"),
    noofdays: Joi.number().required().label("No of Days"),
    noofperiods: Joi.number().required().label("No of Periods"),
    day: Joi.string().required().label("Day"),
    subject: Joi.string().required().label("Subject Name"),
    staff: Joi.string().required().label("Staff Name"),
  }

  feildCheck = async () => {
   
    let { session: { data: sessionData } } = this.props.props;
    const { data } = this.state
    const { userType, userLevel, client, entity, branch, department, batch, code, branchId, departmentId, batchId } = sessionData;
    let switchType = '';
    if (userType === 'staff')
      switchType = userLevel;
    else
      switchType = userType;
  
    switch (switchType) {
      case 'sadmin':
        break;
      case 'client':
        data['client'] = client;
        await this.setState({ data, isClient: false })
        await this.clientDatas('client');
        await this.formApi.setValues(data);
        break;
      case 'entity':
      case 'branch':
        data['client'] = client || code;
        data['entity'] = entity || code;
        data['branch'] = branch || branchId;
        await this.setState({ data, isClient: false, isEntity: false, isBranch: false })
        await this.clientDatas('client');
        await this.clientDatas('entity');
        await this.clientDatas('branch');
        await this.formApi.setValues(data);
        break;
      case 'department':
        data['client'] = client || code;
        data['entity'] = entity || code;
        data['branch'] = branch || branchId;
        data['department'] = department || departmentId;
        await this.setState({ data, isClient: false, isEntity: false, isBranch: false, isDepartment: false })
        await this.clientDatas('client');
        await this.clientDatas('entity');
        await this.clientDatas('branch');
        await this.clientDatas('department');
        await this.formApi.setValues(data);
        break;
      default:
        data['client'] = client || code;
        data['entity'] = entity || code;
        data['branch'] = branch || branchId;
        data['department'] = department || departmentId;
        data['batch'] = batch || batchId;
        await this.setState({ data, isClient: false, isEntity: false, isBranch: false, isDepartment: false, isBatch: false })
        await this.formApi.setValues(data);
        break;
    }
  }



  handleChange = async ({ currentTarget: Input }) => {
    const { name, value } = Input;
    const { data } = this.state;
    data[name] = value;
    await this.setState({
      [name]: value
    }, () => {

    })
    await this.clientDatas(name, Input, value);

  }

  dynamicformhandleChange = async ({ currentTarget: Input }, i) => {
    let formData = this.formApi.getState().values
    const { name, value } = Input;
    const { data } = this.state;
    var opt;
    data[name] = value;
    await this.setState({
      [name]: value
    });
    switch (name) {
      case "staff":
        opt = Input.options[Input.selectedIndex];
        formData.timeTable[i].staffName = opt.text
        await this.formApi.setValues(formData);
        break;
      case "subject":
        opt = Input.options[Input.selectedIndex];
        formData.timeTable[i].subjectName = opt.text;
        await this.formApi.setValues(formData);
        break;
      default:
        break;
    }
  }




  clientDatas = async (name, Input, value) => {
    const { data } = this.state;
    switch (name) {
      case "client":
        this.selectoptGet(`namelist?client=${data.client}&type=client`, "entityIds")
        await this.setState({ entity: "", branch: "", department: "", batch: "", branchIds: [], departmentIds: [], batchIds: [] })
        break;
      case "entity":
        this.selectoptGet(`namelist?client=${data.client}&type=entity&entity=${data.entity}`, "branchIds")
        await this.setState({ branch: "", department: "", batch: "", departmentIds: [], batchIds: [] })
        break;
      case "branch":
        this.selectoptGet(`namelist?client=${data.client}&type=branch&entity=${data.entity}&branch=${data.branch}`, "departmentIds")
        await this.setState({ department: "", batch: "", batchIds: [] })
        break;
      case "department":
        this.selectoptGet(`namelist?client=${data.client}&type=department&entity=${data.entity}&branch=${data.branch}&department=${data.department}`, "batchIds")
        await this.setState({ batch: "" })
        break;
      case "batch":
        this.getScheduleDetails(`client=${data.client}&entity=${data.entity}&branch=${data.branch}&department=${data.department}&batch=${data.batch}&type=timetable`)
        this.getsubjectList(`client=${data.client}&entity=${data.entity}&branch=${data.branch}&department=${data.department}&batch=${data.batch}`, "subjects")
        this.getstaffList(`client=${data.client}&entity=${data.entity}&branch=${data.branch}&department=${data.department}&batch=${data.batch}`, "staffs")
        break;
      case "noofperiods":
      
        if (value < 10) {           
            await this.generatePeriods(value)          
        } else {          
          ToastService.Toast(`Value less than 10`, "default")
        }
        break
      default:
        break;
    }
  }

  async selectoptGet(url, type) {
    const data = await getselectData(url)
    if (data.data.statusCode === 1) {
      const Datas = data.data.data
      this.setState({ [type]: Datas });
    } else {
      //ToastService.Toast(`${type} Data Not Found!!!`, "default")
    }
  }
  async getScheduleDetails(params) {
    const data = await getScheduleDetails(params)
    if (data.data.statusCode === 1) {
      let timetabledata = data.data.data
      for (let item of timetabledata) {
        if (item.timetable && item.timetable[0] && item.timetable[0].category && item.timetable[0].category.name) {
          if (item.timetable[0].category.name === 'Class') {
            this.formApi.setValue("noofdays", item.timetable[0].category.days)
            let days = []
            let day = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
            for (let i = 0; i < item.timetable[0].category.days; i++) {
              days.push({ name: day[i] })
            }
            this.setState({ days })
          }
        }
      }
    } else {
      ToastService.Toast(" No Data Found!!!", "default")
    }

  }

  async getstaffList(params, type) {

    let url = `students?${params}&type=staff`
    const data = await getstaffList(url)

    if (data.data.statusCode === 1) {
      const Datas = data.data.data
      this.setState({ [type]: Datas });
    } else {
      ToastService.Toast(`${type} Data Not Found!!!`, "default")
    }

  }

  async getsubjectList(params, type) {
    let url = `particularCourse?${params}&type=subject`;
    const data = await getsubjectList(url);
    if (data.data.statusCode === 1) {
      const Datas = data.data.data;
      this.setState({ [type]: Datas });
    } else {
      ToastService.Toast(`${type} Data Not Found!!!`, "default")
    }
  }

  validateProperty = (name, value) => {
    const schema = Joi.reach(Joi.object(this.schema), name)
    const { error } = Joi.validate(value, schema);
    return error ? error.details[0].message : null;
  };

  setFormApi = (formApi) => {
    this.formApi = formApi;
  };

  // timeValue = async (time, i, field) => { // Get time from the timepicker
  //   const data = this.formApi.getState().values;
  //   //data[field] = time;  
  //   data.timeTable[i][field] = time
  //   this.formApi.setValues(data);
  //   var timetable = data.timeTable;    
  //   if(timetable && timetable.length > 0){
  //     for(let item of timetable){
  //       if(item.starttime !== '' && item.endtime !== ''){
  //         var from = item.starttime;
  //         var to =item.endtime;           
  //         if (from <= time &&  to >= time){
  //           console.log(item.starttime < item.endtime );   
  //         }else{
  //           console.log(item); 
  //           console.log(item.starttime < item.endtime );        
  //         }

  //       }        
  //     }
  //   }
    
  // }


  timeValue = async (time, i, field) => { // Get time from the timepicker
    const data = this.formApi.getState().values;
    //data[field] = time;  
    data.timeTable[i][field] = time
    this.formApi.setValues(data);

    let startTime = moment(data.timeTable[i]['starttime'], 'hh:mm a')
    let endTime = moment(data.timeTable[i]['endtime'], 'hh:mm a')   
    console.log(data.timeTable[i]['endtime'])  
    if (  moment(time, "LT", true).isValid() && endTime.isAfter(startTime))  
      await this.timeValidation(time)
    else if (data.timeTable[i]['endtime'] !=='') {
        ToastService.Toast("Starttime is less than End Time!!!", "default") 
      return;
    } 
  
  }

   timeValidation = async (time = '') => {
    const data = this.formApi.getState().values;
    const { timeTable } = data;
    let startTime;
    let endTime;
    let currentTime = moment(time, 'hh:mm a');
    let isInBetween;
    for (let i = 0; i < timeTable.length; i++) {
      startTime = moment(timeTable[i]['starttime'], 'hh:mm a')
      endTime = moment(timeTable[i]['endtime'], 'hh:mm a')
      isInBetween = currentTime.isBetween(startTime, endTime);
      console.log(currentTime.isBetween(startTime, endTime))
      if (isInBetween) {
        await this.setState({ isInBetween });
        break;
      }
      await this.setState({ isInBetween })
    }
    const { isInBetween: stateVal } = this.state;
    if (stateVal)
     ToastService.Toast('Check the timings again', "default")
       
  }


  onSubmit = async () => {
    const { actiontype } = this.props;
    const data = this.formApi.getState().values;
    let res;
    let classtimetableData = {
      "type": "timetable",
      "day": data.day,
      "batchId": data.batch,
      "departmentId": data.department,
      "timetable": data.timeTable,
      "client": data.client,
      "entity": data.entity,
      "branch": data.branch
    }
    if (actiontype === 'add') {
      res = await insertclassTimetable(classtimetableData);
    
    } else if (actiontype === 'edit') {
      res = await updateclassTimetable(classtimetableData);
   
    }
    if (res.data.statusCode !== 1) return ToastService.Toast(res.data.message, 'default'); // Check the response after consumed the API
    if (res.data.statusCode === 1) {
      await ToastService.Toast(res.data.message, 'default');
      this.resetForm();
    }
  }
  resetForm = () => { //Clear the form values afer the submission            
    this.formApi.reset()
    let path = `/timetable/Exam` //Redirect the page after updated the datas
    this.props.props.history.push({
      pathname: path,
    })
  }

  generatePeriods = async (value) => {
    const values = this.formApi.getState().values;
    values.timeTable = []
    this.formApi.setValues({ ...values });
    for (let i = 0; i < value; i++) {      
      await this.addTimeTable("", "", "", "", "", "")      
    }
    
  }

  addTimeTable = async (starttime, endtime, subject, subjectName, staff, staffName) => {
    const data = { starttime, endtime, subject, subjectName, staff, staffName };
    const values = this.formApi.getState().values;
    var timeTable = values.timeTable; 
    try{   
      timeTable.push(data)
    }catch(err){
      
    }
    this.formApi.setValues({ ...values, timeTable: timeTable });
  };

  removeTimeTable = (i) => {
    const values = this.formApi.getState().values;
    let timeTable = values.timeTable;
    timeTable.splice(i, 1);
    this.formApi.setValues({ ...values, timeTable: timeTable });
    this.setState({count: this.state.count - 1})
  };

  render() {
    const { clientIds, entityIds, branchIds, departmentIds, batchIds, days, staffs, subjects, 
      isClient, isEntity, isBranch, isDepartment, isBatch
    } = this.state

   

    return (

      <React.Fragment >
        <Fragment>
          <Container fluid>
            <Form getApi={this.setFormApi} onSubmit={this.onSubmit}>
              {({ formApi, formState }) => (
                <div className="page-user">
                  <h6>Class TimeTable</h6>
                  {isBatch && <section>
                    <h6>Client Details</h6>
                    <Row>
                      {isClient && <Col sm={12} md={3}>
                        <CustomSelect field="client" label="Client" name="client" getOptionValue={option => option.code}
                          getOptionLabel={option => option.name} options={clientIds}
                          validateOnBlur validate={e => this.validateProperty('client', e)} onChange={this.handleChange} />
                      </Col>}
                      {isEntity &&
                        <Col sm={12} md={3}>
                          <CustomSelect field="entity" label="Entity" name="entity" getOptionValue={option => option.code}
                            getOptionLabel={option => option.name} options={entityIds}
                            validateOnBlur validate={e => this.validateProperty('entity', e)} onChange={this.handleChange} />
                        </Col>}
                      {isBranch &&
                        <Col sm={12} md={3}>
                          <CustomSelect field="branch" label="Branch" name="branch" getOptionValue={option => option.code}
                            getOptionLabel={option => option.name} options={branchIds}
                            validateOnBlur validate={e => this.validateProperty('branch', e)} onChange={this.handleChange} />
                        </Col>}
                      {isDepartment &&
                        <Col sm={12} md={3}>
                          <CustomSelect field="department" label="Department" name="department" getOptionValue={option => option.code}
                            getOptionLabel={option => option.name} options={departmentIds}
                            onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('department', e)} />
                        </Col>}
                      {isBatch &&
                        <Col sm={12} md={3}>
                          <CustomSelect field="batch" label="Batch" name="batch" getOptionValue={option => option.code}
                            getOptionLabel={option => option.name} options={batchIds}
                            onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('batch', e)} />
                        </Col>}
                    </Row>
                  </section>}
                  <section>
                    <Row>
                      <Col sm={12} md={3}>
                        <Input
                          field="noofdays" label="No of Days *"
                          validateOnBlur validate={e => this.validateProperty('noofdays', e)} readOnly
                        />
                      </Col>
                      <Col sm={12} md={3}>
                        <CustomSelect field="day" label="Day*" name="day" getOptionValue={option => option.name}
                          getOptionLabel={option => option.name} options={days}
                          validateOnBlur validate={e => this.validateProperty('day', e)} />
                      </Col>
                      <Col sm={12} md={3}>
                        <Input maxlength="1"
                          field="noofperiods" name="noofperiods" label="No of Periods *"
                          validateOnBlur validate={e => this.validateProperty('noofperiods', e)}
                          onChange={this.handleChange} helper={this.helper.noofperiods}
                        />
                      </Col>
                    </Row>
                  </section>
                  <section>
                    {/* <Row className="justify-content-end">
                                            <button className="btn btn-link btn-sm" type="button"
                                                onClick={() => this.addTimeTable('')}
                                            >+ Add Period</button>
                                        </Row> */}
                    {formState.values.timeTable && formState.values.timeTable.map((timeTable, i) =>
                      <Scope scope={`timeTable[${i}]`} key={i}>
                        <Row>
                          <Col sm={12} md={3}>
                            <RTimePicker
                              field="starttime" label="Start Time*" value={moment(formState.values.timeTable[i].starttime ? formState.values.timeTable[i].starttime : "12:00 am", "h:mm a")} onChange={(data) => this.timeValue(data, i, "starttime")}
                            />
                          </Col>
                          <Col sm={12} md={3}>
                            <RTimePicker
                              field="endtime" label="End Time*" value={moment(formState.values.timeTable[i].endtime ? formState.values.timeTable[i].endtime : "12:00 pm", "h:mm a")} onChange={(data) => this.timeValue(data, i, "endtime")}
                            />
                          </Col>
                          <Col sm={12} md={3}>
                            <CustomSelect field="subject" label="Subject Name*" name="subject" getOptionValue={option => option.code}
                              getOptionLabel={option => option.displayName} options={subjects}
                              validateOnBlur validate={e => this.validateProperty('subject', e)} onChange={(e) => this.dynamicformhandleChange(e, i)} />
                          </Col>
                          <Col sm={12} md={3}>
                            <CustomSelect field="staff" label="Staff*" name="staff" getOptionValue={option => option.uid}  validate={e => this.validateProperty('staff', e)} 
                              getOptionLabel={option => option.name} options={staffs}
                              validateOnBlur onChange={(e) => this.dynamicformhandleChange(e, i)} />
                          </Col>
                          {/* {
                                formState.values.timeTable.length > 1 && i !== 0 ?
                                  <Col sm={12}><button onClick={() => this.removeTimeTable(i)} className="btn btn-link btn-sm">Remove</button> </Col> : ''
                                } */}
                        </Row>
                      </Scope>
                    )}
                  </section>

                  <button type="submit" className="btn btn-primary btn-sm">Submit</button>

                </div>
              )}

            </Form>
          </Container>
        </Fragment>
      </React.Fragment >
    );
  }
}

