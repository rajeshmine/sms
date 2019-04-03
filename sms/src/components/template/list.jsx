import Joi from 'joi-browser';
import _ from 'lodash';
import React, { Component } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory from 'react-bootstrap-table2-filter';
import paginationFactory from 'react-bootstrap-table2-paginator';

import { deletetemplates, SGTemplates } from '../../services/templatesService'
import ToastService from 'services/toastService'

export default class TemplateList extends Component {

  state = {
    clientIds: [], entityIds: [], branchIds: [],
  }

  async componentDidMount() {
    const { data } = this.props;

    this.setState({ data }, () => { })
    await this.initTableData()
  }

  schema = {
    branch: Joi.string().required().label("Department"),
    client: Joi.string().required().label("Client"),
    entity: Joi.string().required().label("Entity")
  };

  initTableData = async () => {
    const { hideColumns } = this.state;
    const columnHeaders = this.getColumnHeaders(this.props.prefixUrl);
    const columns = getColumns(columnHeaders, hideColumns);
    await this.setState({ columns, columnHeaders, hideColumns })
  }

  getColumnHeaders(prefixUrl = "") {
    const { pD } = this.props;
    let temptype = pD.type;
    let allKeys = ["Category", "Message", "Name","actions"];
    let excludeKeys = [];
    switch (temptype) {
      case "sms":
        excludeKeys = ["Name"];
        break;
      case "mail":
        excludeKeys = ["Category", "Message"];
        break;
      default:
        break;
    }
    let keys = _.filter(allKeys, (v) => !_.includes(excludeKeys, v))
    let def = {
      "sno": { dataField: 'sno', isDummyField: true, text: "S.No", formatter: serialNumberFormatter },
      "Name": { dataField: 'name', text: 'Name', sort: true, },
      "Category": { dataField: 'category', text: 'Category', sort: true, },
      "Message": { dataField: 'msg', text: 'Message', sort: true, },
      "actions": { dataField: 'actions', isDummyField: true, text: "Actions", formatter: this.actionsFormatter }
    }
    return { "keys": keys, "def": def }
  }

  actionsFormatter = (cell, row, rowIndex, formatExtraData) => {

    let links = []
    links.push(<div onClick={() => this.editFun(`/notification/edit/template`, row)} className='badge badge-warning'>Edit</div>)
    links.push(<div onClick={() => this.deleteTemplateTypes(row)} className='badge badge-danger'>Delete</div>)
    return <div className="actions">{links.concat(" ")}</div>
  }

  editFun = (url, tD) => {
    const { pD: { client, entity, branch, type, config } } = this.props;

    if (type === 'mail') {
      tD.client = client;
      tD.entity = entity;
      tD.branch = branch;
      tD.type = type;
      tD.config = config;
    }
    this.props.props.props.history.push({
      pathname: url,
      state: {
        tD
      }
    })
  }

  deleteTemplateTypes = async (row) => {
    const { pD: {  type, config } } = this.props;

    const { refreshTable } = this.props;
    let r, params;
    if (type === 'sms') {
      params = `client=${row.client}&entity=${row.entity}&branch=${row.branch}&id=${row._id}`
      r = await deletetemplates(params)
      if (r.data.statusCode !== 1) return ToastService.Toast(r.data.message, 'default');
      if (r.data.statusCode === 1) {
        await ToastService.Toast(r.data.message, 'default');
        refreshTable()
      }
    }
    if (type === "mail") {
      let url = `https://api.sendgrid.com/v3/templates/${row.id}`
      r = await SGTemplates(url, "DELETE", '', config)
      refreshTable()
    }
  }

  render() {
    const options = {
      paginationSize: 4,
      pageStartIndex: 1,
      sizePerPage: 100,
      alwaysShowAllBtns: true,
      hideSizePerPage: true,
      hidePageListOnlyOnePage: true,
      firstPageText: 'First',
      prePageText: 'Back',
      nextPageText: 'Next',
      lastPageText: 'Last',
      nextPageTitle: 'First page',
      prePageTitle: 'Pre page',
      firstPageTitle: 'Next page',
      lastPageTitle: 'Last page',
      showTotal: true
    };
    const { data, columns } = this.state;
    return (
      <React.Fragment >
        {data &&
          <BootstrapTable
            keyField="_id"
            data={data}
            columns={columns}
            bootstrap4
            pagination={paginationFactory(options)}
            classes="table table-bordered table-hover table-sm"
            wrapperClasses="table-responsive"
            filter={filterFactory()}
            noDataIndication={'No data to display here'}
          />
        }
      </React.Fragment>)
  }
}

function serialNumberFormatter(cell, row, rowIndex, formatExtraData) {
  return rowIndex + 1
}

function getColumns(columnsHeaders, hideColumns) {
  let columns = []
  const { keys, def } = columnsHeaders;
  _.forEach(keys, (key) => {
    columns.push({ ...def[key], hidden: _.includes(hideColumns, key) })
  })
  return columns;
}