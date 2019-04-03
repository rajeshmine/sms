import 'styles/user-form.scss';
import React, { Component, Fragment } from 'react';
import { Form } from 'informed';
import { Col, Row } from 'reactstrap';
import { CustomSelect, } from 'components/common/forms';
// import { getParticularType } from '../../services/settingsService'
import AttendanceList from 'components/attendance/list'
import Joi from 'joi-browser';
import { getselectData } from 'services/userService'
import { getAttendancemonthReport } from 'services/attendanceService';
import { getSubjectsList } from 'services/scheduleService';
import ToastService from 'services/toastService'
import ReportList from 'components/reports/list'
import _ from 'lodash';
export default class AttendanceReport extends Component {
	state = {

		parentData: [],
		prefixUrl: "",
		isPageLoading: false,
		isLoading: false,
		isTable: false,
		clientIds: [], entityIds: [], branchIds: [],
		data: {
			department: '',
			batch: '',
			client: '',
			entity: '',
			branch: '',
			homeworks: '',
			subject: ''
		},
		months: [{ id: "1", name: "January" }, { id: "2", name: "February" }, { id: "3", name: "March" }, { id: "4", name: "April" }, { id: "5", name: "May" }, { id: "6", name: "June" }, { id: "7", name: "July" }, { id: "8", name: "August" }, { id: "9", name: "September" }, { id: "10", name: "October" }, { id: "11", name: "November" }, { id: "12", name: "December" }],
		years: [{ id: "2017", name: "2017" }, { id: "2018", name: "2018" }, { id: "2019", name: "2019" }],
		isClient: true, isEntity: true, isBranch: true, isDepartment: true, isBatch: true

	}

	async componentWillMount() {
		await this.props.props.isPageLoadingTrue();
	}

	async componentDidMount() {
		await this.selectoptGet(`clients`, "clientIds")
		await this.feildCheck();
		await this.props.props.isPageLoadingFalse();

	}

	async componentWillReceiveProps(props) {
		//	await this.init(props, false)
	}

