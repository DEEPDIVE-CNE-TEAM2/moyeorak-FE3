import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

// =============================
// 로컬 스토리지 키
// =============================
const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

// =============================
// 토큰 관리 함수
// =============================

// Access Token 저장
export const setAccessToken = (token) => {
  if (token?.startsWith("Bearer ")) {
    token = token.replace("Bearer ", "");
  }
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

// Refresh Token 저장
export const setRefreshToken = (token) => {
  if (token?.startsWith("Bearer ")) {
    token = token.replace("Bearer ", "");
  }
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
};

// Access Token 가져오기 (Bearer 붙여서 반환)
export const getAccessToken = () => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  return token ? `Bearer ${token}` : null;
};

// Refresh Token 가져오기
export const getRefreshToken = () => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

// 토큰 제거
export const clearTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

// =============================
// Axios 인스턴스
// =============================
const apiClient = axios.create({
  baseURL: BASE_URL,
});

// 리프레시 요청 전용 클라이언트 (인터셉터 없음)
const refreshClient = axios.create({
  baseURL: BASE_URL,
});

// 요청 인터셉터 → Authorization 자동 추가
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    console.log("API 요청 헤더 Authorization:", token);
    if (token) {
      config.headers["Authorization"] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// =============================
// 토큰 재발급 로직
// =============================
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// 응답 인터셉터 → 401 발생 시 토큰 재발급
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log("응답 인터셉터 진입:", error.response?.status, error.config?.url);

    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      getRefreshToken()
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // 재발급 진행 중이면 큐에 대기
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = token;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) throw new Error("Refresh token is missing.");

        // 리프레시 토큰으로 새 토큰 요청
        const response = await refreshClient.post(
          `/api/users/refresh`,
          { refreshToken },
          { headers: { "Content-Type": "application/json" } }
        );

        const newAccessToken = response.data.accessToken;
        const newRefreshToken = response.data.refreshToken;

        if (!newAccessToken) throw new Error("New access token not provided.");

        setAccessToken(newAccessToken);
        if (newRefreshToken) {
          setRefreshToken(newRefreshToken);
        }

        const bearerToken = `Bearer ${newAccessToken}`;
        console.log("토큰 재발급 성공! 새로운 액세스 토큰:", newAccessToken);

        processQueue(null, bearerToken);

        originalRequest.headers["Authorization"] = bearerToken;
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error("토큰 재발급 실패:", refreshError);
        processQueue(refreshError, null);

        clearTokens();
        window.location.href = "/admin/login";

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;



// 관리자 로그인
export const adminLogin = async (email, password) => {
  const response = await apiClient.post('/api/users/login', { email, password });

  if (response.data.accessToken) {
    let token = response.data.accessToken;
    if (token.startsWith('Bearer ')) token = token.slice(7);
    setAccessToken(token);
  }

  if (response.data.refreshToken) {
    let refresh = response.data.refreshToken;
    if (refresh.startsWith('Bearer ')) refresh = refresh.slice(7);
    setRefreshToken(refresh);
  }

  return response.data;
};

// 관리자 정보 조회
export const getAdminInfo = async () => {
  const response = await apiClient.get('/api/users/me');
  return response.data;
};

// 회원 조회
export const fetchAdminUsers = async () => {
  const response = await apiClient.get('/api/admin/users');
  return response.data;
};

// 회원 상세 정보 조회
export const fetchAdminUserDetail = async (userId) => {
  const response = await apiClient.get(`/api/admin/users/${userId}`);
  return response.data;
};

// 회원 정보 수정
export const updateAdminUser = async (userId, updatedData) => {
  const response = await apiClient.patch(`/api/admin/users/${userId}`, updatedData);
  return response.data;
};

// 회원 수강 이력 조회
export const getUserEnrollments = async (userId) => {
  try {
    const response = await apiClient.get(`/api/admin/users/${userId}/enrollments`);
    return response.data;
  } catch (error) {
    console.error("회원 수강 이력 조회 실패:", error);
    throw error;
  }
};

// 수강 취소
export const cancelEnrollment = async (enrollmentId) => {
  try {
    const token = getAccessToken() || "";
    const response = await axios.delete(
      `${BASE_URL}/api/admin/users/enrollments/${enrollmentId}`,
      { headers: { Authorization: token } }
    );
    return response.data;
  } catch (error) {
    console.error("수강 취소 API 실패:", error);
    throw error;
  }
};

// 회원 생성
export const createUser = async (userData) => {
  const response = await apiClient.post('/api/admin/users', userData);
  return response.data;
};

// 프로그램 추가
export const createProgram = async (programData) => {
  const response = await apiClient.post('/api/admin/programs', programData);
  return response.data;
};

