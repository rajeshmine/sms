import { Input, Textarea } from 'components/common/forms';
import { Form, } from 'informed';
import Joi from 'joi-browser';
import React, { Fragment, Component } from 'react';
import { Col, Row } from 'reactstrap';
import { saveUser, getsuserListData } from 'services/userService';
import ToastService from 'services/toastService'


export default class ExtracurricularForm extends Component {
  state = {
    data: {
      title: '', description: ''
    },
    uid: "",
    errors: {},
    isLoading: true
  }

  schema = {
    title: Joi.string().required().label("Title"),
    description: Joi.string().required().label("Description"),
  }

  async componentDidMount() {
    const sampleData = await this.getSampleData()
    this.formApi.setValues(sampleData);
  }

  getSampleData = async () => {
    const { uid, data } = this.props
    let params = `usersList?uid=${uid}&type=user&client=${data.clientid}&entity=${data.entityid}&branch=${data.branch}`
    const userListData = await getsuserListData(params)
    let userData = userListData.data.data[0]
    let extracurricularData = (userData.extracurricular && userData.extracurricular[0])
    this.setState({
      client: userData.client, entity: userData.entity, branch: userData.branch, department: userData.department, batch: userData.batch, uid: userData.uid
    })
    return {
      "title": (extracurricularData && extracurricularData.title) || '',
      "description": (extracurricularData && extracurricularData.description) || '',
    }
  }

  validateProperty = (name, value) => {
    const schema = Joi.reach(Joi.object(this.schema), name)
    const { error } = Joi.validate(value, schema);
    return error ? error.details[0].message : null;
  }

  setFormApi = (formApi) => {
    this.formApi = formApi
  }

  onSubmit = async () => {
    const { props } = this.props
    const { client, entity, branch, uid } = this.state
    const data = this.formApi.getState().values
    let params = `client=${client}&entity=${entity}&branch=${branch}&uid=${uid}`
    const res = await saveUser("extracurricular", params, data)
    if (res.data.statusCode === 1) {
      ToastService.Toast(`Extra curricular details Updated Successfully`, "default")
      props.history.push(`/users`)
    }
    else if (res.data.statusCode === 0)
      ToastService.Toast(res.data.message, "default")
    else
      ToastService.Toast(`Failed to update Extra curricular Details`, "default")

  }

  render() {
    return (
      <Fragment>
        <Form getApi={this.setFormApi} className="form-container form-container--login" autoComplete="off" onSubmit={this.onSubmit}>
          {({ formApi, formState }) => (
            <div>
              <section>
                <h6>Extra Details</h6>
                <Row>
                  <Col sm="12" md="4">
                    <Input
                      field="title" label="Title*" name="title"
                      validateOnBlur validate={e => this.validateProperty('title', e)}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col sm="12" md="12">
                    <Textarea
                      field="description" label="Description*" name="description"
                      validateOnBlur validate={e => this.validateProperty('description', e)}
                    />
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
