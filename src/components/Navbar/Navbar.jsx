import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from './Navbar.module.css';
import { CiLogin, CiLogout } from "react-icons/ci";
import { FaUserPlus } from "react-icons/fa";
import { IoMdArrowDropdown } from "react-icons/io";
import Logo from "../../img/아이콘최종.png";

const districts = ["중구", "성동구", "송파구"];

const districtToPath = {
  "중구": "jung",
  "성동구": "seongdong",
  "송파구": "songpa",
};

const districtToId = {
  "중구": 1,
  "성동구": 2,
  "송파구": 3,
};

const Navbar = ({ onDistrictChange, onLogoClick }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showSubmenu, setShowSubmenu] = useState(false);
  const [submenuPinned, setSubmenuPinned] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [currentDistrict, setCurrentDistrict] = useState(
    sessionStorage.getItem("selectedRegionName") || "중구"
  );

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = sessionStorage.getItem("accessToken");
    setIsLoggedIn(!!token);
  }, [location]); // 경로 변경될 때마다 상태 다시 체크

  const handleLogout = () => {
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    setIsLoggedIn(false);
    navigate("/");
  };

  const handleSelectDistrict = (district) => {
    if (onDistrictChange) onDistrictChange(district);

    const regionPath = districtToPath[district];
    const selectedRegionId = districtToId[district];

    sessionStorage.setItem("selectedRegionName", district);
    sessionStorage.setItem("selectedRegionId", selectedRegionId);

    setCurrentDistrict(district);
    setDropdownOpen(false);
    navigate(`/${regionPath}`);
  };

  const selectedRegionId = sessionStorage.getItem("selectedRegionId") || 1;

  return (
    <>
      <div className={styles.topBar}>
        클라우드 기반 공공 체육시설 예약 서비스
      </div>

      <nav className={styles.navbar}>
        <div className={styles.leftSection}>
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              if (onLogoClick) onLogoClick();
              else navigate(`/${districtToPath[currentDistrict]}`);
            }}
          >
            <img src={Logo} alt="로고" className={styles.logo} />
          </a>

          <div className={styles.locationWrapper}>
            <button
              className={`${styles.locationDisplay} ${dropdownOpen ? styles.active : ''}`}
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-expanded={dropdownOpen}
            >
              <IoMdArrowDropdown
                size={18}
                className={dropdownOpen ? styles.iconRotated : ''}
              />
              <span>{currentDistrict || "지역 선택"}</span>
            </button>

            {dropdownOpen && (
              <ul className={styles.dropdownList}>
                {districts.map((district) => (
                  <li key={district} onClick={() => handleSelectDistrict(district)}>
                    {district}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <ul className={styles.menu}>
            <li>
              <a
                href={`/place?selectedRegionId=${selectedRegionId}`}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(`/place?selectedRegionId=${selectedRegionId}`);
                }}
                className={`${styles.menuLink} ${location.pathname.includes('/place') ? styles.activeMenu : ''}`}
              >
                시설
              </a>
            </li>

            <li>
              <a
                href={`/classReservation?selectedRegionId=${selectedRegionId}`}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(`/classReservation?selectedRegionId=${selectedRegionId}`);
                }}
                className={`${styles.menuLink} ${location.pathname === '/classReservation' ? styles.activeMenu : ''}`}
              >
                수강신청
              </a>
            </li>

            <li>
              <a
                href="/notice"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/notice");
                }}
                className={`${styles.menuLink} ${location.pathname === '/notice' ? styles.activeMenu : ''}`}
              >
                공지사항
              </a>
            </li>

            <li
              className={styles.mypageWrapper}
              onMouseEnter={() => setShowSubmenu(true)}
              onMouseLeave={() => !submenuPinned && setShowSubmenu(false)}
              onClick={() => {
                if (!isLoggedIn) {
                  const goToLogin = window.confirm("로그인 후 이용가능합니다. \n로그인 페이지로 이동하시겠습니까?");
                  if (goToLogin) {
                    navigate("/login");
                  }
                  return;
                }
                setSubmenuPinned(!submenuPinned);
              }}
            >
              <span
                className={`${styles.menuLink} ${location.pathname.startsWith('/mypage') ? styles.activeMenu : ''}`}
              >
                마이페이지
              </span>
            </li>
          </ul>
        </div>

        <div className={styles.authButtons}>
          {!isLoggedIn ? (
            <>
              <a
                href="/login"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/login");
                }}
                className={styles.authLink}
              >
                <CiLogin size={20} /> 로그인
              </a>
              <div className={styles.divider}></div>
              <a
                href="/joinMembership"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/joinMembership");
                }}
                className={styles.authLink}
              >
                <FaUserPlus size={18} /> 회원가입
              </a>
            </>
          ) : (
            <button
              className={styles.authLink}
              onClick={handleLogout}
              type="button"
            >
              <CiLogout size={20} />
              로그아웃
            </button>
          )}
        </div>
      </nav>

      {showSubmenu && (
        <div
          className={styles.submenuBar}
          onMouseEnter={() => setShowSubmenu(true)}
          onMouseLeave={() => !submenuPinned && setShowSubmenu(false)}
        >
          <button
            type="button"
            onClick={() => {
              if (!isLoggedIn) {
                const goToLogin = window.confirm(
                  "로그인 후 이용가능합니다.\n로그인 페이지로 이동하시겠습니까?"
                );
                if (goToLogin) {
                  navigate("/login");
                }
                return;
              }
              navigate(`/mypage/profile?selectedRegionId=${selectedRegionId}`);
            }}
            className={`${styles.submenuLink} ${location.pathname.includes('/mypage/profile') ? styles.activeMenu : ''}`}
          >
            회원정보수정
          </button>
          <button
            type="button"
            onClick={() => {
              if (!isLoggedIn) {
                const goToLogin = window.confirm(
                  "로그인 후 이용가능합니다.\n로그인 페이지로 이동하시겠습니까?"
                );
                if (goToLogin) {
                  navigate("/login");
                }
                return;
              }
              navigate(`/mypage/classes?selectedRegionId=${selectedRegionId}`);
            }}
            className={`${styles.submenuLink} ${location.pathname.includes('/mypage/classes') ? styles.activeMenu : ''}`}
          >
            수강신청내역
          </button>
        </div>
      )}
    </>
  );
};

export default Navbar;
