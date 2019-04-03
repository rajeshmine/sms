import React, { Fragment } from 'react';
import { NavLink } from 'react-router-dom';
import { Container, Row, Col, } from 'reactstrap';
import { Form } from 'informed';
import Joi from 'joi-browser';

import List from './list';
import { getCircularList } from 'services/circularService';
import ToastService from 'services/toastService';
import { getselectData } from 'services/userService';
import { CustomSelect } from 'components/common/forms';


export default class CircularDataList extends React.Component {
  state = {
    data: {},
    isPageLoading: false,
    isLoading: false,
    type: '',
    client: '',
    entity: '',
    department: '',
    branch: '',
    batch: '',
    clientIds: [], entityIds: [], branchIds: [], departmentIds: [], batchIds: [],
    isTableLoading: true,
  }

  async componentDidMount() {
    await this.init(this.props, true)
    this.selectoptGet(`clients`, "clientIds")
  }

  async componentWillReceiveProps(props) {
    await this.init(props, false)
  }

  async init(props, isPageLoading = false) {
    const { location: { state } } = props.props;
    await this.setState({ data: state || {} });
  }

  validateProperty = (name, value) => {
    const schema = Joi.reach(Joi.object(this.schema), name)
    const { error } = Joi.validate(value, schema);
    return error ? error.details[0].message : null;
  };

  schema = {
    client: Joi.string().required().label("Client"),
    entity: Joi.string().required().label("Entity"),
    branch: Joi.string().required().label("Branch"),
    departmentId: Joi.string().required().label("Department"),
    batchId: Joi.string().required(),
    examName: Joi.string().required()
  };

  renderForm(formType, data) {
    return <List form={formType} data={data} props={this.props} refreshTable={this.onSubmit} />
  }

  handleChange = async ({ currentTarget: Input }) => {
    const { name, value } = Input;
    const { data } = this.state;
    data[name] = value;
    this.setState({ [name]: value })
    this.clientDatas(name);
  }

  clientDatas = async (name) => {
    const { data } = this.state;
    switch (name) {
      case "client":
        await this.selectoptGet(`namelist?client=${data.client}&type=client`, "entityIds")
        await this.setState({ entity: "", branch: "", department: "", batch: "", branchIds: [], departmentIds: [], batchIds: [] })
        break;
      case "entity":
        await this.selectoptGet(`namelist?client=${data.client}&type=entity&entity=${data.entity}`, "branchIds")
        await this.setState({ branch: "", department: "", batch: "", departmentIds: [], batchIds: [] })
        break;
      case "branch":
        await this.selectoptGet(`namelist?client=${data.client}&type=branch&entity=${data.entity}&branch=${data.branch}`, "departmentIds")
        await this.setState({ departmentId: "", batch: "", })
        break;
      case "department":
        this.selectoptGet(`namelist?client=${data.client}&type=department&entity=${data.entity}&branch=${data.branch}&department=${data.department}`, "batchIds")
        await this.setState({ batch: "", batchIds: [] })
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
    } else {
      ToastService.Toast(`${type} Data Not Found!!!`, "default")
    }
  }

  onSubmit = async () => {
    this.tableHide()
    const { notificationtype } = this.props.props.match.params    
    switch (notificationtype) {
      case 'circular':
        return this.getCircularList()
      default:
        return
    }
  }

  getCircularList = async () => {   
    const { data: { client, entity, branch, department, batch } } = this.state
    let params = `client=${client}&entity=${entity}&branch=${branch}&department=${department}&batch=${batch}`       
    try {
      const res = await getCircularList(params);
      if (res.data.statusCode === 1) {
        let data = res.data.data             
        await this.setState({
          tableData: data,
          isTableLoading: false
        })
      } else if (res.data.statusCode === 0) {
        await this.setState({
          tableData: [],
          isTableLoading: false
        })
      }
    } catch (err) {
      this.handleError(err)
    }
  }

  handleError(...err) {
    return ToastService.Toast("Something went wrong.Please try again later", "default");
  }

  tableHide() {
    this.setState({ isTableLoading: true })
  }

  addNavigation(form) {
    return <NavLink className="btn btn-primary btn-sm" to={`/notification/add/circular`}>+ Circular </NavLink>
  }

  render() {
    const { notificationtype } = this.props.props.match.params
    const { clientIds, entityIds, branchIds, departmentIds, batchIds, tableData, isTableLoading } = this.state;

    return (
      <Fragment>
        <Container fluid>
          <div style={{ textAlign: "right" }}>
            {this.addNavigation()}
          </div>
         
          <Form getApi={this.setFormApi} onSubmit={this.onSubmit} >
            {({ formApi, formState }) => (
              <div>
                <section>
                  <Row>
                    <Col sm={6} md={3}>
                      <CustomSelect field="client" label="Client*" name="client" getOptionValue={option => option.code} getOptionLabel={option => option.name} validateOnBlur validate={e => this.validateProperty('client', e)} onChange={this.handleChange} options={clientIds} />
                    </Col>
                    <Col sm={6} md={3}>
                      <CustomSelect field="entity" label="Entity*" name="entity" getOptionValue={option => option.code} getOptionLabel={option => option.name} validateOnBlur validate={e => this.validateProperty('entity', e)} onChange={this.handleChange} options={entityIds} />
                    </Col>
                    <Col sm={6} md={3}>
                      <CustomSelect field="branch" label="Branch*" name="branch" getOptionValue={option => option.code} getOptionLabel={option => option.name} validateOnBlur validate={e => this.validateProperty('branch', e)} onChange={this.handleChange} options={branchIds} />
                    </Col>
                    <Col sm={12} md={3}>
                      <CustomSelect field="department" label="Department*" name="department" getOptionValue={option => option.code}
                        getOptionLabel={option => option.name} options={departmentIds}
                        validateOnBlur validate={e => this.validateProperty('departmentId', e)} onChange={this.handleChange} />
                    </Col>
                    <Col sm={6} md={3}>
                      <CustomSelect field="batch" label="Batch*" getOptionValue={option => option.code} getOptionLabel={option => option.name} validateOnBlur validate={e => this.validateProperty('batchId', e)} onChange={this.handleChange} options={batchIds} />
                    </Col>
                  </Row>
                </section>
                <div className="text-right">
                  <button type="submit" className="btn btn-primary btn-sm">Submit</button>
                </div>
              </div>
            )}
          </Form>
        </Container>
        <br />
        <Container fluid>
          {!isTableLoading &&
            this.renderForm(notificationtype, tableData)
          }
        </Container>
      </Fragment>
    );
  }
}