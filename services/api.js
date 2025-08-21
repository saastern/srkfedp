// services/api.js
//-----------------------------------------------
//  Central API helper for your Django backend
//-----------------------------------------------

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://srkdp-production.up.railway.app";

class ApiService {
  /*-----------------------------------------------------------*
   |  Shared base-URL                                          |
   *-----------------------------------------------------------*/
  static baseURL = API_BASE_URL;

  /*-----------------------------------------------------------*
   |  Generic request helper  (includes detailed debug logs)   |
   *-----------------------------------------------------------*/
  static async request(endpoint, options = {}) {
    const url   = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('access_token');

    /* ---------- DEBUG: token + header state ----------------- */
    console.log('🔍 REQUEST to:', url);
    console.log('🔑 Token in localStorage:', token ? 'FOUND' : 'NONE');
    if (token) {
      console.log('🔑 Token (first 20 chars):', token.substring(0, 20) + '…');
    }
    /* -------------------------------------------------------- */

    // build fetch config
    const config = {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    };
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Authorization header attached');
    } else {
      console.log('❌ Authorization header NOT attached');
    }

    console.log('📤 Full fetch config →', config);

    try {
      const res  = await fetch(url, config);
      const data = await res.json();

      console.log('► API', res.status, url, data);

      if (!res.ok) {
        throw new Error(data.message || data.detail || `HTTP ${res.status}`);
      }
      return data;
    } catch (err) {
      console.error('✖ ApiService.request', err);
      throw err;
    }
  }

  /*-----------------------------------------------------------*
   |  Authentication helpers                                   |
   *-----------------------------------------------------------*/
  static login(username, password) {
    return this.request('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  static logout(refreshToken) {
    return this.request('/auth/logout/', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  }

  static getProfile() {
    return this.request('/auth/profile/');
  }

  /*-----------------------------------------------------------*
   |  Teacher dashboard                                        |
   *-----------------------------------------------------------*/
  static getTeacherDashboard() {
    return this.request('/teachers/dashboard/');
  }

  /*-----------------------------------------------------------*
   |  Attendance - UPDATED WITH NEW METHODS                   |
   *-----------------------------------------------------------*/
  static getClassStudents(classId) {
    return this.request(`/attendance/class/${classId}/students/`);
  }

  // NEW: Save attendance to database
  static markAttendance(attendanceData) {
    return this.request('/attendance/mark/', {
      method: 'POST',
      body: JSON.stringify(attendanceData),
    });
  }

  // NEW: Get existing attendance from database
  static getAttendance(classId, date, session) {
    return this.request(`/attendance/class/${classId}/?date=${date}&session=${session}`);
  }

  // NEW: Get comprehensive attendance report for all classes
  static getAttendanceReport(date, session) {
    return this.request(`/attendance/report/?date=${date}&session=${session}`);
  }

  /*-----------------------------------------------------------*
   |  Student management                                       |
   *-----------------------------------------------------------*/
  static async addStudent(studentData) {
    return this.request('/students/add/', {
      method: 'POST',
      body: JSON.stringify(studentData),
    });
  }

  static async addStudentsBulk(bulkData) {
    return this.request('/students/add-bulk/', {
      method: 'POST',
      body: JSON.stringify(bulkData),
    });
  }

  static async deleteStudent(studentId) {
    return this.request(`/students/${studentId}/delete/`, {
      method: 'DELETE',
    });
  }
}

export default ApiService;
