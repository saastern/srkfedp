// services/api.js
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://srkdp-production.up.railway.app";

class ApiService {
  static baseURL = API_BASE_URL;

  // ... your request method stays the same ...

  /*-----------------------------------------------------------*
   |  Authentication helpers - FIXED WITH /api/ PREFIX        |
   *-----------------------------------------------------------*/
  static login(username, password) {
    return this.request('/api/auth/login/', {  // ✅ Added /api/
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  static logout(refreshToken) {
    return this.request('/api/auth/logout/', {  // ✅ Added /api/
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  }

  static getProfile() {
    return this.request('/api/auth/profile/');  // ✅ Added /api/
  }

  /*-----------------------------------------------------------*
   |  Teacher dashboard - FIXED WITH /api/ PREFIX             |
   *-----------------------------------------------------------*/
  static getTeacherDashboard() {
    return this.request('/api/teachers/dashboard/');  // ✅ Added /api/
  }

  /*-----------------------------------------------------------*
   |  Attendance - FIXED WITH /api/ PREFIX                    |
   *-----------------------------------------------------------*/
  static getClassStudents(classId) {
    return this.request(`/api/attendance/class/${classId}/students/`);  // ✅ Added /api/
  }

  static markAttendance(attendanceData) {
    return this.request('/api/attendance/mark/', {  // ✅ Added /api/
      method: 'POST',
      body: JSON.stringify(attendanceData),
    });
  }

  static getAttendance(classId, date, session) {
    return this.request(`/api/attendance/class/${classId}/?date=${date}&session=${session}`);  // ✅ Added /api/
  }

  static getAttendanceReport(date, session) {
    return this.request(`/api/attendance/report/?date=${date}&session=${session}`);  // ✅ Added /api/
  }

  /*-----------------------------------------------------------*
   |  Student management - FIXED WITH /api/ PREFIX            |
   *-----------------------------------------------------------*/
  static async addStudent(studentData) {
    return this.request('/api/students/add/', {  // ✅ Added /api/
      method: 'POST',
      body: JSON.stringify(studentData),
    });
  }

  static async addStudentsBulk(bulkData) {
    return this.request('/api/students/add-bulk/', {  // ✅ Added /api/
      method: 'POST',
      body: JSON.stringify(bulkData),
    });
  }

  static async deleteStudent(studentId) {
    return this.request(`/api/students/${studentId}/delete/`, {  // ✅ Added /api/
      method: 'DELETE',
    });
  }
}

export default ApiService;
