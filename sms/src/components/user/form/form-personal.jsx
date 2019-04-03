
import Joi from 'joi-browser';
import React, { Fragment, Component } from 'react';
import { Col, Row } from 'reactstrap';
import { Form } from 'informed';
import { Input, SimpleAutoSuggest, CustomSelect, CustomRadio, SDP, PreviewImage } from 'components/common/forms';
// import { apiUrl } from './../../../config.json'

import moment from 'moment';
import { saveUser, getsuserListData } from 'services/userService';
import { getTitleList, getReligionList } from 'services/settingsService';
import ToastService from 'services/toastService'
// import { post } from 'axios';
import {FileUpload} from 'services/Fileupload'
export default class PersonalForm extends Component {
    state = {
        uid: '',
        data: {
            title: '',
            firstName: '',
            gender: '',
            dob: '',
            birthPlace: '',
            bloodGroup: '',
            motherTongue: '',
            caste: '',
            religion: '',
            aadharNo: '',
            nationality: ''
        },

        gender: ["Male", "Female", "Others"],
        religions: [{ id: "Christian", name: "Christian" }, { id: "Buddhist", name: "Buddhist" }, { id: "Hindu", name: "Hindu" }, { id: "Jewish", name: "Jewish" }, { id: "Muslim", name: "Muslim" }, { id: "Sikh", name: "Sikh" }, { id: "Others", name: "Others" }],
        bloodgroups: [{ id: "A Positive", name: "A+" }, { id: "A Negative", name: "A-" }, { id: "B Positive", name: "B+" }, { id: "B Negative", name: "B-" }, { id: "O Positive", name: "O+" }, { id: " O Negative", name: " O-" }, { id: "AB Positive", name: "AB+" }, { id: "AB Negative", name: "AB-" }]
    };

    optionSchema = {
        label: Joi.string().empty('').optional(),
        value: Joi.any().optional()
    }

    schema = {
        title: Joi.string().required().label("Title"),
        firstName: Joi.string().required().label("First Name"),
        middleName: Joi.string().empty('').optional(),
        lastName: Joi.string().required().label("Last Name"),
        gender: Joi.string().required().label("Gender"),
        dob: Joi.string().required(),
        birthPlace: Joi.string().required().label("Birth Place"),
        bloodGroup: Joi.string().required().label("Blood Group"),
        motherTongue: Joi.object(this.optionSchema).label("Mother Tongue"),
        caste: Joi.object(this.optionSchema).label("Caste"),
        religion: Joi.string().required().label("Religion"),
        aadharNo: Joi.string().required().label("Aadhar Number"),
        nationality: Joi.object(this.optionSchema).label("Nationality"),
        // profileImageUrl: Joi.string().required().label("profileImageUrl"),
        category: Joi.object(this.optionSchema).required().label("Sub Caste"),
    };

    async componentDidMount() {
        const sampleData = await this.getSampleData()
        this.formApi.setValues(sampleData);
        this.getTitles();
        this.getReligionDetails();
    }

    getSampleData = async () => {
        const { uid, data } = this.props
        let params = `usersList?uid=${uid}&type=user&client=${data.clientid}&entity=${data.entityid}&branch=${data.branch}`
        const userListData = await getsuserListData(params)
        let userData = userListData.data.data[0]

        // let basicData = (userData && userData.basic && userData.basic[0]) || ''
        let basicData = (userData && userData.basic && userData.basic[0])
        if (basicData) {
            this.setState({
                client: userData.client, entity: userData.entity, branch: userData.branch, uid: userData.uid, dob: moment((basicData && basicData.dob) || new Date()), caste: basicData.caste, motherTongue: basicData.motherTongue, nationality: basicData.nationality
            })

            return {
                "title": basicData.title || '',
                "firstName": basicData.firstName || '',
                "middleName": basicData.middleName || '',
                "lastName": basicData.lastName || '',
                "birthPlace": basicData.birthPlace || '',
                "bloodGroup": basicData.bloodGroup || '',
                "nationality": { value: basicData.nationality, label: basicData.nationality } || '',
                "motherTongue": { value: basicData.motherTongue, label: basicData.motherTongue } || '',
                "caste": { value: basicData.caste, label: basicData.caste } || '',
                "category": { value: basicData.category, label: basicData.category } || '',
                "religion": basicData.religion || '',
                "aadharNo": basicData.aadharNo || '',
                "dob": (basicData.dob) || '',
                "gender": basicData.gender || '',
                "profileImageUrl": basicData.profileImageUrl || '',
            }
        } else {
            this.setState({
                client: userData.client, entity: userData.entity, branch: userData.branch, uid: userData.uid
            })
            return {
                "title": '',
                "firstName": userData.firstName || '',
                "middleName": '',
                "lastName": '',
                "birthPlace": '',
                "bloodGroup": '',
                "nationality": '',
                "motherTongue": '',
                "caste": '',
                "category": '',
                "religion": '',
                "aadharNo": '',
                "dob": '',
                "gender": '',
                "profileImageUrl": '',
            }
        }
    }

