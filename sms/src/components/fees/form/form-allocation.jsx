import React, { Component, Fragment } from 'react';
import { Form } from 'informed';
import Joi from 'joi-browser';
import { Col, Row } from 'reactstrap';
import moment from 'moment';
import { Input, CustomSelect, Textarea, SimpleAutoSuggest } from 'components/common/forms';
import DRP1 from 'components/common/forms/date-range-picker';
import { getselectData } from 'services/userService';
import ToastService from 'services/toastService'
import { addFeeallocation } from 'services/feeService';
import { updateFeeallocation } from 'services/feeService';



export default class FeeallocationForm extends Component {
  state = {
    data: {
      client: "", entity: "", branch: "", department: "", batch: "", from: '', to: ''
    },
    clientIds: [], entityIds: [], branchIds: [], departmentIds: [], batchIds: [],
    uid: '',
    errors: {},
    isLoading: true,
    isEditForm: false,
    isClient: true, isEntity: true, isBranch: true, isDepartment: true, isBatch: true

  };

  //   async componentDidMount() {
  //    
  //     const { data } = this.state
  //     const { actiontype } = this.props.props.match.params 
  //     this.selectoptGet(`clients`, "clientIds")
  //     this.formApi.setValues(data);
  //     if (actiontype === "edit") {

  //   this.setState({ isEditForm: true });

  //   const { location: { state: { data, details } } } = this.props.props;
  //   var test = Object.assign(data, details);
  //  
  //   if (test !== undefined) { }
  //   return this.formStateCheck(test);
  // }
  //     // const sampleData = await this.getSampleData()

  //    
  //     // this.formApi.setValues(sampleData);

  // }


  async componentDidMount() {
  
    this.selectoptGet(`clients`, "clientIds")
    await this.feildCheck()

    const { actiontype } = this.props
    if (actiontype === "edit") {
      this.setState({ isEditForm: true });
      const { row, details } = this.props.props.location.state;
      this.formApi.setValues(row, details);
      const { location: { state } } = this.props.props;
      if (state !== undefined)

        return this.formStateCheck(row, details);
    }
  }

  optionSchema = {
    label: Joi.string().empty('').optional(),
    value: Joi.any().optional()
  }

  schema = {
    client: Joi.string().required().label('Client'),
    entity: Joi.string().required().label('Entity'),
    branch: Joi.string().required().label('Branch'),
    department: Joi.string().optional(),
    batch: Joi.string().optional(),
    title: Joi.string().required().label('Title'),
    date: Joi.string().required().label('Date'),
    amount: Joi.number().required().label('Amount'),
    fineAmount: Joi.number().required().label('Fine Amount'),
    description: Joi.any().empty('').optional(),
    caste: Joi.object(this.optionSchema).optional(),
    excemption: Joi.any().empty('').optional(),
  }

  handleChange = async ({ currentTarget: Input }) => {
    const { name, value } = Input;
    const { data } = this.state;
    data[name] = value;
    this.setState({
      [name]: value
    }, () => {
    })
    await this.clientDatas(name);
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


  formStateCheck = async (data) => {
   
    data.title = data.category;
    data.startDate = data.dueDate.from;
    data.endDate = data.dueDate.to;

   

    await this.setState({ data, department: data.department, batch: data.batch });
    try {
      await this.clientDatas('client');
      await this.clientDatas('entity');
      await this.clientDatas('branch');
      await this.clientDatas('department');
      await this.clientDatas('batch');
      await this.formApi.setValues(data);
     

    } catch (err) {
      this.handleError(err);
    }
  }

  handleError(...err) {      
    return ToastService.Toast("Something went wrong.Please try again later",'default');
}

  clientDatas = async (name) => { // Get the Client,Entity,Branch,Department,Batch,EventName Lists
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
      default:
        break;
    }
  }

  async selectoptGet(url, type) {
    const data = await getselectData(url)
    if (data.data.statusCode === 1) {
      const Datas = data.data.data
      this.setState({ [type]: Datas });
    }
  }

  dateValue = async (date, field) => {
    const data = this.formApi.getState().values;
    const { from, to } = date;
    data[field] = { from: new Date(from).toLocaleDateString(), to: new Date(to).toLocaleDateString() };
    data.startDate = data.date.from;
    data.endDate = data.date.to;
    this.formApi.setValues(data);
  }

  setFormApi = (formApi) => {
    this.formApi = formApi
  }

  validateProperty = (name, value) => {
    const schema = Joi.reach(Joi.object(this.schema), name)
    const { error } = Joi.validate(value, schema);
    return error ? error.details[0].message : null;
  };

  resetForm = () => {
    this.formApi.reset()
    let path = `/fees/feeallocation`  
    this.props.props.history.push({
        pathname: path,
    })   
  }
  
