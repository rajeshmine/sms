import { Input, CustomSelect,Textarea  } from 'components/common/forms';
import DRP1 from 'components/common/forms/date-range-picker';
import { Form } from 'informed';
import Joi from 'joi-browser';
import React, { Component, Fragment } from 'react';
import { Col, Row } from 'reactstrap';
import { getselectData} from 'services/userService';
import { scheduleInsert,getSubjectsList,updateScheduleDetails, getTermList } from 'services/scheduleService';
import moment from 'moment';
import _ from 'lodash';
import ToastService from 'services/toastService';

 
export default class AssignmentForm extends Component {
    state = {
        data: {
            client: "", entity: "", branch: "", department: "", batch: "",
        },
        clientIds: [], entityIds: [], branchIds: [], departmentIds: [], batchIds: [],
        exammode: [{ id: "online", name: "online" }, { id: "offline", name: "offline" }],
        uid: '',
        errors: {},
        isLoading: true
    };
     

    schema = {
        client: Joi.string().required().label('Client'),
        entity: Joi.string().required().label('Entity'),
        branch: Joi.string().required().label('Branch'),
        title: Joi.string().required().label('Title'),
        date: Joi.string().required().label('Date'),
        subject: Joi.string().required().label('Subject'),
        marks: Joi.string().required().label('Marks'),        
        department:Joi.string().required().label('Department'),
        batch:Joi.string().required().label('Batch'),
        description:Joi.string().optional(),
        term: Joi.string().required().label("Term"),
    }

    async componentDidMount() {
        const { data } = this.state
        const { actiontype } = this.props
        this.selectoptGet(`clients`, "clientIds")
        this.formApi.setValues(data);
        if (actiontype === "edit") {
            this.setState({ isEditForm: true });
            const { location: { state: { scheduledata } } } = this.props.props;
           
            if (scheduledata !== undefined) { }
            return this.formStateCheck(scheduledata);
          }
    }

    
  formStateCheck = async (data) => {
  
    data.description = data.desc;
    data.department = data.clients[0].departmentId;
    data.batch = data.clients[0].batchId;
    data.marks = data.assignment[0].mark
    data.startDate = data.from.date
    data.endDate = data.to.date 
    // this.setState({description:data.description,
    //   date:data.dob,staffName:data.staff,day:data.day,
    //   hour:data.hour})
     

    await this.setState({ data});
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
  
    return ToastService.Toast("Something went wrong.Please try again later", "default");
  }
 
