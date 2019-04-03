import Joi from 'joi-browser';
import React, { Fragment, Component } from 'react';

import { Form } from 'informed';
import { CustomCheckBox } from 'components/common/forms';
import { AddressComponent, addressSchema } from 'components/common/forms/address';
import { saveUser,  getsuserListData } from 'services/userService';
import ToastService from 'services/toastService'


export default class CommunicationForm extends Component {
  state = {
    uid: '',
    data: {
      primary: {},
      sameAsPrimary: true,
      secondary: {}
    },

    errors: {},
    isLoading: true
  };


  schema = {
    primary: Joi.object(addressSchema),
    sameAsPrimary: Joi.boolean(),
    secondary: Joi.object(addressSchema)
  };

  async componentDidMount() {
    let { uid, user } = this.props;
    user = await this.getSampleData();
    this.setState({ uid })
    this.formApi.setValues(user);
  }

 
  getSampleData = async () => {
    const { uid, data } = this.props
    let params = `usersList?uid=${uid}&type=user&client=${data.clientid}&entity=${data.entityid}&branch=${data.branch}`
    const userListData = await getsuserListData(params)
    let userData = userListData.data.data[0]
    let communicationData = (userData && userData.communication && userData.communication[0])
    this.setState({
      client: userData.client, entity: userData.entity, branch: userData.branch, uid: userData.uid,
    })

    if (communicationData && communicationData.primary && communicationData.primary[0]) {
      return {
        primary: communicationData.primary[0] || '',
        secondary: communicationData.secondary[0] || ''
      }
    }
    return {
      primary: '',
      secondary: ''
    }
  }

  mapToViewModel(user) {
    return {
      primary: user.address ? user.address : {},
      sameAsPrimary: user.sameAsPrimary ? user.sameAsPrimary : false,
      secondary: user.secondary ? user.secondary : {}
    };
  }

  validateProperty = (name, value) => {
    const schema = Joi.reach(Joi.object(this.schema), name)
    const { error } = Joi.validate(value, schema);
    return error ? error.details[0].message : null;
  };

  handleSameAsPrimary = (e) => {
  
    if (e.target.checked === true) {
      if (this.formApi) {
        let values = this.formApi.getState().values;
        if (values.primary) {
          values['secondary'] = values.primary
          this.formApi.setValues(values);
        }
      }
    } else {
      if (this.formApi) {
        let values = this.formApi.getState().values;
        if (values.primary) {
          values['secondary'] = {}
          this.formApi.setValues(values);
        }
      }
    }
  }

  setFormApi = (formApi) => {
    this.formApi = formApi;
  }

  onSubmit = async () => {
    const { props } = this.props
    const { client, entity, branch, uid } = this.state
    const data = this.formApi.getState().values;
    const { primary, secondary } = data
  
    let primaryfulladdress;
      primaryfulladdress = (primary.no || '') + ',' + primary.street + ',' + primary.address1 + ',' + (primary.address2 || '') + primary.city + ',' + primary.state.label + ',' + primary.pincode + '.'
    if (primary.address2)
      primaryfulladdress = (primary.no || '') + ',' + primary.street + ',' + primary.address1+ ','+ primary.city + ',' + primary.state.label + ',' + primary.pincode + '.';
    
    let secondaryfulladdress;

     secondaryfulladdress = (secondary.no || '') + ',' + secondary.street + ',' + secondary.address1 + ',' + (secondary.address2 || '') + ',' + secondary.city + ',' + secondary.state.label + ',' + secondary.pincode + '.'

     if (secondary.address2)
     secondaryfulladdress = (secondary.no || '') + ',' + secondary.street + ',' + secondary.address1+ ','+ secondary.city + ',' + secondary.state.label + ',' + secondary.pincode + '.';
 

    data.primary.displayFullAddress = primaryfulladdress
    data.secondary.displayFullAddress = secondaryfulladdress
    let params = `client=${client}&entity=${entity}&branch=${branch}&uid=${uid}`
    const result = await saveUser('communication', params, data)
    if (result.data.statusCode === 1) {
      ToastService.Toast(`Communication Details Updated Successfully`, "default")
      props.history.push(`/${client}/${entity}/${branch}/${uid}/edit/education`)
    }
    else if (result.data.statusCode === 0)
      ToastService.Toast(result.data.message, "default")
    else
      ToastService.Toast(`Failed to update Communication Details`, "default")
  }





  render() {
    return (
      <Fragment>

        <Form getApi={this.setFormApi} onSubmit={this.onSubmit}>
          {({ formApi, formState }) => (
            <Fragment>
              <section>
                <h6>Primary Address ( Permanent Address )</h6>
                <AddressComponent scope='primary' validateProperty={this.validateProperty} />
              </section>

              <section>
                <h6>Secondary Address ( Temporary Address )</h6>
                <CustomCheckBox
                  field="sameAsPrimary" checkboxLabel="Same As Primary"
                  validateOnBlur validate={e => this.validateProperty('sameAsPrimary', e)}
                  onChange={this.handleSameAsPrimary}
                />

                <AddressComponent scope='secondary' validateProperty={this.validateProperty} />

              </section>
              <div className="text-right">
                <button type="submit" className="btn btn-primary btn-sm">Save & Next</button>
              </div>
              
            </Fragment>
          )}
        </Form>
      </Fragment >
    )
  }
}

