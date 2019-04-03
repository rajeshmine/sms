import { config } from '../config/config';
import LoggerService from './loggerService'
import Service from './service';

export default class RestService {
  static getBaseUrl() {
    return config.baseUrl;
  }

  static handleError(err) {
    LoggerService.debug(err);
    if (err.status === 403) {
    } else if (err.status === 0) {
      LoggerService.error('Network Failure...');
    } else if (err.status === 400) {
    }
  }

  static getReq(url, headers, callback) {
    try {
      fetch(url, {
        method: 'GET',
        headers: headers,
      }).then((response) => {
        if (response.status === 200) {
          return response.json()
        } else {
          throw response;
        }
      }).then((responseData) => {
        callback(responseData);
      }).catch((err) => {
        this.handleError(err);
        callback({
          status: false,
          message: "Network failed"
        });
      })
    } catch (error) {
      callback({
        status: false,
        message: 'Something went wrong!'
      });
    }
  }

  static get(url, callback) {
    let headers = new Headers();
    headers.append("Accept", "application/json");
    Service.getStoredValue((res) => {
      if (res.isLoggedIn && res.data.access_token !== undefined) headers.append('Authorization', "Bearer " + res.data.access_token);
      url = config.baseUrl + url;
      this.getReq(url, headers, (res) => {
        callback(res)
      })
    });
  }