    dateValue = (date) => {
        let selectDate = date._d.toISOString().slice(0, 10)
        this.setState({
            dob: date
        })
        const data = this.formApi.getState().values;
        data.dob = selectDate
        this.formApi.setValues(data);
    }

    validateProperty = (name, value) => {
        const schema = Joi.reach(Joi.object(this.schema), name)
        const { error } = Joi.validate(value, schema);
        return error ? error.details[0].message : null;
    };

    async getTitles() {
        var titlearr = []
        const titles = await getTitleList()
        if (titles.data.statusCode === 1) {
            let data = titles.data.data
            for (let item of data) {
                titlearr.push({ "id": item.displayName, "name": item.displayName })
            }
            await this.setState({ titles: titlearr })
        }
    }


    setFormApi = (formApi) => {
        this.formApi = formApi;
    }

    handleImage = async (e) => {
        await this.setState({ image: e.target.files[0] })
        // await this.fileUpload(this.state.image)
    }

    // fileUpload(file) {
    //     const url = `${apiUrl}/uploadfile`;
    //     const formData = new FormData();
    //     formData.append('file', file)
    //     const config = {
    //         headers: { 'content-type': 'multipart/form-data' }
    //     }
    //     return post(url, formData, config)
    // }

    async getReligionDetails() {
        let params = `religion`
        let religionList = await getReligionList(params)
        if (religionList.data.statusCode === 1) {
            await this.setState({ religionList: religionList.data.data })
        } else {
            await this.setState({ religionList: [] })
        }
    }

    onSubmit = async () => {
        const { props } = this.props
        const { image } = this.state
        const { client, entity, branch, uid } = this.state
        const data = await this.formApi.getState().values
       
        data.nationality = data.nationality.label
        data.motherTongue = data.motherTongue.label
        data.caste = data.caste.label
        data.category = data.category.label
        console.log("Personal",data)
        if (this.state.image) {
            let imgUrl = await FileUpload(image).then(res => res.data.name);
            // let imgUrl = await this.fileUpload(image).then((res) => res.data.name);
            var reader = new FileReader();
            reader.readAsDataURL(image)
            reader.onload = function (e) {
                var image = new Image();
                image.src = e.target.result;
                image.onload = function () {
                    var height = this.height;
                    var width = this.width;
                    if (height === 200 && width === 200) {
                        data.profileImageUrl = imgUrl
                       
                    } else {
                        ToastService.Toast(`Profile Image size Should not exceed 200x200`, "default")
                    }
                }
            }
        }
        console.log("Personal",data.profileimageemptychk,data)

        let params = `client=${client}&entity=${entity}&branch=${branch}&uid=${uid}`
        const res = await saveUser("personal", params, data)
        if (res.data.statusCode === 1) {
            ToastService.Toast(`Personal Details Updated Successfully`, "default")
            props.history.push(`/${client}/${entity}/${branch}/${uid}/edit/communication`)
        }
        else if (res.data.statusCode === 0)
            ToastService.Toast(res.data.message, "default")
        else
            ToastService.Toast(`Failed to update Personal details`, "default")
        
    }

