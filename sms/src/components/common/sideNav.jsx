import React from 'react';
import { Navbar, Nav, NavItem } from 'reactstrap';
import { NavLink } from 'react-router-dom';
import _ from 'lodash'
import * as FAIcons from 'react-icons/fa';
import { getRoles } from 'services/rolesService';

class SideNav extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      RightsList: [],
    };
  }

  componentWillReceiveProps() {

  }
  async componentDidMount() {
    this.menuFormation();
  }



  menuFormation = async () => {
    const { session: { data: { userType } }, session } = this.props.props;
    let list = {}
    let RightsList = {};

    list = {
      "dashboard": { "url": "/dashboard", "icon": <FAIcons.FaLayerGroup />, "text": "Dashboard", "userTypes": ["sadmin", "client", "entity", "student", "staff"], "level": ["client"] },
      "clients": { "url": "/client/list", "icon": <FAIcons.FaUsers />, "text": "Clients", "userTypes": ["sadmin"], "level": ["client"] },
      "setting": { "url": "/settings/department", "icon": <FAIcons.FaCogs />, "text": "Settings", "userTypes": ["sadmin", "admin"], "level": ["client"] },
      "course": { "url": "/course/subject-list", "icon": <FAIcons.FaFileAlt />, "text": "Course", "userTypes": ["sadmin", "admin"], "level": ["client"] },

      "user": { "url": "/users", "icon": <FAIcons.FaUser />, "text": "Users", "userTypes": ["sadmin", "client", "entity"], "level": ["client"] },
      "schedule": { "url": "/schedule/exam", "icon": <FAIcons.FaHourglassHalf />, "text": "Schedule", "userTypes": ["sadmin", "admin"], "level": ["client"] },
      "exam": { "url": "/exam/onlineExam", "icon": <FAIcons.FaBookReader />, "text": "Exam", "userTypes": ["sadmin", "admin"], "level": ["client"] },
      "event": { "url": "/event/addAttendees", "icon": <FAIcons.FaBusinessTime />, "text": "Event", "userTypes": ["sadmin", "admin"], "level": ["client"] },
      "attendance": { "url": "/attendance/attendance", "icon": <FAIcons.FaListAlt />, "text": "Attendance", "userTypes": ["sadmin", "admin"], "level": ["client"] },

      "assignment": { "url": "/assignments/assignment", "icon": <FAIcons.FaClipboardList />, "text": "Assignment", "userTypes": ["sadmin", "admin"], "level": ["client"] },

      "timetable": { "url": "/timetable/exam", "icon": <FAIcons.FaCalendarAlt />, "text": "Time Table", "userTypes": ["sadmin", "admin"], "level": ["client"] },

      "fee": { "url": "/fees/feeallocation", "icon": <FAIcons.FaDollarSign />, "text": "Fees", "userTypes": ["sadmin", "admin"], "level": ["client"] },

      "grade": { "url": "/grade/grade", "icon": <FAIcons.FaPercent />, "text": "GradeSettings", "userTypes": ["sadmin", "admin"], "level": ["client"] },
      "mark": { "url": "/mark/gpa", "icon": <FAIcons.FaJournalWhills />, "text": "Exam Marks", "userTypes": ["sadmin", "admin"], "level": ["client"] },
      "leave": { "url": "/leave/leave", "icon": <FAIcons.FaFileSignature />, "text": "Leave", "userTypes": ["sadmin", "admin"], "level": ["client"] },

      "roles": { "url": "/roles", "icon": <FAIcons.FaAward />, "text": "Roles", "userTypes": ["sadmin", "admin"], "level": ["client"] },

      "credentials": { "url": "/credentials/sms", "icon": <FAIcons.FaUsersCog />, "text": "Client Credentials", "userTypes": ["sadmin", "admin"], "level": ["client"] },
      "notification": { "url": "/notification/sms", "icon": <FAIcons.FaBell />, "text": "Notification", "userTypes": ["sadmin"], "level": ["client"] },
      "report": { "url": "/reports/attendance", "icon": <FAIcons.FaPoll />, "text": "Reports", "userTypes": ["sadmin"], "level": ["client"] }

    };
    if (userType === 'sadmin') {
      RightsList = list
    }
    if (userType === 'client' || userType === 'entity') {
      delete list.clients
      RightsList = list
    }

    else {

      await this.Rights(session);
      const { userRights } = this.state;
      _.forEach(userRights, (r, key) => {
        RightsList[r] = list[r];
      });
    }
    // list = _.filter(list, v => _.includes(v.userTypes, userType));
    await this.setState({ RightsList });
  }

  Rights = async (session) => {
    let rightsArr = ["clients", "setting", "user", "schedule", "roles", "timetable", "attendance", "fee", "leave", "exam", "course", "event", "report", "credentials", "notification", "grade"];
    let filterArr = ["dashboard"];
    if (session && session.data) {
      let res = await getRoles(`client=${session.data.client}&entity=${session.data.entity}&branch=${session.data.branch}&type=${session.data.roles}`);

      if (res && res.data.statusCode === 1) {
        let rightsData = res.data.data[0];
        _.map(rightsArr, (m, key) => {
          _.map(rightsData[m], (s, key) => {
            _.map(_.keys(s), (a, key) => {
              if (s[a].value) return filterArr.push(m);
            });
          });
        });
        filterArr = await _.uniq(filterArr)
        await this.setState({
          userRights: filterArr
        })
      }
    }
  }


  render() {
    const { RightsList } = this.state;
    return (
      <Navbar className="sidemenu" >
        {RightsList &&
          <Nav navbar>
            {_.map(_.keys(RightsList), (item, i) =>
              <NavItem key={i}>
                <NavLink to={RightsList[item].url} className="nav-link">{RightsList[item].icon} {RightsList[item].text}</NavLink>
              </NavItem>
            )}
          </Nav>
        }
      </Navbar>
    )
  }
}
export default SideNav;