	feildCheck = async () => {
		let { session: { data: sessionData } } = this.props.props;
		const { data } = this.state
		const { userType, userLevel, client, entity, branch, department, batch, code, branchId, departmentId, batchId, uid, studentId } = sessionData;
		data['uid'] = uid;
		data['studentId'] = studentId;
		data['userType'] = userType;
		data['userLevel'] = userLevel;
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
				await this.clientDatas('batch');

				await this.formApi.setValues(data);
				break;
		}
	}
	async init(props, isPageLoading = false) {
		//  const { uid, eventformType } = props.match.params
	}



	async selectoptGet(url, type) {
		const data = await getselectData(url)
		if (data.data.statusCode === 1) {
			const Datas = data.data.data
			this.setState({ [type]: Datas });
		}
	}

	validateProperty = (name, value) => {
		const schema = Joi.reach(Joi.object(this.schema), name)
		const { error } = Joi.validate(value, schema);
		return error ? error.details[0].message : null;
	};

	schema = {
		department: Joi.string().required().label("Department"),
		client: Joi.string().required().label("Client"),
		entity: Joi.string().required().label("Entity"),
		branch: Joi.string().required().label("Branch"),
		batch: Joi.string().required().label("Batch"),
		subject: Joi.string().required().label("Subject"),
		month: Joi.string().required().label("Month"),
		year: Joi.string().required().label("Year")
	};

	dateValue = (date) => {
		let selectDate = date._d.toISOString().slice(0, 10)
		this.setState({
			dob: date
		}, () => {

		})
		const data = this.formApi.getState().values;
		data.dob = selectDate
		this.formApi.setValues(data);
	}

	handleChange = async ({ currentTarget: Input }) => {
		const { name, value } = Input;
		const { data } = this.state;
		data[name] = value;
		await this.setState({
			[name]: value
		})
		await this.clientDatas(name);

	}


	clientDatas = async (name) => {
		const { data } = this.state;
		switch (name) {
			case "client":
				this.selectoptGet(`namelist?client=${data.client}&type=client`, "entityIds")
				await this.setState({ entity: "", branch: "", department: "", batch: "", branchIds: [], departmentIds: [], batchIds: [], isTable: false })
				break;
			case "entity":
				this.selectoptGet(`namelist?client=${data.client}&type=entity&entity=${data.entity}`, "branchIds")
				await this.setState({ branch: "", department: "", batch: "", departmentIds: [], batchIds: [], isTable: false })
				break;
			case "branch":
				this.selectoptGet(`namelist?client=${data.client}&type=branch&entity=${data.entity}&branch=${data.branch}`, "departmentIds")
				await this.setState({ department: "", batch: "", batchIds: [], isTable: false })
				break;
			case "department":
				this.selectoptGet(`namelist?client=${data.client}&type=department&entity=${data.entity}&branch=${data.branch}&department=${data.department}`, "batchIds")
				await this.setState({ batch: "", isTable: false })
				break;
			case "batch":
				await this.getSubjects()
				await this.setState({ isTable: false })
				break;
			case "year":
				await this.setState({ isTable: false })
				break;
			case "subject":
				await this.setState({ isTable: false })
				break;
			case "month":
				await this.setState({ isTable: false })
				break;
			default:
				break;
		}
	}
	async  getSubjects() {
		var subjectsArray = []
		const { data: { client, batch, entity, department, branch } } = this.state
		let params = `client=${client}&entity=${entity}&branch=${branch}&type=subject&departmentId=${department}&batchId=${batch}`
		try {
			const subjectList = await getSubjectsList(params)

			if (subjectList.data.statusCode === 1) {
				let subjects = subjectList.data.data
				for (var i = 0; i < subjects.length; i++) {
					subjectsArray.push({ 'name': subjects[i].displayName, 'code': subjects[i].code })
				}
				this.setState({
					allSubjects: subjectsArray
				})
			} else {
				ToastService.Toast("Subjects not found", "default");
				this.setState({
					allSubjects: []
				})
			}

		} catch (err) {
			this.handleError(err);
		}
	}

	handleError(...err) {
		return ToastService.Toast("Something went Wrong.Please try again later", 'default');
	}




	handleSubmit = async () => {
		const { type } = this.props;
		if (type === 'attendance') {
			const formdata = this.formApi.getState().values;
			const { client, entity, month, department, year, branch, uid, studentId, userType, } = formdata;
			let finalData = [], params;
			params = `attendance/report?client=${client}&entity=${entity}&branch=${branch}&department=${department}&month=${month}&year=${year}`;
			if (userType === "student")
				params = `studentAttendance?client=${client}&entity=${entity}&branch=${branch}&department=${department}&month=${month}&year=${year}&uid=${uid}&type=report`;
			if (userType === "parent")
				params = `studentAttendance?client=${client}&entity=${entity}&branch=${branch}&department=${department}&month=${month}&year=${year}&uid=${studentId}&type=report`;

			const attendancestatus = await getAttendancemonthReport(params);

			if (attendancestatus.data.statusCode === 1) {
				let attendata = attendancestatus.data.data;
				await attendata.forEach((a, i) => {
					let attendance = {};
					let attendanceReport = a.attendanceReport;
					attendanceReport.forEach(day => {
						let date = day[month] && day[month].date;
						if (date) {
							attendance[date] = day[month];
							attendance.name = a.name;
							attendance.studentId = a.studentId;
						}
					})
					finalData.push(attendance);
				})
				if (finalData.length > 0){
					finalData = _.filter(finalData,v => _.keys(v).length !== 0);
					await this.setState({ attendata: finalData, isTable: true })
				}
				else{
					await this.setState({ attendata: [], isTable: true })
				}

			} else {
				await this.setState({ attendata: [], isTable: true })
			}
		}
	}

	setFormApi = (formApi) => {
		this.formApi = formApi;
	}

	renderReportsForm(type, data) {
		const formdata = this.formApi.getState().values
		const { rightsData } = this.props;
		return <ReportList type={type} data={data} rightsData={rightsData} formdata={formdata} />

	}


	renderAttendanceList(data, client, entity, branch, department, batch, homeworks) {

		let details = {
			client, entity, branch, department, batch, homeworks
		}

		return <AttendanceList data={data} props={this.props} details={details} />
	}
	render() {
		const { type } = this.props;
		const { clientIds, entityIds, branchIds, departmentIds, batchIds, attendata, isTable, isClient, isEntity, isBranch, isDepartment, isBatch
		} = this.state;

		return (
			<Fragment>
				<Form getApi={this.setFormApi} onSubmit={this.handleSubmit}  >
					{({ formApi, formState }) => (
						<div>
							<h6> {type} Report</h6>
							<section>
								<Row>
									{isClient && <Col sm={6} md={3}>
										<CustomSelect field="client" label="Client*" name="client" getOptionValue={option => option.code} getOptionLabel={option => option.name} validateOnBlur validate={e => this.validateProperty('client', e)} onChange={this.handleChange} options={clientIds} />
									</Col>}
									{isEntity && <Col sm={6} md={3}>
										<CustomSelect field="entity" label="Entity*" name="entity" getOptionValue={option => option.code} getOptionLabel={option => option.name} validateOnBlur validate={e => this.validateProperty('entity', e)} onChange={this.handleChange} options={entityIds} />
									</Col>}
									{isBranch && <Col sm={6} md={3}>
										<CustomSelect field="branch" label="Branch*" name="branch" getOptionValue={option => option.code} getOptionLabel={option => option.name} validateOnBlur validate={e => this.validateProperty('branch', e)} onChange={this.handleChange} options={branchIds} />
									</Col>}
									{isDepartment && <Col sm={6} md={3}>
										<CustomSelect field="department" label="Department*" name="department" getOptionValue={option => option.code} getOptionLabel={option => option.name} options={departmentIds} validateOnBlur validate={e => this.validateProperty('department', e)} onChange={this.handleChange} />
									</Col>}
									{isBatch && <Col sm={6} md={3}>
										<CustomSelect field="batch" label="Batch*" name="batch" getOptionValue={option => option.code} getOptionLabel={option => option.name} options={batchIds} validateOnBlur validate={e => this.validateProperty('batch', e)} onChange={this.handleChange} />
									</Col>}
									<Col sm={6} md={3}>
										<CustomSelect field="month" label="Attendance Month*" name="month" getOptionValue={option => option.id} getOptionLabel={option => option.name} options={this.state.months} validateOnBlur validate={e => this.validateProperty('month', e)} onChange={this.handleChange} />
									</Col>
									<Col sm={6} md={3}>
										<CustomSelect field="subject" label="Subject*" name="subject" getOptionValue={option => option.code} getOptionLabel={option => option.name} options={this.state.allSubjects} validateOnBlur validate={e => this.validateProperty('subject', e)} onChange={this.handleChange} />

									</Col>
									<Col sm={6} md={3}>
										<CustomSelect field="year" label="Year*" name="year" getOptionValue={option => option.code} getOptionLabel={option => option.name} options={this.state.years} validateOnBlur validate={e => this.validateProperty('year', e)} onChange={this.handleChange} />
									</Col>
								</Row>
							</section>
							<div class="text-right">
								<button type="submit" className="btn btn-primary btn-sm">Submit</button>
							</div>
						</div>
					)}
				</Form>
				{
					isTable &&
					this.renderReportsForm(type, attendata)
				}

			</Fragment>
		);
	}
}

