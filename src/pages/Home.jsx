import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar.jsx';
import PromotionBanner from "../components/PromotionBanner/PromotionBanner";
import PopupModal from '../components/popupmodal/PopupModal';
import { getAccessToken } from "../Api";

const districtToPath = {
  "송파구": "songpa",
  "중구": "jung",
  "성동구": "seongdong",
};

const Home = () => {
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [showPopup, setShowPopup] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // location(주소) 변경 시마다 토큰 재확인해서 로그인 상태 갱신
  useEffect(() => {
    const token = getAccessToken();
    setIsLoggedIn(!!token);
  }, [location]);

  // 팝업에서 지역 선택
  const handleDistrictSelect = (district) => {
    setSelectedDistrict(district);
    setShowPopup(false);

    const path = districtToPath[district];
    if (path) {
      navigate(`/${path}`);
    }
  };

  // 네비바에서 지역 선택
  const handleDistrictChange = (district) => {
    setSelectedDistrict(district);

    const path = districtToPath[district];
    if (path) {
      navigate(`/${path}`);
    }
  };

  return (
    <div>
      <Navbar 
        selectedDistrict={selectedDistrict} 
        onDistrictChange={handleDistrictChange} 
      />
      <PromotionBanner />

      {showPopup && (
        <PopupModal
          selectedDistrict={selectedDistrict}
          onConfirm={handleDistrictSelect}
        />
      )}
    </div>
  );
};

export default Home;
