import "styles/user-form.scss";
import React, { Component, Fragment } from "react";

import Header from "components/common/header";
import Loading from "components/common/loading";
import SideNav from "components/common/sideNav";
import { Form } from "informed";
import { CustomSelect } from "components/common/forms";
import Joi from "joi-browser";
import { Breadcrumb, BreadcrumbItem, Container, Row, Col } from "reactstrap";
import { NavLink } from "react-router-dom";

import { getselectData } from "services/userService";
import { getRoles } from "services/rolesService";
import RolesList from "./list";
import { rightsData } from "services/rolesService";
import _ from "lodash";

export default class Roles extends Component {
  state = {
    isPageLoading: false,
    isLoading: false,
    clientIds: [],
    entityIds: [],
    branchIds: [],
    data: {
      department: "",
      batch: "",
      client: "",
      entity: "",
      branch: "",
      homeworks: "",
      subject: ""
    },
    isClient: true,
    isEntity: true,
    isBranch: true,
    isDepartment: true,
    isBatch: true
  };

  async componentWillMount() {
    await this.props.isPageLoadingTrue();
  }

  async componentDidMount() {
    const { session } = this.props;
    await this.rightsData(session);
    await this.init(this.props, true);
    await this.selectoptGet(`clients`, "clientIds");
    const { data } = this.state;
    await this.formApi.setValues(data);
    await this.feildCheck();
    await this.props.isPageLoadingFalse();
  }

  async componentWillReceiveProps(props) {
    await this.init(props, false);
  }

  async init(props, isPageLoading = false) {}

  setFormApi = formApi => {
    this.formApi = formApi;
  };

  rightsData = async session => {
    let res = await rightsData("roles", session);

    let excludeModules = [];
    await _.map(_.keys(res), async v => {
      await _.map(_.keys(res[v]), k => {
        if (res[v][k]["value"]) return excludeModules.push(v.toLowerCase());
      });
    });

    await this.setState({ excludeModules, rightsData: res || {} });
  };

  feildCheck = async () => {
    let {
      session: { data: sessionData }
    } = this.props;
    const { data } = this.state;
    const {
      userType,
      userLevel,
      client,
      entity,
      branch,
      code,
      branchId
    } = sessionData;
    let switchType = "";
    if (userType === "staff") switchType = userLevel;
    else switchType = userType;

    switch (switchType) {
      case "sadmin":
        break;
      case "client":
        data["client"] = client;
        await this.setState({ data, isClient: false });
        await this.clientDatas("client");
        await this.formApi.setValues(data);
        break;
      case "entity":
      case "branch":
        data["client"] = client || code;
        data["entity"] = entity || code;
        data["branch"] = branch || branchId;
        await this.setState({
          data,
          isClient: false,
          isEntity: false,
          isBranch: false
        });
        await this.clientDatas("client");
        await this.clientDatas("entity");
        await this.clientDatas("branch");
        await this.formApi.setValues(data);
        await this.onSubmit();
        break;
      case "department":
        data["client"] = client || code;
        data["entity"] = entity || code;
        data["branch"] = branch || branchId;

        await this.setState({
          data,
          isClient: false,
          isEntity: false,
          isBranch: false,
          isDepartment: false
        });
        await this.clientDatas("client");
        await this.clientDatas("entity");
        await this.clientDatas("branch");

        await this.formApi.setValues(data);
        await this.onSubmit();
        break;
      default:
        data["client"] = client || code;
        data["entity"] = entity || code;
        data["branch"] = branch || branchId;

        await this.setState({
          data,
          isClient: false,
          isEntity: false,
          isBranch: false,
          isDepartment: false,
          isBatch: false
        });
        await this.formApi.setValues(data);
        await this.onSubmit();
        break;
    }
  };

  setFormApi = formApi => {
    this.formApi = formApi;
  };

  

  async selectoptGet(url, type) {
    const data = await getselectData(url);
    if (data.data.statusCode === 1) {
      const Datas = data.data.data;
      this.setState({ [type]: Datas });
    }
  }

  validateProperty = (name, value) => {
    const schema = Joi.reach(Joi.object(this.schema), name);
    const { error } = Joi.validate(value, schema);
    return error ? error.details[0].message : null;
  };

  schema = {
    branch: Joi.string()
      .required()
      .label("Branch"),
    client: Joi.string()
      .required()
      .label("Client"),
    entity: Joi.string()
      .required()
      .label("Entity")
  };

  handleChange = async ({ currentTarget: Input }) => {
    const { name, value } = Input;
    const { data } = this.state;
    data[name] = value;
    await this.setState({
      [name]: value
    });
    await this.clientDatas(name);
  };

