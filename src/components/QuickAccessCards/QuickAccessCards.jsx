import React from "react";
import { useNavigate } from "react-router-dom";
import { IoCall } from "react-icons/io5";
import "./QuickAccessCards.css";
import { getAccessToken } from "../../Api";

const QuickAccessCards = ({ selectedDistrict = "중구" }) => {
  const navigate = useNavigate();
  const isLoggedIn = !!getAccessToken();

  const regionMap = {
    "중구": 1,
    "성동구": 2,
    "송파구": 3,
  };

  const regionId = regionMap[selectedDistrict];

  const handleReservationClick = () => {
    navigate(`/classReservation?selectedRegionId=${regionId}`);
  };

  const handleHistoryClick = () => {
    if (!isLoggedIn) {
      alert("로그인 후 이용 가능합니다.");
      return;
    }
    navigate(`/mypage/classes?selectedRegionId=${regionId}`);
  };

  return (
    <div className="quick-access-container">
      {/* 자주 찾은 서비스 */}
      <div className="quick-card">
        <h3 className="card-title">자주 찾은 서비스</h3>
        <ul className="service-list">
          <li className="service-item" onClick={handleReservationClick}>
            - 수강신청
          </li>
          <li className="service-item" onClick={handleHistoryClick}>
            - 수강신청내역
          </li>
        </ul>
      </div>

      {/* 문의 전화 */}
      <div className="quick-card">
        <h3 className="card-title phone-title">
          <IoCall className="phone-icon" />
          문의 전화
        </h3>
        <p className="phone-number">02-000-0000</p>
      </div>
    </div>
  );
};

export default QuickAccessCards;
