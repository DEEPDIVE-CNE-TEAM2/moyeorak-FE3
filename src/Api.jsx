import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;
console.log("PromotionBanner BASE_URL:", BASE_URL);

// Access Token 저장 및 가져오기 헬퍼 함수
export const setAccessToken = (token) => {
  sessionStorage.setItem("accessToken", token);
};

export const getAccessToken = () => {
  const token = sessionStorage.getItem("accessToken");
  return token ? `Bearer ${token}` : null;
};

export const setRefreshToken = (token) => {
  sessionStorage.setItem("refreshToken", token);
};

export const getRefreshToken = () => {
  return sessionStorage.getItem("refreshToken");
};


// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - 모든 요청에 accessToken 자동 포함
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터 - 401시 토큰 재발급 처리
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};


apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      getRefreshToken()
    ) {

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      getRefreshToken()
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = token;
            return apiClient(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      isRefreshing = true;


      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = token;
            return apiClient(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      isRefreshing = true;

      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) throw new Error("Refresh token is missing.");

        // 토큰 리프레시 API 호출: 바디 없이, 헤더에만 토큰 포함
        const response = await axios.post(
        `${BASE_URL}/api/users/refresh`,
        {
          refreshToken: refreshToken
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );


        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

        if (!newAccessToken) {
          throw new Error("New access token is missing in refresh response.");
        }

        setAccessToken(newAccessToken.startsWith('Bearer ') ? newAccessToken.slice(7) : newAccessToken);

        if (newRefreshToken) {
          setRefreshToken(newRefreshToken.startsWith('Bearer ') ? newRefreshToken.slice(7) : newRefreshToken);
        }
        if (!newAccessToken) {
          throw new Error("New access token is missing in refresh response.");
        }

        setAccessToken(newAccessToken.startsWith('Bearer ') ? newAccessToken.slice(7) : newAccessToken);

        if (newRefreshToken) {
          setRefreshToken(newRefreshToken.startsWith('Bearer ') ? newRefreshToken.slice(7) : newRefreshToken);
        }

        const bearerNewAccessToken = `Bearer ${newAccessToken.startsWith('Bearer ') ? newAccessToken.slice(7) : newAccessToken}`;

        processQueue(null, bearerNewAccessToken);

        originalRequest.headers.Authorization = bearerNewAccessToken;

        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        processQueue(refreshError, null);
        console.error("Token refresh failed:", refreshError);

        // 토큰 삭제 및 강제 로그아웃 처리
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }


    return Promise.reject(error);
  }
});

// 로그인
export const login = async (email, password) => {
  const response = await apiClient.post('/api/users/login', { email, password });


  if (response.data.accessToken) {
    let token = response.data.accessToken;
    if (token.startsWith('Bearer ')) token = token.slice(7);
    setAccessToken(token);
  }

  return response.data;
};

// 회원가입
export const signup = async (data) => {
  const response = await axios.post(`${BASE_URL}/api/users/signup`, data, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: undefined,
    },
  });
  return response.data;
};

// 이메일 중복확인 API
export const checkEmailDuplicate = async (email) => {
  const response = await apiClient.get(`/api/users/check-email?email=${encodeURIComponent(email)}`);
  return response.data;
};

// 휴대폰 번호 중복확인 API
export const checkPhoneDuplicate = async (phone) => {
  const response = await apiClient.get(`/api/users/check-phone?phone=${encodeURIComponent(phone)}`);
  return response.data;
};

// 내 정보 조회
export const getUserInfo = async () => {
  const response = await apiClient.get('/api/users/me');
  return response.data;
};

// 내 정보 수정
export const updateUserInfo = async (data) => {
  const response = await apiClient.put('/api/users/me', data);
  return response.data;
};

// 비밀번호 변경
export const changePassword = async ({ currentPassword, newPassword, confirmNewPassword }) => {
  const response = await apiClient.put('/api/users/password', {
    currentPassword, newPassword, confirmNewPassword
  });
  return response.data;
};

// 비밀번호 확인
export const verifyPassword = async (password) => {
  const token = getAccessToken();

  const response = await axios.post(
    `${BASE_URL}/api/users/verify-password`,
    { password },
    {
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data;
};

// 회원 탈퇴
export const deleteUser = async (password, confirmPassword) => {
  const response = await apiClient.delete('/api/users/delete', {
    data: { password, confirmPassword }
  });
  return response.data;
};

// 지역 전체 이름 리스트 조회 API
export const getRegionList = async () => {
  const response = await apiClient.get('/api/regions');
  return response.data.map(r => ({ id: r.id, name: r.name }));
};

// 지역별 시설 목록 조회 
export const getRentalFacilitiesByRegionId = async (regionId) => {
  const response = await apiClient.get(`/api/facilities/region/${regionId}`);
  return response.data;
};

// 마이페이지 수강신청 목록 조회
export const getMyEnrollments = async () => {
  try {
    const response = await apiClient.get('/api/enrollments/me');
    return response.data;
    return response.data;
  } catch (error) {
    console.error('내 수강신청 목록 조회 실패:', error);
    return [];
  }
};

// 마이페이지 수강신청 취소
export const cancelEnrollment = async (enrollmentId) => {
  try {
    const response = await apiClient.delete(`/api/enrollments/${enrollmentId}`);
    return response.data;
  } catch (error) {
    console.error('수강신청 취소 실패:', error.response?.data || error.message);
    throw error;
  }
};

// 공지사항 목록 조회
export const getNoticesByRegion = async (regionId) => {
  const response = await apiClient.get(`/api/notices/region/${regionId}`);
  return response.data;
};

// 공지사항 단건 조회
export const getNoticeById = async (id) => {
  const response = await apiClient.get(`/api/notices/${id}`);
  return response.data;
};

// 수강신청 프로그램 목록 조회 API (GET)
export const getProgramsByRegion = async (regionId) => {
  try {
    const response = await apiClient.get(`/api/programs?regionId=${regionId}`);
    return response.data;
  } catch (error) {
    console.error("수강신청 프로그램 조회 실패:", error);
    return [];
  }
};

// 수강신청 상세화면
export const getProgramDetail = async (id) => {
  try {
    const response = await apiClient.get(`/api/programs/${id}`);
    return response.data;
  } catch (error) {
    console.error('프로그램 상세 조회 실패:', error);
    throw error;
  }
};

// 수강신청 API (POST)
export const enrollProgram = async (enrollmentData) => {
  const response = await apiClient.post('/api/enrollments', enrollmentData);
  return response.data;
};

// 지역별 메인 이미지 조회
export const fetchRegionMainImages = async (regionId) => {
  try {
    console.log("Fetching URL:", `${BASE_URL}/api/main-images/region/${regionId}`); // 여기에 추가
  
    const response = await apiClient.get(`/api/main-images/region/${regionId}`);
    return response.data;
    
  } catch (error) {
    console.error("지역별 메인 이미지 조회 에러:", error);
    throw error;
  }
};

// 공지사항 조회
export const fetchNotices = async (regionId) => {
  const response = await apiClient.get(`/api/notices/region/${regionId}`);
  return response.data;
};

// 공지사항 상세조회
export const fetchNoticeDetail = async (id) => {
  const response = await apiClient.get(`/api/notices/${id}`);
  return response.data;
};