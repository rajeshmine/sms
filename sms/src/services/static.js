export default class Static {
  static getUserTypes(sessionUser = {
    userType: "admin"
  }) {

    let types = []
    switch (sessionUser.userType) {
      case "superAdmin":
        types.push({
          "name": "Super Admin",
          "_id": "superAdmin"
        });
        types.push({
          "name": "Admin",
          "_id": "admin"
        });
        break;
      default:
        break;
    }
    types.push({
      "name": "Staff",
      "_id": "staff"
    });
    types.push({
      "name": "Student",
      "_id": "student"
    });
    return types;
  }

  static examTypes() {
    const keys = {
      offlineExam: {
        label: "OfflineExam",
        icon: ""
      },
      onlineExam: {
        label: "OnlineExam",
        icon: ""
      },

    }
    const order = [
      "offlineExam", "onlineExam"
    ]
    return {
      keys,
      order
    }
  }

  static userFormTypes() {
    const keys = {
      login: {
        label: "Login",
        icon: ""
      },
      personal: {
        label: "Personal",
        icon: ""
      },
      communication: {
        label: "Communication",
        icon: ""
      },
      education: {
        label: "Education",
        icon: ""
      },
      organization: {
        label: "Organization",
        icon: ""
      },
      parent: {
        label: "Parent",
        icon: ""
      },
      other: {
        label: "Other",
        icon: ""
      }
    }
    const order = [
      "login", "personal", "communication", "education", "organization", "parent", "other"
    ]
    return {
      keys,
      order
    }
  }

  static crendentialsFormTypes() {
    const keys = {
      mail: {
        label: "Mail",
        icon: ""
      },
      sms: {
        label: "SMS",
        icon: ""
      },
    }
    const order = [
      "mail", "sms"
    ]
    return {
      keys,
      order
    }
  }

  static assignmentFormTypes() {
    const keys = {
      assignment: {
        label: "Assignment",
        icon: ""
      },
      homework: {
        label: "Home Work",
        icon: ""
      },

    }
    const order = [
      "assignment", "homework",
    ]
    return {
      keys,
      order
    }
  }



  static examFormTypes() {
    const keys = {
      Exam: {
        label: "Exam",
        icon: ""
      },

    }
    const order = [
      "Exam"
    ]
    return {
      keys,
      order
    }
  }

  static scheduleFormTypes() {
    const keys = {
      exam: {
        label: "Exam",
        icon: ""
      },
      event: {
        label: "Event",
        icon: ""
      },
      attendance: {
        label: "Attendance",
        icon: ""
      },
      assignment: {
        label: "Assignment",
        icon: ""
      },
      timetable: {
        label: "Time Table",
        icon: ""
      },
      homework: {
        label: "Home Work",
        icon: ""
      },
      course: {
        label: "Course",
        icon: ""
      },
      term: {
        label: "Term",
        icon: ""
      }
    }
    const order = [
      "exam", "event", "attendance", "assignment", "timetable", "homework", "course", "term"
    ]
    return {
      keys,
      order
    }
  }

  static timetableFormTypes() {
    const keys = {
      Exam: {
        label: "Exam",
        icon: ""
      },
      Class: {
        label: "Class",
        icon: ""
      },
      Staff: {
        label: "Staff",
        icon: ""
      },
      WorkAllocation: {
        label: "WorkAllocation",
        icon: ""
      },
    }
    const order = [
      "Exam",
      "Class",
      "Staff",
      "WorkAllocation"
    ]
    return {
      keys,
      order
    }
  }



  static eventFormTypes() {
    const keys = {
      addAttendees: {
        label: "Add Attendees",
        icon: ""
      },
      gallery: {
        label: "Gallery",
        icon: ""
      },
    }
    const order = [
      "addAttendees", "gallery",
    ]
    return {
      keys,
      order
    }
  }

  static feesFormTypes() {
    const keys = {
      feeallocation: {
        label: "FeeAllocation",
        icon: ""
      },
      feecollection: {
        label: "FeeCollection",
        icon: ""
      },
    }
    const order = [
      "feeallocation", "feecollection"
    ]
    return {
      keys,
      order
    }
  }

  static courseFormTypes() {
    const keys = {
      subject: {
        label: "Subject",
        icon: ""
      },
      syllabus: {
        label: "Syllabus",
        icon: ""
      },
      externalcourse: {
        label: "ExternalCourse",
        icon: ""
      },
    }
    const order = [
      "subject", "syllabus", "externalcourse"
    ]
    return {
      keys,
      order
    }
  }


  static settingsFormTypes() {
    const keys = {
      batch: {
        label: "Batch ",
        icon: ""
      },
      boardtype: {
        label: "Board Type ",
        icon: ""
      },
      caste: {
        label: "Caste ",
        icon: ""
      },
      subcaste: {
        label: "Sub caste",
        icon: ""
      },
      department: {
        label: "Department ",
        icon: ""
      },
      state: {
        label: "State ",
        icon: ""
      },
      language: {
        label: "Language ",
        icon: ""
      },
      religion: {
        label: "Religion ",
        icon: ""
      },
      title: {
        label: "Title ",
        icon: ""
      },


    }
    const order = [
      "department", "batch", "caste", "subcaste", "boardtype", "language", "religion", "state", "title"
    ]
    return {
      keys,
      order
    }
  }

  //  Grade And cce options
  static CCEOptions() {
    const keys = {
      "grade": {
        label: "Grade",
        icon: ""
      },
      "skills": {
        label: "Skills",
        icon: ""
      },
      "assessmentWeitage": {
        label: "Assessment Weightage",
        icon: ""
      },
      "subjectWeitage": {
        label: "Subject Weightage",
        icon: ""
      },
    }
    const order = ["grade", "skills", "assessmentWeitage", "subjectWeitage"]
    return {
      keys,
      order
    }
  }

  static notificationsFormTypes() {
    const keys = {
      sms: {
        label: "Sms ",
        icon: ""
      },
      mail: {
        label: "Mail ",
        icon: ""
      },
      circular: {
        label: "Circular  ",
        icon: ""
      },
      template: {
        label: "Template",
        icon: ""
      },
    }
    const order = [
      "sms", "mail", "circular", "template"
    ]
    return {
      keys,
      order
    }
  }



  //  Mark entry options

  //  Mark entry options
  static markEntryOptions() {
    const keys = {
      "gpa": {
        label: "GPA",
        icon: ""
      },
      "cce": {
        label: "CCE",
        icon: ""
      },
    }
    const order = ["gpa", "cce"]
    return {
      keys,
      order
    }

  }

  static attendanceFormTypes() {
    const keys = {
      attendance: {
        label: "Attendance",
        icon: ""
      },
      holiday: {
        label: "Holiday",
        icon: ""
      },
    }
    const order = [
      "attendance", "holiday"
    ]
    return {
      keys,
      order
    }
  }


  static reportFormTypes() {
    const keys = {
      attendance: {
        label: "Attendance",
        icon: ""
      },
      assignment: {
        label: "Assignment",
        icon: ""
      },
      homework: {
        label: "Home Work",
        icon: ""
      },
      mark: {
        label: "Mark",
        icon: ""
      },
      fees: {
        label: "Fee",
        icon: ""
      },
      staff: {
        label: "Staff",
        icon: ""
      },
    }
    const order = [
      "attendance", "assignment", "homework", "mark", "fees", "staff",
    ]
    return {
      keys,
      order
    }
  }

  static leaveFormTypes() {
    const keys = {
      leave: {
        label: "Leave",
        icon: ""
      },
    }
    const order = [
      "leave",
    ]
    return {
      keys,
      order
    }
  }

  static classTimeTable() {
    const keys = {
      class: { label: "Class TimeTable", icon: "" },
      rescheduletable: { label: "Rescheduled TimeTable", icon: "" },

    }
    const order = [
      "class", "rescheduletable"
    ]
    return { keys, order }

  }



  // TODO: Modules list

  static getModules() {
    const modules = {
      clients: {
        Clients: {
          view: {
            value: false
          },
          edit: {
            value: false
          },
          create: {
            value: false
          },
          delete: {
            value: false
          },
          export: {
            value: false
          },
        }
      },
      setting: {
        Department: {
          view: {
            value: false
          },
          edit: {
            value: false
          },
          create: {
            value: false
          },
          delete: {
            value: false
          },
        },
        Batch: {
          view: {
            value: false
          },
          edit: {
            value: false
          },
          create: {
            value: false
          },
          delete: {
            value: false
          },
        },
        Caste: {
          view: {
            value: false
          },
          edit: {
            value: false
          },
          create: {
            value: false
          },
          delete: {
            value: false
          },
        },
        Category: {
          view: {
            value: false
          },
          edit: {
            value: false
          },
          create: {
            value: false
          },
          delete: {
            value: false
          },
        },
        Boardtype: {
          view: {
            value: false
          },
          edit: {
            value: false
          },
          create: {
            value: false
          },
          delete: {
            value: false
          },
        },
        Language: {
          view: {
            value: false
          },
          edit: {
            value: false
          },
          create: {
            value: false
          },
          delete: {
            value: false
          },
        },
        Religion: {
          view: {
            value: false
          },
          edit: {
            value: false
          },
          create: {
            value: false
          },
          delete: {
            value: false
          },
        },
        State: {
          view: {
            value: false
          },
          edit: {
            value: false
          },
          create: {
            value: false
          },
          delete: {
            value: false
          },
        },
        Title: {
          view: {
            value: false
          },
          edit: {
            value: false
          },
          create: {
            value: false
          },
          delete: {
            value: false
          },
        },
        Term: {
          view: {
            value: false
          },
          edit: {
            value: false
          },
          create: {
            value: false
          },
          delete: {
            value: false
          },
        }
      },
      user: {
        Users: {
          view: {
            value: false
          },
          edit: {
            value: false
          },
          create: {
            value: false
          },
          delete: {
            value: false
          },
          import: {
            value: false
          },
          export: {
            value: false
          },
        }
      },
      schedule: {
        Exam: {
          view: {
            value: false
          },
          edit: {
            value: false
          },
          create: {
            value: false
          },
          delete: {
            value: false
          },

        },
        Event: {
          view: {
            value: false
          },
          edit: {
            value: false
          },
          create: {
            value: false
          },
          delete: {
            value: false
          },

        },
        Attendance: {
          view: {
            value: false
          },
          edit: {
            value: false
          },
          create: {
            value: false
          },
          delete: {
            value: false
          },

        },
        Assignment: {
          view: {
            value: false
          },
          edit: {
            value: false
          },
          create: {
            value: false
          },
          delete: {
            value: false
          },

        },
        Timetable: {
          view: {
            value: false
          },
          edit: {
            value: false
          },
          create: {
            value: false
          },
          delete: {
            value: false
          },

        },
        Homework: {
          view: {
            value: false
          },
          edit: {
            value: false
          },
          create: {
            value: false
          },
          delete: {
            value: false
          },

        },
        Course: {
          view: {
            value: false
          },
          edit: {
            value: false
          },
          create: {
            value: false
          },
          delete: {
            value: false
          },

        },
        Term: {
          view: {
            value: false
          },
          edit: {
            value: false
          },
          create: {
            value: false
          },
          delete: {
            value: false
          }
        }

      },
      roles: {
        Role: {
          view: {
            value: false
          },
          edit: {
            value: false
          },
          create: {
            value: false
          },
          delete: {
            value: false
          },
          import: {
            value: false
          },
          export: {
            value: false
          },
          assign: {
            value: false
          }
        }
      },
      timetable: {
        Exam: {
          view: {
            value: false
          },
          export: {
            value: false
          },
        },
        Class: {
          view: {
            value: false
          },
          create: {
            value: false
          },
          export: {
            value: false
          },
        },
        Staff: {
          view: {
            value: false
          },
          export: {
            value: false
          },
        },
        WorkAllocation: {
          view: {
            value: false
          },
          create: {
            value: false
          },
          edit: {
            value: false
          },
          delete: {
            value: false
          },
        }
      },
      attendance: {
        Attendance: {
          view: {
            value: false
          },
          create: {
            value: false
          },
          edit: {
            value: false
          },
          delete: {
            value: false
          },

        },
        Holiday: {
          view: {
            value: false
          },
          create: {
            value: false
          },
          edit: {
            value: false
          },
          delete: {
            value: false
          },
        },
      },
      fee: {
        feeallocation: {
          view: {
            value: false
          },
          create: {
            value: false
          },
          edit: {
            value: false
          },
          delete: {
            value: false
          },
        },
        feecollection: {
          view: {
            value: false
          },
          create: {
            value: false
          },
          edit: {
            value: false
          },
          delete: {
            value: false
          },
        },
      },
      leave: {
        Leave: {
          view: {
            value: false
          },
          create: {
            value: false
          },
          edit: {
            value: false
          },
          delete: {
            value: false
          },
        },

      },
      exam: {
        offlineExam: {
          view: {
            value: false
          },
          create: {
            value: false
          },
          edit: {
            value: false
          },
          delete: {
            value: false
          },
        },
        onlineExam: {
          view: {
            value: false
          },
          create: {
            value: false
          },
          edit: {
            value: false
          },
          delete: {
            value: false
          },
        },
        section: {
          view: {
            value: false
          },
          create: {
            value: false
          },
          edit: {
            value: false
          },
          delete: {
            value: false
          },
        },
        previewAnswer: {
          view: {
            value: false
          },
          create: {
            value: false
          },
          edit: {
            value: false
          },
          delete: {
            value: false
          },
        },
        previewQuestion: {
          view: {
            value: false
          },
          create: {
            value: false
          },
          edit: {
            value: false
          },
          delete: {
            value: false
          },
        },
        viewQuestions: {
          view: {
            value: false
          },
          create: {
            value: false
          },
          edit: {
            value: false
          },
          delete: {
            value: false
          },
        }
      },
      course: {
        subject: {
          view: {
            value: false
          },
          edit: {
            value: false
          },
          create: {
            value: false
          },
          delete: {
            value: false
          },
        },
        syllabus: {
          view: {
            value: false
          },
          edit: {
            value: false
          },
          create: {
            value: false
          },
          delete: {
            value: false
          },
        },
        externalcourse: {
          view: {
            value: false
          },
          edit: {
            value: false
          },
          create: {
            value: false
          },
          delete: {
            value: false
          },
        },
      },
      event: {
        addAttendees: {
          view: {
            value: false
          },
          create: {
            value: false
          },
          edit: {
            value: false
          },
          delete: {
            value: false
          },
          import: {
            value: false
          },
        },
        gallery: {
          view: {
            value: false
          },
          edit: {
            value: false
          },
          create: {
            value: false
          }
        }
      },
      report: {
        Attendance: {
          view: {
            value: false
          },
          export: {
            value: false
          },
        },
        Assignment: {
          view: {
            value: false
          },
          export: {
            value: false
          },
        },
        Homework: {
          view: {
            value: false
          },
          export: {
            value: false
          },
        },
        Staff: {
          view: {
            value: false
          },
          export: {
            value: false
          },
        },
        Mark: {
          view: {
            value: false
          },
          export: {
            value: false
          },
        },
        Fee: {
          view: {
            value: false
          },
          export: {
            value: false
          },
        },
      },
      credentials: {
        Sms: {
          view: {
            value: false
          },
          create: {
            value: false
          },
          edit: {
            value: false
          },
          delete: {
            value: false
          },
        },
        Mail: {
          view: {
            value: false
          },
          create: {
            value: false
          },
          edit: {
            value: false
          },
          delete: {
            value: false
          },
        }
      },
      notification: {
        Sms: {
          create: {
            value: false
          },
        },
        Mail: {
          create: {
            value: false
          },
        }
      },
      grade: {
        Grade: {
          view: {
            value: false
          },
          edit: {
            value: false
          },
          create: {
            value: false
          },
          delete: {
            value: false
          },
        },
        Skills: {
          view: {
            value: false
          },
          edit: {
            value: false
          },
          create: {
            value: false
          },
          delete: {
            value: false
          },
        },
        AssessmentWeitage: {
          view: {
            value: false
          },
          edit: {
            value: false
          },
          create: {
            value: false
          },
          delete: {
            value: false
          },
        },
        SubjectWeitage: {
          view: {
            value: false
          },
          edit: {
            value: false
          },
          create: {
            value: false
          },
          delete: {
            value: false
          },
        },
      },
      assignment: {
        Assignment: {
          view: {
            value: false
          },
          edit: {
            value: false
          },
          create: {
            value: false
          },
          delete: {
            value: false
          },
          export: {
            value: false
          }
        },
        Homework: {
          view: {
            value: false
          },
          edit: {
            value: false
          },
          create: {
            value: false
          },
          delete: {
            value: false
          },
          export: {
            value: false
          }
        },
      },
      mark: {
        Mark: {
          view: {
            value: false
          },
          edit: {
            value: false
          },
          create: {
            value: false
          },
        },
      }
    }
    return modules;
  }




}