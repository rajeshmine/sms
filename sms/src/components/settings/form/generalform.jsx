import Joi from 'joi-browser';
import React, { Fragment, Component } from 'react';
import { Col, Row } from 'reactstrap';
import { Form } from 'informed';
import { Input } from 'components/common/forms';
import { addgeneralSettings, editgeneralSettings, getSubLists, saveSettingsTitle, updateSettingsTitle, updateSettingsReligion, saveSettingsReligion } from 'services/settingsService';
import { getselectData } from 'services/userService'
import ToastService from 'services/toastService'

export default class AddGeneralSettings extends Component {
  constructor(props) {

    super(props)

    this.state = {
      uid: '',
      data: {
        code: '',
        internalcode: '',
        department: '',
        batch: '',
        modules: '',
        name: '',
        shortname: ''
      },
      clientDetails: '',
      clientnames: [],
      clientIds: [], entityIds: [], branchIds: [], departmentIds: [], batchIds: [],
    }
  }

  schema = {
    department: Joi.string().required().label("Department"),
    client: Joi.string().required().label("Client"),
    entity: Joi.string().required().label("Entity"),
    branch: Joi.string().required().label("Branch"),
    code: Joi.any().required().label("Code"),
    name: Joi.string().required().label("Name"),
    shortname: Joi.string().required().label("Short Name"),
    caste: Joi.any().required().label("Caste"),
  };

  async componentDidMount() {

    const { action } = this.props
    this.selectoptGet(`clients`, "clientIds")
    await this.feildCheck()

    this.getCasteDetails();

    if (action === "edit") {
      this.setState({ isEditForm: true });
      const { location: { state: { row } } } = this.props.props;

      if (row !== undefined) { }
      return this.formStateCheck(row);
    }
  }

  formStateCheck = async (data) => {
    const { formType } = this.props
    if ((formType === 'title') || (formType === 'religion')) {
      data.name = data.displayName
    }
    data.internalcode = data.internalCode
    data.shortname = data.shortName || ''
    data.caste = data.caste || ''
    data.department = data.refId || ''
    await this.setState({ data });
    try {
      await this.formApi.setValues(data);
    } catch (err) {
      this.handleError(err);
    }

  }