// 프로그램 조회
export async function fetchPrograms({ regionId = "", title = "" } = {}) {
  const token = getAccessToken();
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = token;

  const queryParams = new URLSearchParams();
  if (regionId) queryParams.append("regionId", regionId);
  if (title) queryParams.append("title", title);

  const url = `${BASE_URL}/api/admin/programs${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;

  const response = await fetch(url, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API 호출 실패: ${response.status}\n${text}`);
  }

  return await response.json();
}


// 프로그램 상세 조회
export const fetchAdminProgramDetail = async (programId) => {
  const response = await apiClient.get(`/api/admin/programs/${programId}`);
  return response.data;
};

// 프로그램 수정
export const updateAdminProgram = async (programId, data) => {
  const response = await apiClient.patch(`/api/admin/programs/${programId}`, data);
  return response.data;
};

// 프로그램 삭제
export const deleteProgram = async (programId) => {
  const response = await apiClient.delete(`/api/admin/programs/${programId}`);
  return response.data;
};

// 공지사항 조회
export const getNotices = async () => {
  try {
    const response = await apiClient.get("/api/admin/notice");
    return response.data;
  } catch (error) {
    console.error("공지사항 조회 오류:", error);
    return [];
  }
};

// 공지사항 상세 조회
export const getNoticeDetail = async (noticeId) => {
  try {
    const response = await apiClient.get(`/api/admin/notice/${noticeId}`);
    return response.data;
  } catch (error) {
    console.error("공지사항 상세 조회 오류:", error);
    return null;
  }
};

// 공지사항 수정
export const updateNotice = async (noticeId, data) => {
  const response = await apiClient.put(`/api/admin/notice/${noticeId}`, data);
  return response.data;
};

// 공지사항 생성
export const createNotice = async (title, content) => {
  const response = await apiClient.post('/api/admin/notice', { title, content });
  return response.data;
};

// 공지사항 삭제
export const deleteNotice = async (noticeId) => {
  const response = await apiClient.delete(`/api/admin/notice/${noticeId}`);
  if (response.status === 204 || response.status === 200) {
    return true;
  }
  throw new Error("삭제 실패");
};

// 시설 목록 조회
export const fetchFacilities = async () => {
  try {
    const response = await apiClient.get("/api/admin/facility");
    return response.data;
  } catch (error) {
    console.error("시설 목록 조회 실패:", error);
    throw error;
  }
};

// 시설 상세 조회
export const getFacilityDetail = async (facilityId) => {
  const response = await apiClient.get(`/api/admin/facility/${facilityId}`);
  return response.data;
};

// 시설 수정
export const updateFacility = async (facilityId, updatedData) => {
  const response = await apiClient.put(`/api/admin/facility/${facilityId}`, updatedData);
  return response.data;
};

// 시설 삭제
export const deleteFacility = async (facilityId) => {
  const response = await apiClient.delete(`/api/admin/facility/${facilityId}`);
  return response.data;
};

// 시설 등록
export const createFacility = async (facilityData) => {
  const response = await apiClient.post('/api/admin/facility', facilityData);
  return response.data;
};





// 홍보물 리스트 조회
export const getPromotionImages = async () => {
  const res = await apiClient.get('/api/admin/main-images');
  return res.data;
};
/*
export const getPromotionImages = async () => {
  const token = getAccessToken(); // "Bearer xxx" 형태로 반환됨
  console.log('전송 토큰 :', token);

  const res = await fetch('https://api.moyeorak.cloud/api/admin/main-images', {
    method: 'GET',
    headers: {
      'Authorization': token, // 그대로 사용, "Bearer "를 다시 붙이지 않음
      'Content-Type': 'application/json'
    }
  });

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  return await res.json();
};
*/




// 홍보물 수정
export const patchMainImage = async (payload) => {
  const res = await apiClient.put('/api/admin/main-images', payload);
  return res.data;
};

// 홍보물 삭제
export const deleteMainImage = async (id) => {
  const res = await apiClient.delete(`/api/admin/main-images/${id}`);
  return res.data;
};

// 홍보물 생성
export const uploadPromotionImage = async (file) => {
  if (!file) throw new Error("파일이 없습니다.");

  // 1. Presigned URL 요청
  const presignRes = await apiClient.post('/api/admin/main-images/presign', {
    filename: file.name,
    filetype: file.type
  });
  const presignedUrl = presignRes.data;

  // 2. S3에 PUT 업로드
  await fetch(presignedUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file
  });

  // 3. 업로드된 URL을 main-images 생성 API에 전달
  // presignedUrl에서 ? 이후 쿼리 제거
  const imageUrl = presignedUrl.split('?')[0];

  const createRes = await apiClient.post('/api/admin/main-images', {
    imageUrl
  });

  return createRes.data;
};







// 메트릭 조회
export const getCloudWatchMetrics = async (params) => {
  const response = await apiClient.post("/api/cloudwatch/metrics/query", params);
  return response.data;
};

// 로그 조회
export const queryCloudWatchLogs = async (params) => {
  const response = await apiClient.post("/api/cloudwatch/logs/query", params);
  return response.data;
};
