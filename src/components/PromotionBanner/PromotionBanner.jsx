import { useState, useEffect } from "react";
import styles from "./PromotionBanner.module.css";
import { IoIosArrowDropleftCircle, IoIosArrowDroprightCircle } from "react-icons/io";
import { useLocation } from "react-router-dom";
import { fetchRegionMainImages } from "../../Api";

const regionIdMap = {
  jung: 1,
  seongdong: 2,
  songpa: 3,
};

const BASE_URL = import.meta.env.VITE_API_URL; 

const PromotionBanner = () => {
  const location = useLocation();
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const path = location.pathname;
    let districtKey = "";

    if (path.includes("/jung")) districtKey = "jung";
    else if (path.includes("/songpa")) districtKey = "songpa";
    else if (path.includes("/seongdong")) districtKey = "seongdong";

    const regionId = regionIdMap[districtKey];
    if (!regionId) return;

    fetchRegionMainImages(regionId)
      .then((data) => {

        if (!Array.isArray(data)) return;

        const mapped = data
          .filter(item => item.isActive)
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .map((item) => ({
            image: item.imageUrl.startsWith("http")
              ? item.imageUrl
              : `${BASE_URL}${item.imageUrl}`,
            text: item.title,
          }));

        setBanners(mapped);
        setCurrentIndex(0);
      })
      .catch((err) => {
        console.error("지역별 이미지 조회 실패:", err);
        setBanners([]);
      });
  }, [location]);

  if (banners.length === 0) return null;

  const prevIndex = (currentIndex - 1 + banners.length) % banners.length;
  const nextIndex = (currentIndex + 1) % banners.length;

  const handlePrev = () => setCurrentIndex(prevIndex);
  const handleNext = () => setCurrentIndex(nextIndex);

  return (
    <div className={styles.fullWidthWrapper}>
      <div className={styles.sliderWrapper}>
        <img
          src={banners[prevIndex].image}
          alt="이전 배너"
          className={`${styles.sideImage} ${styles.left}`}
        />
        <div className={styles.banner}>
          <img
            src={banners[currentIndex].image}
            alt={banners[currentIndex].text || "현재 배너"}
            className={styles.image}
          />
          <div className={currentIndex === 0 ? styles.welcomeText : styles.bannerText}>
            {banners[currentIndex].text}
          </div>
          <div className={styles.arrows}>
            <IoIosArrowDropleftCircle className={styles.arrowIcon} onClick={handlePrev} />
            <IoIosArrowDroprightCircle className={styles.arrowIcon} onClick={handleNext} />
          </div>
        </div>
        <img
          src={banners[nextIndex].image}
          alt="다음 배너"
          className={`${styles.sideImage} ${styles.right}`}
        />
      </div>
    </div>
  );
};

export default PromotionBanner;