  onSubmit = async () => { //Store Datas to the APIs
    let response;
    const { actiontype } = this.props
    const data = this.formApi.getState().values;
   

    let params = `client=${data.client}&entity=${data.entity}&branch=${data.branch}`

    let FeeallocationData = {
      "category": data.title,
      "amount": data.amount,
      "dueDate": {
        "from": data.startDate,
        "to": data.endDate
      },
      "description": data.description,
      "caste": data.caste.label || '',
      "excemption": data.excemption,
      "fineAmount": data.fineAmount,
      // "clients": [{
      "department": data.department,
      "batch": data.batch
      // }
      // ]
    }

    if (actiontype === 'add')
      response = await addFeeallocation(params, FeeallocationData)
    else if (actiontype === 'edit')
      response = await updateFeeallocation(params, FeeallocationData)
    if (response.data.statusCode !== 1) return ToastService.Toast(response.data.message,   'default'); // Check Datas
    if (response.data.statusCode === 1) {
      await ToastService.Toast(response.data.message, 'default');
      this.resetForm();
    }

  }

  render() {
    const { clientIds, entityIds, branchIds, departmentIds, batchIds,  caste,
      isClient, isEntity, isBranch, isDepartment, isBatch
    } = this.state
    
    return (
      <Fragment>
        <Form getApi={this.setFormApi} onSubmit={this.onSubmit} >
          {({ formApi, formState }) => (
            <div>
              {isBatch && <section>
                {/* <p>{formState.values.startDate}</p>
              <p>{formState.values.endDate}</p> */}
                <Row>
                  <Col sm={12}>
                    <h6>CLIENT DETAILS</h6>
                  </Col>
                </Row>
                <Row>
                  {isClient && <Col sm={12} md={3}>
                    <CustomSelect field="client" label="Client*" name="client" getOptionValue={option => option.code} validateOnBlur validate={e => this.validateProperty('client', e)} getOptionLabel={option => option.name} options={clientIds}
                      onChange={this.handleChange} />
                  </Col>}
                  {isEntity && <Col sm={12} md={3}>
                    <CustomSelect field="entity" label="Entity*" name="entity" getOptionValue={option => option.code} validateOnBlur validate={e => this.validateProperty('entity', e)} getOptionLabel={option => option.name} options={entityIds}
                      onChange={this.handleChange} />
                  </Col>}
                  {isBranch && <Col sm={12} md={3}>
                    <CustomSelect field="branch" label="Branch*" name="branch" getOptionValue={option => option.code} validateOnBlur validate={e => this.validateProperty('branch', e)} getOptionLabel={option => option.name} options={branchIds}
                      onChange={this.handleChange} />
                  </Col>}
                  {isDepartment && <Col sm={12} md={3}>
                    <CustomSelect field="department" label="Department" name="department" getOptionValue={option => option.code}
                      getOptionLabel={option => option.name} options={departmentIds}
                      onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('department', e)} />
                  </Col>}
                  {isBatch && <Col sm={12} md={3}>
                    <CustomSelect field="batch" label="Batch" name="batch" getOptionValue={option => option.code}
                      getOptionLabel={option => option.name} options={batchIds}
                      onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('batch', e)} />
                  </Col>}
                </Row>
              </section>}
              <section>
                <Row>
                  <Col sm={12}>
                    <h6>ADD FEE ALLOCATION</h6>
                  </Col>
                </Row>
                <Row>
                  <Col sm={12} md={3}>
                    <Input
                      field="title" label="Fee Type Title*" name="title"
                      validate={e => this.validateProperty('title', e)}
                    />
                  </Col>
                  <Col sm={12} md={3}>
                    <Input
                      field="amount" label="Amount*" name="amount"
                      validate={e => this.validateProperty('amount', e)}
                    />
                  </Col>

                  <Col sm={12} md={3}>
                    <Input
                      field="fineAmount" label="Fine Amount*" name="fineAmount"
                      validate={e => this.validateProperty('fineAmount', e)}
                    />
                  </Col>
                  <Col sm={12} md={3}>
                    <SimpleAutoSuggest label="Caste" field="caste" inputProps={caste} suggestType="caste" getOptionValue={(option) => (option['label'])} validateOnBlur validate={e => this.validateProperty('caste', e)} />
                  </Col>
                  <Col sm={12} md={3}>
                    <Input
                      field="excemption" label="Excemption" name="excemption"
                      validateOnBlur validate={e => this.validateProperty('excemption', e)}
                    />
                  </Col>
                  <Col sm="12" md="3">
                    <Textarea
                      field="description" label="Description" name="description"
                      validateOnBlur validate={e => this.validateProperty('description', e)}
                    />
                  </Col>
                  <Col sm={12} md={5}>
                    <label>Date*</label>
                    <DRP1 field="date" label="Date*" id="date" startDate={moment(formState.values.startDate)} endDate={moment(formState.values.endDate)} onChange={(data) => this.dateValue(data, "date")} validate={e => this.validateProperty('date', e)} />
                  </Col>
                </Row>
              </section>

              <div className="text-right">
                  <button type="submit" className="btn btn-primary btn-sm">Submit</button>
              </div>
            </div>
          )}
        </Form>
      </Fragment>
    );
  }
}