  clientDatas = async name => {
    const { data } = this.state;
    switch (name) {
      case "client":
        this.selectoptGet(
          `namelist?client=${data.client}&type=client`,
          "entityIds"
        );
        await this.setState({
          entity: "",
          branch: "",
          department: "",
          batch: "",
          branchIds: [],
          departmentIds: [],
          batchIds: []
        });
        break;
      case "entity":
        this.selectoptGet(
          `namelist?client=${data.client}&type=entity&entity=${data.entity}`,
          "branchIds"
        );
        await this.setState({
          branch: "",
          department: "",
          batch: "",
          departmentIds: [],
          batchIds: []
        });
        break;
      case "branch":
        this.selectoptGet(
          `namelist?client=${data.client}&type=branch&entity=${
            data.entity
          }&branch=${data.branch}`,
          "departmentIds"
        );
        await this.setState({ department: "", batch: "", batchIds: [] });
        break;
      case "department":
        this.selectoptGet(
          `namelist?client=${data.client}&type=department&entity=${
            data.entity
          }&branch=${data.branch}&department=${data.department}`,
          "batchIds"
        );
        await this.setState({ batch: "" });
        break;
      case "batch":
        this.getStudentList();
        break;
      default:
        break;
    }
  };

  onSubmit = async () => {
    let formdata = this.formApi.getState().values;
    const { client, entity, branch } = formdata;
    let params = `entity=${entity}&client=${client}&branch=${branch}`;
    const roleDetails = await getRoles(params);
    if (roleDetails.data.statusCode === 1) {
      await this.setState({
        roles: roleDetails.data.data
      });
    }
  };

  renderRolesForm(data) {
    const { rightsData } = this.state;
    return <RolesList data={data} props={this.props} rightsData={rightsData} />;
  }

  render() {
    const {
      isPageLoading,
      isLoading,
      clientIds,
      entityIds,
      branchIds,
      
      roles,
      rightsData,
     
      isClient,
      isEntity,
      isBranch,
     
    } = this.state;
    const { session } = this.props;
    let _form = "Role";
    return (
      <Fragment>
        {session && (
          <div className="row no-gutters bg-white page-user">
            <Header props={this.props} />
            <div className="col-3 col-md-2">
              <SideNav props={this.props} />
            </div>
            <div className="col-9 col-md-10 p-3 content">
              {isPageLoading && <Loading />}
              {!isPageLoading && !isLoading && (
                <Fragment>
                  <Breadcrumb>
                    <BreadcrumbItem>
                      <NavLink to="/dashboard">Dashboard</NavLink>
                    </BreadcrumbItem>

                    <BreadcrumbItem active>Roles </BreadcrumbItem>
                  </Breadcrumb>
                  <Container fluid>
                    <div className="text-right">
                      {rightsData &&
                        rightsData[_form] &&
                        rightsData[_form].create.value && (
                          <NavLink
                            to="/roles/add"
                            className="btn btn-primary btn-sm"
                          >
                            + Add Roles
                          </NavLink>
                        )}
                    </div>
                    <h6>Roles List</h6>
                    {isBranch && (
                      <Form getApi={this.setFormApi} onSubmit={this.onSubmit}>
                        {({ formApi, formState }) => (
                          <div>
                            <section>
                              <Row>
                                {isClient && (
                                  <Col sm={6} md={3}>
                                    <CustomSelect
                                      field="client"
                                      label="Client*"
                                      name="client"
                                      getOptionValue={option => option.code}
                                      getOptionLabel={option => option.name}
                                      validateOnBlur
                                      validate={e =>
                                        this.validateProperty("client", e)
                                      }
                                      onChange={this.handleChange}
                                      options={clientIds}
                                    />
                                  </Col>
                                )}
                                {isEntity && (
                                  <Col sm={6} md={3}>
                                    <CustomSelect
                                      field="entity"
                                      label="Entity*"
                                      name="entity"
                                      getOptionValue={option => option.code}
                                      getOptionLabel={option => option.name}
                                      validateOnBlur
                                      validate={e =>
                                        this.validateProperty("entity", e)
                                      }
                                      onChange={this.handleChange}
                                      options={entityIds}
                                    />
                                  </Col>
                                )}
                                {isBranch && (
                                  <Col sm={6} md={3}>
                                    <CustomSelect
                                      field="branch"
                                      label="Branch*"
                                      name="branch"
                                      getOptionValue={option => option.code}
                                      getOptionLabel={option => option.name}
                                      validateOnBlur
                                      validate={e =>
                                        this.validateProperty("branch", e)
                                      }
                                      onChange={this.handleChange}
                                      options={branchIds}
                                    />
                                  </Col>
                                )}{" "}
                                <Col
                                  sm={6}
                                  md={3}
                                  style={{
                                    textAlign: "center",
                                    marginTop: "23px"
                                  }}
                                >
                                  <button
                                    type="submit"
                                    className="btn btn-primary btn-sm"
                                  >
                                    Submit
                                  </button>
                                </Col>
                              </Row>
                            </section>
                          </div>
                        )}
                      </Form>
                    )}
                    {roles && rightsData && this.renderRolesForm(roles)}
                  </Container>
                </Fragment>
              )}
            </div>
          </div>
        )}
      </Fragment>
    );
  }
}
