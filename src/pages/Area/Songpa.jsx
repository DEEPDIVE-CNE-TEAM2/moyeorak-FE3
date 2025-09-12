import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import PromotionBanner from '../../components/PromotionBanner/PromotionBanner';

const districts = ["중구", "성동구", "송파구"];

const districtToPath = {
  "송파구": "songpa",
  "중구": "jung",
  "성동구": "seongdong",
};

const districtToRentalPath = {
  "송파구": "/songpa/rental",
  "중구": "/jung/rental",
  "성동구": "/seongdong/rental",
};

const Songpa = () => {
  const [selectedDistrict, setSelectedDistrict] = useState("송파구");
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const navigate = useNavigate();

  const handleDistrictChange = (district) => {
    setSelectedDistrict(district);
    const path = districtToPath[district];
    if (path) {
      navigate(`/${path}`);
    }
  };

  const handleLogoClick = () => {
    const path = districtToPath[selectedDistrict];
    if (path) {
      navigate(`/${path}`);
    }
  };

  const handleFacilityClick = () => {
    const path = districtToPath[selectedDistrict];
    if (path) {
      navigate(`/${path}/place`);
    }
  };

  return (
    <div>
      <Navbar
        selectedDistrict={selectedDistrict}
        onDistrictChange={handleDistrictChange}
        onLogoClick={handleLogoClick}
        onFacilityClick={handleFacilityClick}
        isLoggedIn={isLoggedIn}
        onLogout={() => setIsLoggedIn(false)}
        districts={districts}
        districtToPath={districtToPath}
        districtToRentalPath={districtToRentalPath}
      />
      <PromotionBanner />
      <QuickAccessCards />
      <Footer />
    </div>
  );
};

export default Songpa;