    handleChange = async ({ currentTarget: Input }) => {
        const { name, value } = Input;
        const { data } = this.state;
        data[name] = value;
        this.setState({
          [name]: value
        },() =>{
            if(this.state.batch){
                this.getSubjects()
            }
        })
        await this.clientDatas(name);
    
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
				this.getTermsList() 

			break;
          default:
          break;
        }
      }

  async  getSubjects(){
      var subjectsArray = []
        const {client,batch,entity,department,branch} = this.state
        let params = `client=${client}&entity=${entity}&branch=${branch}&type=subject&departmentId=${department}&batchId=${batch}`
        const subjectList = await getSubjectsList(params)
         let subjects = subjectList.data.data
         for(var i=0;i<subjects.length;i++){
            subjectsArray.push({'name': subjects[i].displayName ,'code' : subjects[i].code })
         }
        
         this.setState({
             allSubjects : subjectsArray
         })
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
        this.formApi.setValues(data);
        const data1 = this.formApi.getState().values;
        await _.keys(_.map(data1.entity)).forEach((item) => {
            
        });
    }

    validateProperty = (name, value) => {
        const schema = Joi.reach(Joi.object(this.schema), name)
        const { error } = Joi.validate(value, schema);
        return error ? error.details[0].message : null;
    };

    setFormApi = (formApi) => {
        this.formApi = formApi
    }

   async getTermsList() {
		var termssArray = []
		const { data: { client, branch, entity, department, batch } } = this.state
		let params = `client=${client}&entity=${entity}&branch=${branch}&department=${department}&batch=${batch}&type=term`;
	
		try {
			const termList = await getTermList(params)

			if (termList.data.statusCode === 1) {
				let terms = termList.data.data
			
				for (var i = 0; i < terms.length; i++) {
					termssArray.push({ 'name': terms[i].title, 'code': terms[i]._id })
				}
				await this.setState({
					allTerms: termssArray
				})
			} else {
				return ToastService.Toast("No Terms Found", 'default');
			}

		} catch (err) {
			this.handleError(err);
		}
	}




    onSubmit = async () => {
        const { actiontype } = this.props
    
        const data = this.formApi.getState().values;
       
    
        const { title, description,  department, batch, entity, branch, client, marks,subject, term } = data
     
        let params = `client=${client}&entity=${entity}&branch=${branch}`
    
    
        if (actiontype === 'add') {
            let scheduleData = {
                "type": "assignment",        
                "title": title,        
                "desc": description,  
                "subject":subject,   
                "term": term,   
                "from": { "date":data.date.from},
                "to": {"date":data.date.to},
                "assignment": {	"mark":marks },        
                "clients": [	
                    {	
                        "departmentId":department,
                        "batchId":batch																
                    }
                ],
            }
       
          let res = await scheduleInsert(params, scheduleData)
        
          if (res.data.statusCode !== 1) return ToastService.Toast(res.data.message, 'default');
          if (res.data.statusCode === 1) {
            ToastService.Toast(res.data.message, 'default');
            this.props.props.history.push(`/schedule/assignment`)
            // this.resetForm();
          }
    
         
        
      }else if(actiontype === 'edit'){
    
        let scheduleCourseDatas = {
            "type": "assignment",        
            "title": title,        
            "desc": description,  
            "subject":subject, 
            "term":term,
            "from": { "date":data.from.date},
            "to": {"date":data.to.date},  
            "assignment": {	"mark":marks },          
          "clients": [
            {
              "departmentId": department,
              "batchId": batch
            }
          ]
        }

        let res = await updateScheduleDetails(params, scheduleCourseDatas)
      
        if (res.data.statusCode !== 1) return ToastService.Toast(res.data.message, 'default');
        if (res.data.statusCode === 1) {
          ToastService.Toast(res.data.message, 'default');
          this.props.props.history.push(`/schedule/assignment`)
        //   this.resetForm();
        }
      }    
    
    }



    resetForm = () => {
        this.formApi.reset()
    }

    render() {
        const { clientIds, entityIds, branchIds, departmentIds, batchIds } = this.state
        
        return (
            <Fragment>
                <h6>Schedule Assignment</h6>
                <Form getApi={this.setFormApi} onSubmit={this.onSubmit}>
                    {({ formApi, formState }) => (
                        <div>
                            <section>
                                <h6>Client Details</h6>
                                <Row>
                                    <Col sm={12} md={3}>
                                        <CustomSelect field="client" label="Client" name="client" getOptionValue={option => option.code}
                                            getOptionLabel={option => option.name} options={clientIds}
                                            validateOnBlur validate={e => this.validateProperty('client', e)} onChange={this.handleChange} />
                                    </Col>
                                    <Col sm={12} md={3}>
                                        <CustomSelect field="entity" label="Entity" name="entity" getOptionValue={option => option.code}
                                            getOptionLabel={option => option.name} options={entityIds}
                                            validateOnBlur validate={e => this.validateProperty('entity', e)} onChange={this.handleChange} />
                                    </Col>
                                    <Col sm={12} md={3}>
                                        <CustomSelect field="branch" label="Branch" name="branch" getOptionValue={option => option.code}
                                            getOptionLabel={option => option.name} options={branchIds}
                                            validateOnBlur validate={e => this.validateProperty('branch', e)} onChange={this.handleChange} />
                                    </Col>
                                    <Col sm={6} md={3}>
                                        <CustomSelect field="department" label="Department*" name="department" getOptionValue={option => option.code} getOptionLabel={option => option.name} options={departmentIds} validateOnBlur validate={e => this.validateProperty('department', e)} onChange={this.handleChange} />
                                    </Col>


                                    <Col sm={6} md={3}>
                                        <CustomSelect field="batch" label="Batch*" name="batch" getOptionValue={option => option.code} getOptionLabel= {option => option.name} options={batchIds} validateOnBlur validate={e => this.validateProperty('batch', e)} onChange={this.handleChange} />
                                    </Col>

                                    <Col sm={6} md={3}>
                                        <CustomSelect field="term" label="Terms*" name="term" getOptionValue={option => option.id} getOptionLabel={option => option.name} validateOnBlur validate={e => this.validateProperty('term', e)}
                                        options={this.state.allTerms} onChange={this.handleChange} />
                                    </Col>

                                </Row>
                            </section>
                            <section>
                            <h6>Assignment Details</h6>
                                <Row>
                                    <Col sm={12} md={3}>
                                        <Input
                                            field="title" label="Title*" name="title"
                                            validateOnBlur validate={e => this.validateProperty('title', e)}
                                        />
                                    </Col>
                                    <Col sm={12} md={4}>
                                        <label>Date</label>
                                        <DRP1 field="date" label="Date*" id="date" startDate={moment(formState.values.startDate)} endDate={moment(formState.values.endDate)} onChange={(data) => this.dateValue(data, "date")} validate={e => this.validateProperty('date', e)} />                                         
                                    </Col>
                                    <Col sm={12} md={4}>
                                        <CustomSelect field="subject" label="Subject*" name="subject" getOptionValue={option => option.code} getOptionLabel= {option => option.name} options={this.state.allSubjects} validateOnBlur validate={e => this.validateProperty('subject', e)} onChange={this.handleChange} />
                                    </Col>
                                </Row><br/>
                                <Row>
                                    <Col sm={12} md={3}>
                                        <Input
                                            field="marks" label="Marks*" name="marks"
                                            validateOnBlur validate={e => this.validateProperty('marks', e)}
                                        />
                                    </Col>
                                    <Col sm={12} md={9}>
                                        <Textarea
                                            field="description" label="Description" name="description"
                                            validateOnBlur validate={e => this.validateProperty('description', e)}
                                        />
                                    </Col>
                                </Row>
                            </section>

                            <button type="submit" className="btn btn-primary btn-sm">Submit</button>
                        </div>
                    )}
                </Form>
            </Fragment>
        );
    }
}



