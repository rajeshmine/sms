import 'styles/App.scss';
import React, { Component, Fragment } from 'react';
import Joi from 'joi-browser';
import { Col, Row, Container } from 'reactstrap';
import { Form } from 'informed';
import { Input, Textarea } from 'components/common/forms';
import { addFeeCollection } from 'services/feeService';
import { getselectData } from 'services/userService';
//import moment from 'moment';
import ToastService from 'services/toastService';


export default class FeecollectionForm extends Component {
  state = {
    data: {},
    isClient: true, isEntity: true, isBranch: true, isDepartment: true, isBatch: true
  }

  async componentDidMount() {
    var todayDate = new Date().toISOString().slice(0, 10);
    await this.setState({
      todayDate: todayDate
    })
    const { row, details } = this.props.props.location.state;
    return this.getSampleData(row, details);
  }

  schema = {
    name: Joi.string().required().label('Name'),
    amount: Joi.number().required().label('Amount'),
    category: Joi.string().required().label('Fee Category'),
    fineAmount: Joi.number().required().label('Fine Amount'),
    paidAmount: Joi.number().required().label('Paid Amount'),
    remarks: Joi.string().optional(),
  }


  getSampleData = async (data, details) => {
    var test = Object.assign(data, details);
    data.amount = data.feeCollection[0].amount
    data.category = data.feeCollection[0].category
    data.fineAmount = data.feeCollection[0].fineAmount
    data.paidAmount = data.feeCollection[0].paidAmount
    data.remarks = data.feeCollection[0].remarks
    await this.setState({ test });
    try {
      await this.formApi.setValues(data);
    } catch (err) {
      this.handleError(err);
    }
  }

  onSubmit = async (test = []) => {
    const formdata = this.formApi.getState().values
    const actfine = parseInt(formdata.amount) + parseInt(formdata.fineAmount)
    const myamount = parseInt(actfine) - parseInt(formdata.paidAmount)

    if (myamount === 0) {
      this.setState({
        status: "paid"
      })
    } else {
      this.setState({
        status: "unpaid"
      })
    }
    if (test.length !== 0) {
      let obj = {
        "fineAmount": formdata.fineAmount,
        "batchId": formdata.batch,
        "departmentId": formdata.department,
        "feeid": formdata.feeCollection[0].id,
        "client": formdata.client,
        "entity": formdata.entity,
        "branch": formdata.branch,
        "students": [{ "uid": formdata.studentId, "paidDate": this.state.todayDate, "status": this.state.status, "remarks": formdata.remarks, "paidAmount": formdata.paidAmount }]
      }

      const res = await addFeeCollection(obj)

      if (res.data.statusCode === 1) {
        ToastService.Toast(`Fee Amount Paid Successfully!!!`, "default")
        await this.props.props.history.push(`/fees/feecollection`)
      } else {
        ToastService.Toast(`Data Inserted Failed!!!`, "default")
      }
    }
  }

  handleChange = async ({ currentTarget: Input }) => {
    const { name, value } = Input;
    const { data } = this.state;
    data[name] = value;
    await this.setState({ [name]: value })
    await this.clientDatas(name)
  }

  clientDatas = async (name) => {
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
        await this.setState({ departmentId: "", batch: "", departmentIds: [] })
        break;
      case "departmentId":
        this.selectoptGet(`namelist?client=${data.client}&type=department&entity=${data.entity}&branch=${data.branch}&department=${data.departmentId}`, "batchIds")
        await this.setState({ batch: "", batchIds: [] })
        this.examnameget(`scheduleTypeId?client=${data.client}&entity=${data.entity}&branch=${data.branch}&type=exam`, "examname");
        break;
      case "batch":
        break;
      default:
        break;
    }
  }


  async selectoptGet(url, type) {
    try {
      const data = await getselectData(url)
      if (data.data.statusCode === 1) {
        const Datas = data.data.data
        await this.setState({ [type]: Datas });
      }
    } catch (err) { this.handleError(err) }
  }

  validateProperty = (name, value) => {
    const schema = Joi.reach(Joi.object(this.schema), name)
    const { error } = Joi.validate(value, schema);
    return error ? error.details[0].message : null;
  };


  setFormApi = (formApi) => {
    this.formApi = formApi;
  }


  handleError(...err) {
    return ToastService.Toast("Somthig went wrong.Please try again later", "default");
  }

  render() {
    const { formActionType } = this.state;

    return (

      <React.Fragment >

        <Fragment>
          <Container fluid>
            <Form getApi={this.setFormApi} onSubmit={this.onSubmit}>
              {({ formApi, formState }) => (
                <div className="page-user">
                  <section>
                    <h6>Add Fee Collection</h6>
                    <Row>

                      <Col sm={12} md={3}>
                        <Input field="name" label="Name*" name="name"
                          validateOnBlur validate={e => this.validateProperty('name', e)} onChange={this.handleChange} readOnly />
                      </Col>
                      <Col sm={12} md={3}>
                        <Input field="amount" label="Amount*" name="amount"
                          validateOnBlur validate={e => this.validateProperty('amount', e)} onChange={this.handleChange} readOnly />
                      </Col>
                      <Col sm={12} md={3}>
                        <Input field="category" label="Category*" name="category"
                          validateOnBlur validate={e => this.validateProperty('category', e)} onChange={this.handleChange} readOnly />
                      </Col>
                      <Col sm={12} md={3}>
                        <Input field="fineAmount" label="fineAmount*" name="fineAmount"
                          validateOnBlur validate={e => this.validateProperty('fineAmount', e)} onChange={this.handleChange} readOnly={formActionType} />
                      </Col>
                      <Col sm={12} md={3}>
                        <Input field="paidAmount" label="Paid Amount*" name="paidAmount"
                          validateOnBlur validate={e => this.validateProperty('paidAmount', e)} onChange={this.handleChange} readOnly={formActionType} />
                      </Col>
                    </Row>

                    <Row>
                      <Col sm={12} md={12}>
                        <Textarea
                          field="remarks" label="Remarks" name="remarks"
                          validateOnBlur validate={e => this.validateProperty('remarks', e)}
                          onChange={this.handleChange} readOnly={formActionType}
                        />
                      </Col>
                    </Row>
                  </section>
                  {!formActionType &&
                    <button type="submit" disabled={formState.invalid} className="btn btn-primary btn-sm">Submit</button>}
                </div>
              )}

            </Form>
          </Container>
        </Fragment>

      </React.Fragment >
    );
  }
}

