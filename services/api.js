// services/api.js
//-----------------------------------------------
//  Central API helper for your Django backend
//-----------------------------------------------

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://srkdp-production.up.railway.app" || "http://127.0.0.1:8000";

class ApiService {
  /*-----------------------------------------------------------*
   |  Shared base-URL                                          |
   *-----------------------------------------------------------*/
  static baseURL = API_BASE_URL;

  /*-----------------------------------------------------------*
   |  Generic request helper  (includes detailed debug logs)   |
   *-----------------------------------------------------------*/
  static async request(endpoint, options = {}) {
    const url = `${ApiService.baseURL}${endpoint}`;
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
      const res = await fetch(url, config);
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
    return ApiService.request('/api/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  static logout(refreshToken) {
    return ApiService.request('/api/auth/logout/', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  }

  static getProfile() {
    return ApiService.request('/api/auth/profile/');
  }

  /*-----------------------------------------------------------*
   |  Teacher dashboard                                        |
   *-----------------------------------------------------------*/
  static getTeacherDashboard() {
    return ApiService.request('/api/teachers/dashboard/');
  }

  /*-----------------------------------------------------------*
   |  Principal Dashboard                                      |
   *-----------------------------------------------------------*/
  static getPrincipalDashboardSummary() {
    return ApiService.request('/api/dashboard/principal/summary/');
  }

  static getFeeDashboard() {
    return ApiService.request('/api/fees/dashboard/');
  }

  /*-----------------------------------------------------------*
   |  Attendance - UPDATED WITH NEW METHODS                   |
   *-----------------------------------------------------------*/
  static getClassStudents(classId) {
    return ApiService.request(`/api/attendance/class/${classId}/students/`);
  }

  // NEW: Save attendance to database
  static markAttendance(attendanceData) {
    return ApiService.request('/api/attendance/mark/', {
      method: 'POST',
      body: JSON.stringify(attendanceData),
    });
  }

  // NEW: Get existing attendance from database
  static getAttendance(classId, date, session) {
    return ApiService.request(`/api/attendance/class/${classId}/?date=${date}&session=${session}`);
  }

  // NEW: Get comprehensive attendance report for all classes
  static getAttendanceReport(date, session) {
    return ApiService.request(`/api/attendance/report/?date=${date}&session=${session}`);
  }

  /*-----------------------------------------------------------*
   |  Fee management                                           |
   *-----------------------------------------------------------*/
  static recordPayment(paymentData) {
    return ApiService.request('/api/fees/record-payment/', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  static getStudentFeeStatus(studentId) {
    return ApiService.request(`/api/fees/student-status/?student_id=${studentId}`);
  }

  static getTransactions(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return ApiService.request(`/api/fees/transactions/?${params}`);
  }

  static deleteTransaction(txId) {
    return ApiService.request(`/api/fees/transactions/${txId}/`, {
      method: 'DELETE'
    });
  }

  /*-----------------------------------------------------------*
   |  Student management                                       |
   *-----------------------------------------------------------*/
  static searchStudents(query) {
    return ApiService.request(`/api/students/search/?q=${query}`);
  }

  // List students in a class (for the Manage Students page)
  static getClassStudentsForManage(classId) {
    return ApiService.request(`/api/students/class/${classId}/`);
  }

  static async addStudent(studentData) {
    return ApiService.request('/api/students/add/', {
      method: 'POST',
      body: JSON.stringify(studentData),
    });
  }

  static async addStudentsBulk(bulkData) {
    return ApiService.request('/api/students/add-bulk/', {
      method: 'POST',
      body: JSON.stringify(bulkData),
    });
  }

  static async deleteStudent(studentId) {
    return ApiService.request(`/api/students/${studentId}/delete/`, {
      method: 'DELETE',
    });
  }

  /*-----------------------------------------------------------*
   |  ✅ MARKS MANAGEMENT - NEW SECTION                       |
   *-----------------------------------------------------------*/

  // Get all classes for marks management
  static getMarksClasses() {
    return ApiService.request('/api/assessments/classes/');
  }

  // Get students in a class for marks
  static getMarksStudents(classId) {
    return ApiService.request(`/api/assessments/students/?class_id=${classId}`);
  }

  // Get detailed marks for a specific student
  static getStudentMarks(studentId) {
    return ApiService.request(`/api/assessments/student-marks/${studentId}/`);
  }

  // Get subjects for a class (if needed later)
  static getClassSubjects(classId) {
    return ApiService.request(`/api/assessments/subjects/?class_id=${classId}`);
  }

  // Get all exams (if needed later)
  static getExams() {
    return ApiService.request('/api/assessments/exams/');
  }

  /*-----------------------------------------------------------*
   |  ✅ MARKS ENTRY - FOR FUTURE (when you add marks entry) |
   *-----------------------------------------------------------*/

  // Save individual mark
  static saveStudentMark(markData) {
    return ApiService.request('/api/assessments/marks/', {
      method: 'POST',
      body: JSON.stringify(markData),
    });
  }

  // Bulk save marks
  static saveBulkMarks(bulkMarkData) {
    return ApiService.request('/api/assessments/bulk-marks/', {
      method: 'POST',
      body: JSON.stringify(bulkMarkData),
    });
  }

  // Update existing mark
  static updateStudentMark(markId, markData) {
    return ApiService.request(`/api/assessments/marks/${markId}/`, {
      method: 'PUT',
      body: JSON.stringify(markData),
    });
  }

  /*-----------------------------------------------------------*
   |  ✅ MARKS ENTRY GRID (class x subjects for an exam)      |
   *-----------------------------------------------------------*/

  // Load the editable grid: students x subjects + existing marks
  static getClassMarksGrid(classId, examId) {
    return ApiService.request(
      `/api/assessments/marks-grid/?class_id=${classId}&exam_id=${examId}`
    );
  }

  // Bulk-save the grid: { class_id, exam_id, marks: { [studentId]: { [subjectId]: {marks, is_absent} } } }
  static saveClassMarksGrid(payload) {
    return ApiService.request('/api/assessments/marks-grid/save/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  static getStaffList() {
    return ApiService.request('/api/teachers/list/');
  }

  static addStaff(data) {
    return ApiService.request('/api/teachers/add/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static updateStaff(staffId, data) {
    return ApiService.request(`/api/teachers/${staffId}/update/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static deleteStaff(staffId) {
    return ApiService.request(`/api/teachers/${staffId}/delete/`, {
      method: 'DELETE',
    });
  }

  /*-----------------------------------------------------------*
   |  Announcements                                            |
   *-----------------------------------------------------------*/
  static getAnnouncements() {
    return ApiService.request('/api/notifications/announcements/');
  }

  static createAnnouncement(data) {
    return ApiService.request('/api/notifications/announcements/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static deleteAnnouncement(id) {
    return ApiService.request(`/api/notifications/announcements/${id}/delete/`, {
      method: 'DELETE',
    });
  }
}

export default ApiService;