  static postRec(url, obj, headers, callback) {
  
    try {
      fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(obj),
      }).then((response) => {
        if (response.status === 200) {
          return response.json()
        } else {
          throw response;
        }
      }).then((responseData) => {
        callback(responseData);
      }).catch((err) => {
        this.handleError(err);
        callback({
          status: false,
          message: "Network failed"
        });
      });
    } catch (error) {
      callback({
        status: false,
        message: 'Something went wrong!'
      })
    }
  }

  static post(url, obj, callback) {
    let headers = new Headers();
    headers.append("Accept", "application/json");
    headers.append("Content-Type", "application/json");
    url = config.baseUrl + url;
    Service.getStoredValue((res) => {
      if (res.isLoggedIn && res.data.access_token !== undefined) headers.append('Authorization', "Bearer " + res.data.access_token);
      this.postRec(url, obj, headers, (res) => {
        callback(res);
      });
    });
  }

  static putReq(url, obj, headers, callback) {
    try {
      fetch(url, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(obj),
      }).then((response) => {
        if (response.status === 200) {
          return response.json()
        } else {
          throw response;
        }
      }).then((responseData) => {
        callback(responseData);
      }).catch((err) => {
        this.handleError(err);
        callback({
          status: false,
          message: "Network failed"
        });
      });
    } catch (error) {
      callback({
        status: false,
        message: 'Something went wrong!'
      })
    }
  }

  static put(url, obj, callback) {
    let headers = new Headers();
    headers.append("Accept", "application/json");
    headers.append("Content-Type", "application/json");
    Service.getStoredValue((res) => {
      if (res.isLoggedIn && res.data.access_token !== undefined) headers.append('Authorization', "Bearer " + res.data.access_token);
      url = config.baseUrl + url;
      this.putReq(url, obj, headers, (res) => {
        callback(res);
      });
    });
  }

  static deleteReq(url, obj, headers, callback) {
    try {
      fetch(url, {
        method: 'DELETE',
        headers: headers,
        body: JSON.stringify(obj),
      }).then((response) => {
        if (response.status === 200) {
          return response.json()
        } else {
          throw response;
        }
      }).then((responseData) => {
        callback(responseData);
      }).catch((err) => {
        this.handleError(err);
        callback({
          status: false,
          message: "Network failed"
        });
      });
    } catch (error) {
      callback({
        status: false,
        message: 'Something went wrong!'
      })
    }
  }

  static delete(url, obj, callback) {
    let headers = new Headers();
    headers.append("Accept", "application/json");
    headers.append("Content-Type", "application/json");
    Service.getStoredValue((res) => {
      if (res.isLoggedIn && res.data.access_token !== undefined) headers.append('Authorization', "Bearer " + res.data.access_token);
      url = config.baseUrl + url;
      this.deleteReq(url, obj, headers, (res) => {
        callback(res);
      });
    });
  }

  // Login Check
  static login(obj, callback) {
    let url = 'login';
    RestService.post(url, obj, (res) => {
      callback(res);
    });
  }

  static forgotPassword(obj, callback) {
    let url = 'forgotPassword';
    RestService.post(url, obj, (res) => {
      callback(res);
    })

  }

  static otpValidate(obj, callback) {
    let url = 'otpValidate';
    RestService.post(url, obj, (res) => {
      callback(res)
    });
  }

  static updatePassword(obj, callback) {
    let url = 'forgotPasswordUpdate';
    RestService.post(url, obj, (res) => {
      callback(res);
    });
  }


  // Client Credentials
  static createClient(obj, callback) {
    let url = 'client/new';
    RestService.post(url, obj, (res) => {
      callback(res);
    });
  }



  // static clientCreate(obj, callback) {
  //   let url = 'clientCreate';
  //   RestService.post(url, obj, (res) => {
  //     callback(res);
  //   });
  // }

  static viewClientCredentials(callback) {
    let url = "clientView";
    RestService.get(url, (res) => {
      callback(res);
    })
  }

  static getUserLists(callback) {
    let url = "clientList";
    RestService.get(url, (res) => {
      callback(res);
    })
  }

  static updateClientDetails(obj, callback) {
    let url = 'clientUpdate';
    RestService.post(url, obj, (res) => {
      callback(res);
    });
  }
  static clientDelete(obj, callback) {
    let url = 'clientDelete';
    RestService.post(url, obj, (res) => {
      callback(res);
    });
  }

  // User Management
  static userDetailsAdd(obj, callback) {
    const { client, entity, branch } = obj;
    let url = `users/login?client=${client}&branch=${branch}&entity=${entity}`;
    RestService.post(url, obj, (res) => {
      callback(res)
    });
  }

  static userDetailsUpdate(obj, callback) {
    const { client, entity, branch } = obj;
    let url = `users/login?client=${client}&branch=${branch}&entity=${entity}`;
  
    RestService.put(url, obj, (res) => {
      callback(res)
    });
  }

  static getUser(url,callback) {    
    RestService.get(url, (res) => {
      callback(res);
    })
  }

  static getClientList(callback) {
    let url = `clients`
    RestService.get(url, (res) => {
      callback(res);
    });
  }

  static getParticularType(obj, callback) {
    const { clientCode, entityCode, branchCode, type } = obj;
    let url = `settingTypes/typeName?client=${clientCode}&entity=${entityCode}&branch=${branchCode}&type=${type}`
    RestService.get(url, (res) => {
      callback(res);
    });
  }

  static organization(obj, callback) {
    const { client, entity, branch, userId } = obj.clientInfo;
    delete obj.clientInfo;
    let url = `users/organisation?client=${client}&branch=${branch}&entity=${entity}&uid=${userId}`;
    RestService.post(url, obj, (res) => {
      callback(res)
    });
  }

  static userPersonalAdd(obj, callback) {
    const { client, entity, branch, uid } = obj.clientInfo;
    delete obj.clientInfo;
    LoggerService.info(obj);
    let url = `users/personal?client=${client}&branch=${branch}&entity=${entity}&uid=${uid}`;
    RestService.post(url, obj, (res) => {
      callback(res)
    });
  }

  static userCommunicationAdd(obj, callback) {
    const { client, entity, branch, uid } = obj.clientInfo;
    delete obj.clientInfo;
    let url = `users/communication?client=${client}&entity=${entity}&branch=${branch}&uid=${uid}`;
    RestService.post(url, obj, (res) => {
      callback(res)
    });
  }

  static addEducation(obj, callback) {
    const { client, entity, branch, uid } = obj.clientInfo;
    delete obj.clientInfo;
    let url = `users/education?client=${client}&entity=${entity}&branch=${branch}&uid=${uid}`
    RestService.post(url, obj, (res) => {
    
      callback(res);
    });
  }


  static addParent(obj, callback) {
   
    const { client, entity, branch, userId } = obj.clientInfo;
    delete obj.clientInfo;
    let url = `users/parent?client=${client}&entity=${entity}&branch=${branch}&uid=${userId}`
    RestService.post(url, obj, (res) => {
      callback(res);
    });
  }


  

  static getUserDetails(callback) {
    let url = 'user';
    RestService.get(url, (res) => {
      callback(res);
    });
  }

  static deleteUserDetail(obj, callback) {
    let url = 'user';
  
    RestService.delete(url, obj, (res) => {
      callback(res)
    });
  }

  static userIdValidate(obj, callback) {
    let url = 'ValidateUserId';
    RestService.post(url, obj, (res) => {
      callback(res)
    });
  }


  // CourseDetails


  static getCourseDetails(callback) {
    let url = "course";
    RestService.get(url, (res) => {
      callback(res);
    })
  }


  static addCourseDetail(obj, callback) {
    let url = 'course';
    RestService.post(url, obj, (res) => {
      callback(res);
    });
  }


  static particularCourseDetails(obj, callback) {
    let url = 'particularCourse';
    RestService.post(url, obj, (res) => {
      callback(res);
    });
  }

  static deleteCourseDetails(obj, callback) {
    let url = 'course';
    RestService.delete(url, obj, (res) => {
      callback(res);
    })
  }

  static updateCourseDetails(obj, callback) {
    let url = 'course';
    RestService.put(url, obj, (res) => {
      callback(res);
    })
  }

  static viewCourseName(obj, callback) {
    let url = 'courseName';
    RestService.post(url, obj, (res) => {
      callback(res);
    })
  }

  static getParticularSubjects(obj, callback) {
    let url = 'courseType ';
    RestService.post(url, obj, (res) => {
      callback(res);
    })
  }

  static addLessonDetails(obj, callback) {
    let url = 'addLesson';
    RestService.post(url, obj, (res) => {
      callback(res);
    })
  }

  static deleteLessonDetails(obj, callback) {
    let url = 'addLesson';
    RestService.delete(url, obj, (res) => {
      callback(res);
    })
  }

  // Exam

  static addExam(obj, callback) {
    let url = 'addExam';
    RestService.post(url, obj, (res) => {
      callback(res)
    });
  }



  //Add Schedules 
  static schedule(obj, callback) {
    let url = "schedule";
    RestService.post(url, obj, (res) => {
      callback(res);
    })
  }

  //  Schedule Type
  static scheduleType(obj, callback) {
    let url = "scheduleType";
    RestService.post(url, obj, (res) => {
      callback(res);
    })

  }


  // Add Schedule Timetable
  static scheduleTimetable(obj, callback) {
    let url = "scheduleTimetable";
    RestService.post(url, obj, (res) => {
      callback(res);
    })
  }


  // Update Schedule 

  static updateSchedule(obj, callback) {
    let url = 'schedule';
    RestService.put(url, obj, (res) => {
      callback(res);
    })
  }

  // Delete Schedule 

  static deleteSchedule(obj, callback) {
    let url = 'schedule';
    RestService.delete(url, obj, (res) => {
      callback(res);
    })

  }

  // Schedule By Name

  static scheduleByName(obj, callback) {
    let url = "scheduleByName";
    RestService.post(url, obj, (res) => {
      callback(res);
    })
  }

  // Settings

  static addConstants(clientid, entity, branch, object, callback) {
    let url = `settingType/new?clientId=${clientid}&entity=${entity}&branch=${branch}`
    RestService.post(url, object, (res) => {
      callback(res);
    });
  }

  static viewConstants(callback) {
    let url = `constant`
    RestService.get(url, (res) => {
      callback(res);
    });
  }

  static updateConstants(object, callback) {
    let url = `constant`
    RestService.put(url, object, (res) => {
      callback(res);
    });
  }

  static deleteConstants(object, callback) {
    let url = `constant`
    RestService.delete(url, object, (res) => {
      callback(res);
    });
  }

  static getParticularConstants(object, callback) {
    let url = `particularConstant`
    RestService.post(url, object, (res) => {
      callback(res);
    });
  }

  // Institution Details







  static getCategory(callback) {
    let url = `viewCategory`
    RestService.get(url, (res) => {
      callback(res);
    });
  }

  static addClient(object, callback) {
    let url = `entity`
    RestService.post(url, object, (res) => {
      callback(res);
    });
  }

  static viewClient(callback) {
    let url = `entity`
    RestService.get(url, (res) => {
      callback(res);
    });
  }

  static updateClient(object, callback) {
    let url = `entity`
    RestService.put(url, object, (res) => {
      callback(res);
    });
  }

  static deleteClient(object, callback) {
    let url = `entity`
    RestService.delete(url, object, (res) => {
      callback(res);
    });
  }


  // Attendance_Holidays

  static addHoliday(object, callback) {
    let url = `holiday`
    RestService.post(url, object, (res) => {
      callback(res);
    });
  }

  static viewHoliday(callback) {
    let url = `holiday`
    RestService.get(url, (res) => {
      callback(res);
    });
  }

  static updateHolidayDetails(object, callback) {
    let url = `holiday`
    RestService.put(url, object, (res) => {
      callback(res);
    });
  }

  static deleteHoliday(object, callback) {
    let url = `holiday`
    RestService.delete(url, object, (res) => {
      callback(res);
    });
  }

  // Add Attendance

  static viewStudentList(object, callback) {
    let url = `Listuser`
    RestService.post(url, object, (res) => {
      callback(res);
    });
  }

  //  Assignments

  static assignmentReport(object, callback) {
    let url = `assignmentReport`
    RestService.post(url, object, (res) => {
      callback(res);
    });
  }

  static updateAssignment(object, callback) {
    let url = `assignmentReport`
    RestService.put(url, object, (res) => {
      callback(res);
    });
  }


  static deleteAssignment(object, callback) {
    let url = `assignmentReport`
    RestService.delete(url, object, (res) => {
      callback(res);
    });
  }

  static report(object, callback) {
    let url = `report`
    RestService.post(url, object, (res) => {
      callback(res);
    });
  }

  static homeworkReport(object, callback) {
    let url = `homeworkReport`
    RestService.post(url, object, (res) => {
      callback(res);
    });
  }

  static deleteHomework(object, callback) {
    let url = `homeworkReport`
    RestService.delete(url, object, (res) => {
      callback(res);
    });
  }

  // Fee
  static addFeeAllocation(obj, callback) {
    let url = "feeallocation";
    RestService.post(url, obj, (res) => {
      callback(res);
    })
  }

  static getFeeAllocation(object, callback) {
    let url = `feeallocation`
    RestService.get(url, object, (res) => {
      callback(res);
    });
  }


  static editFeeAllocation(object, callback) {
    let url = `feeallocation`
    RestService.put(url, object, (res) => {
      callback(res);
    });
  }

  static deleteFeeAllocation(object, callback) {
    let url = `feeallocation`
    RestService.delete(url, object, (res) => {
      callback(res);
    });
  }

  static getfeedetails(object, callback) {
    let url = `particularFee`
    RestService.post(url, object, (res) => {
      callback(res);
    });
  }



}