    render() {
        const { dob, caste, motherTongue, nationality, category } = this.state
        const isOutsideRange = (day => {
            let dayIsBlocked = false;
            if (moment().diff(day, 'days') < 0) {
                dayIsBlocked = true;
            }
            return dayIsBlocked;
        })
        return (
            <Fragment>
                <Form getApi={this.setFormApi} onSubmit={this.onSubmit} >
                    {({ formApi, formState }) => (
                        <div>
                            <section>
                                <h6>Personal  Details</h6>
                                <Row>
                                    <Col sm={6} md={2}>
                                        <CustomSelect field="title" label="Title*" name="title" getOptionValue={option => option.id} getOptionLabel={option => option.name} options={this.state.titles} validateOnBlur validate={e => this.validateProperty('title', e)} />
                                    </Col>
                                    <Col sm={6} md={3}>
                                        <Input
                                            field="firstName" readOnly label="First Name*" name="firstName" validate={e => this.validateProperty('firstName', e)} />
                                    </Col>
                                    <Col sm={6} md={3}>
                                        <Input
                                            field="middleName" label="Middle Name" name="middleName" validate={e => this.validateProperty('middleName', e)} />
                                    </Col>
                                    <Col sm={6} md={3}>
                                        <Input
                                            field="lastName" label=" Last Name*" name="lastName" validate={e => this.validateProperty('lastName', e)} />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={6} md={4}>
                                        <CustomRadio field="gender" label="Gender*" name="gender" options={this.state.gender} validateOnBlur validate={e => this.validateProperty('gender', e)} />
                                    </Col>
                                    <Col sm={12} md={4}>
                                        <label>Date of Birth*</label>
                                        <SDP field="dob" isOutsideRange={isOutsideRange} id="dob" date={dob} validate={e => this.validateProperty('dob', e)} onChange={this.dateValue} onBlur={(e) => this.validateProperty('dob', e)} numberOfMonths={1}></SDP>
                                    </Col>
                                    <Col sm={6} md={4}>
                                        <Input field="birthPlace" label="Birth Place*" name="birthPlace" validate={e => this.validateProperty('birthPlace', e)} />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={6} md={4}>
                                        <CustomSelect field="bloodGroup" label="Blood Group*" name="bloodGroup" getOptionValue={option => option.id} getOptionLabel={option => option.name} options={this.state.bloodgroups} validateOnBlur validate={e => this.validateProperty('bloodGroup', e)} />
                                    </Col>
                                    <Col sm={6} md={4}>
                                        <SimpleAutoSuggest label="Mother Tongue*" inputProps={motherTongue} field="motherTongue" suggestType="language" getOptionValue={(option) => (option['label'])} validateOnBlur validate={e => this.validateProperty('motherTongue', e)} value={this.state.motherTongue} />

                                    </Col>
                                    <Col sm={6} md={4}>
                                        <SimpleAutoSuggest label="Caste*" field="caste" inputProps={caste} suggestType="caste" getOptionValue={(option) => (option['label'])} validateOnBlur validate={e => this.validateProperty('caste', e)} />
                                    </Col>

                                </Row>
                                <Row>
                                    <Col sm={6} md={4}>
                                        <SimpleAutoSuggest label="Sub Caste*" field="category" inputProps={category} suggestType="subcaste" getOptionValue={(option) => (option['label'])} validateOnBlur validate={e => this.validateProperty('category', e)} />
                                    </Col>
                                    <Col sm={6} md={4}>
                                        <CustomSelect field="religion" label="Religion*" name="religion" getOptionValue={option => option.code} getOptionLabel={option => option.displayName} options={this.state.religionList} validateOnBlur validate={e => this.validateProperty('religion', e)} />
                                    </Col>

                                    <Col sm={6} md={4}>
                                        <Input field="aadharNo" label="Aadhar Number*" name="aadharNo" validate={e => this.validateProperty('aadharNo', e)} />
                                    </Col>
                                    <Col sm={6} md={4}>
                                        <SimpleAutoSuggest label="Nationality*" inputProps={nationality} field="nationality" suggestType="nationality" getOptionValue={(option) => (option.label)} validateOnBlur validate={e => this.validateProperty('nationality', e)} />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={12} md={6}>
                                        <Input
                                            field="profileImageUrl" label="Profile Image URL*"
                                        />
                                        <PreviewImage
                                            src={formState.values.profileImage}
                                            sizes={[["sm", "Tables"], ["md", "Logo"], ["lg", "Login"]]}
                                        />
                                    </Col>
                                    <Col sm={12} md={1}> <p>(OR)</p></Col>
                                    <Col sm={12} md={3}>
                                        <Input
                                            field="profileImage" type="file" label="Profile Image*" name="profileImage"
                                            onChange={this.handleImage}
                                        />
                                    </Col>
                                </Row>
                            </section>
                            <div className="text-right">
                                <button type="submit" className="btn btn-primary btn-sm">Save & Next</button>
                            </div>

                        </div>
                    )}
                </Form>
            </Fragment >
        )
    }
}