  feildCheck = async () => {

    let { session: { data: sessionData } } = this.props.props;
    const { data } = this.state
    const { userType, userLevel, client, entity, branch, department, code, branchId, departmentId } = sessionData;
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
        await this.setState({ data, isClient: false, isEntity: false, isBranch: false })
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
        await this.setState({ data, isClient: false, isEntity: false, isBranch: false, isDepartment: false, isBatch: false })
        await this.formApi.setValues(data);
        break;
    }
  }



  handleError(...err) {
    return ToastService.Toast("Something went wrong.Please try again later", 'default');
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
      case "batch":
        break;
      default:
        break;
    }
  }

  async getCasteDetails() {
    var casteArray = [];
    let params = `caste?type=caste`
    const casteList = await getSubLists(params)
    if (casteList.data.statusCode === 1) {
      for (var i = 0; i < casteList.data.data.length; i++) {
        casteArray.push({ "name": casteList.data.data[i].name, "code": casteList.data.data[i].code })
      }
      await this.setState({ casteDetails: casteArray }, () => {
      });
    }
  }

  validateProperty = (name, value) => {
    const schema = Joi.reach(Joi.object(this.schema), name)
    const { error } = Joi.validate(value, schema);
    return error ? error.details[0].message : null;
  };

  setFormApi = (formApi) => {
    this.formApi = formApi;
  }

  handleChange = async ({ currentTarget: Input }) => {
    const { name, value } = Input;
    const { data } = this.state;
    data[name] = value;
    this.setState({
      [name]: value
    }, () => {
    })
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

  setFormApi = (formApi) => {
    this.formApi = formApi;
  }

  resetForm = () => {
    this.formApi.reset()
    const { action, formType } = this.props
    if (action === 'edit') {
      this.props.props.history.push(`/settings/${formType}`)
    }
  }

  onSubmit = async () => {
    var addSettings, titleSettings, religionSettings;
    const { action, formType } = this.props

    const data = this.formApi.getState().values
    const { code, internalcode, name, shortname, _id } = data

    let temp, edittemp, params
    if (formType === 'caste') {
      params = "caste"
      temp = {
        "type": "caste",
        "internalCode": internalcode,
        "name": shortname,
        "fullName": name,
        "code": code
      }
      edittemp = {
        "type": "caste",
        "id": _id,
        "internalCode": internalcode,
        "name": shortname,
        "fullName": name,
        "code": code
      }
    } else if ((formType === 'title') || (formType === 'religion')) {
      params = formType
      temp = {
        "type": formType,
        "code": code,
        "displayName": name,
        "internalCode": internalcode,
        "shortName": shortname
      }
      edittemp = {
        "type": formType,
        "_id": _id,
        "code": code,
        "displayName": name,
        "internalCode": internalcode,
        "shortName": shortname,
      }
    } else if (formType === 'state') {
      params = "country"
      temp = {
        "type": "state",
        "name": name,
        "code": code,
        "country": "101"
      }
      edittemp = {
        "type": "state",
        "name": name,
        "code": code,
        "country": "101",
        "id": _id
      }
    } else {
      if (formType === 'subcaste') {
        params = "caste"
      } else {
        params = formType
      }
      temp = {
        "type": formType,
        "name": name,
        "code": code
      }
      edittemp = {
        "type": formType,
        "name": name,
        "code": code,
        "id": _id
      }
    }

    if (formType === 'title') {

      if (action === 'edit') {

        titleSettings = await updateSettingsTitle(edittemp)
      } else if (action === 'add') {
        titleSettings = await saveSettingsTitle(temp)
      }

      if (titleSettings.data.statusCode !== 1) return ToastService.Toast(titleSettings.data.message, 'default');
      this.resetForm();
      if (titleSettings.data.statusCode === 1) {
        ToastService.Toast(titleSettings.data.message, 'default');
        this.resetForm();
        this.props.props.history.push(`/settings/${formType}`)
      }
    } else if (formType === 'religion') {

      if (action === 'edit') {

        religionSettings = await updateSettingsReligion(edittemp)
      } else if (action === 'add') {
        religionSettings = await saveSettingsReligion(temp)
      }

      if (religionSettings.data.statusCode !== 1) return ToastService.Toast(religionSettings.data.message, 'default');
      this.resetForm();
      if (religionSettings.data.statusCode === 1) {
        ToastService.Toast(religionSettings.data.message, 'default');
        this.resetForm();
        this.props.props.history.push(`/settings/${formType}`)
      }
    }


    else {
      if (action === 'edit') {
        addSettings = await editgeneralSettings(params, edittemp)
      } else if (action === 'add') {
        addSettings = await addgeneralSettings(params, temp)
      }

      if (addSettings.data.statusCode !== 1) return ToastService.Toast(addSettings.data.message, 'default');
      this.resetForm();
      if (addSettings.data.statusCode === 1) {
        ToastService.Toast(addSettings.data.message, 'default');
        this.resetForm();
        this.props.props.history.push(`/settings/${formType}`)
      }
    }
  }

  render() {
    const { action, formType } = this.props
    return (
      <Fragment>
        <h6>{action} {formType} </h6>
        <Form getApi={this.setFormApi} onSubmit={this.onSubmit} >
          {({ formApi, formState }) => (
            <div>
              <section>
                <Row>
                  <Col sm={6} md={3}>
                    <Input field="code" readOnly={action === 'edit'} label=" Code*" name="code" validate={e => this.validateProperty('code', e)} />
                  </Col>
                  {
                    formType === 'religion' || formType === 'title' || formType === 'caste' ?
                      <Col sm={6} md={3}>
                        <Input field="internalcode" label="Internal Code" name="internalcode" />
                      </Col> : ''
                  }

                  <Col sm={6} md={3}>
                    <Input field="name" label="Name*" name="name" validate={e => this.validateProperty('name', e)} />
                  </Col>

                  {
                    formType === 'religion' || formType === 'title' || formType === 'caste' ?
                      <Col sm={6} md={3}>
                        <Input field="shortname" label="Short Name*" name="shortname" validate={e => this.validateProperty('shortname', e)} />
                      </Col> : ''
                  }


                  <Col sm={6} md={3}>

                  </Col>
                </Row>

              </section>
              <div className="text-right">
                <button type="submit" className="btn btn-primary btn-sm">Submit</button>
              </div>
            </div>
          )}
        </Form>
      </Fragment >
    )
  }
}