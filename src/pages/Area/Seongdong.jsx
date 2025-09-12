import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Navbar from '../../components/Navbar/Navbar';
import PromotionBanner from '../../components/PromotionBanner/PromotionBanner';

const districtToPath = {
  "중구": "jung",
  "송파구": "songpa",
  "성동구": "seongdong",
};

const districtToRentalPath = {
  "중구": "/jung/rental",
  "송파구": "/songpa/rental",
  "성동구": "/seongdong/rental",
};

const Seongdong = () => {
  const [selectedDistrict, setSelectedDistrict] = useState("성동구");
  const navigate = useNavigate();

  const handleDistrictChange = (district) => {
    setSelectedDistrict(district);
    const path = districtToPath[district];
    if (path) {
      navigate(`/${path}`);
    }
  };

  const districts = ["중구", "성동구", "송파구"];

  return (
    <div>
      <Navbar
        selectedDistrict={selectedDistrict}
        onDistrictChange={handleDistrictChange}
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

export default Seongdong;
