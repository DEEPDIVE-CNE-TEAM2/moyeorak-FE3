import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../../../components/Navbar/Navbar.jsx";
import SelectPanel from "./SelectPanel/SelectPanel.jsx";
import Card from "./card/Card.jsx";
import styles from "./ClassReservation.module.css";
import { getProgramsByRegion } from "../../../Api";

const ClassReservation = () => {
  const location = useLocation();
  const [cardData, setCardData] = useState([]);
  const [selectedSport, setSelectedSport] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);

  const params = new URLSearchParams(location.search);
  const selectedRegionId = params.get("selectedRegionId");
  const regionId = selectedRegionId ? parseInt(selectedRegionId, 10) : null;

  useEffect(() => {
    if (!regionId || isNaN(regionId)) {
      console.log("유효하지 않은 regionId. API 호출하지 않음");
      setCardData([]);
      return;
    }

    const fetchPrograms = async () => {
      try {
        const programs = await getProgramsByRegion(regionId);
        const today = new Date();

        const formattedData = programs.map((program) => {
          const inPriceStr =
            program.inPrice != null
              ? program.inPrice.toLocaleString() + "원(관내)"
              : null;
          const outPriceStr =
            program.outPrice != null
              ? program.outPrice.toLocaleString() + "원(관외)"
              : null;
          const appliedPriceStr =
            program.appliedPrice != null
              ? program.appliedPrice.toLocaleString() + "원"
              : null;

          let feeStr = "-";
          if (inPriceStr && outPriceStr) {
            feeStr = `${inPriceStr} / ${outPriceStr}`;
          } else if (appliedPriceStr) {
            feeStr = appliedPriceStr;
          }

          let status = "접수 마감";
          if (program.registrationPeriod) {
            const [startStr, endStr] = program.registrationPeriod
              .split("~")
              .map((s) => s.trim());
            const regStart = new Date(startStr);
            const regEnd = new Date(endStr);
            if (today >= regStart && today <= regEnd) {
              status = "접수 중";
            }
          }

          return {
            id: program.id,
            imageUrl: program.imageUrl || program.image_url || "",
            title: program.title,
            details: [
              program.registrationPeriod || "-",
              program.usagePeriod || "-",
              feeStr,
              program.target || "-",
            ],
            registrationPeriod: program.registrationPeriod,
            status,
          };
        });

        setCardData(formattedData);
      } catch (error) {
        console.error("프로그램 데이터 불러오기 실패:", error);
        setCardData([]);
      }
    };

    fetchPrograms();
  }, [regionId]);

  const filteredCards = cardData.filter((card) => {
    const matchSport = selectedSport
      ? card.title.includes(selectedSport)
      : true;
    const matchStatus = selectedStatus ? card.status === selectedStatus : true;
    return matchSport && matchStatus;
  });

  return (
    <>
      <Navbar />
      <div className={styles.centerWrapper}>
        <SelectPanel
          selectedSport={selectedSport}
          setSelectedSport={setSelectedSport}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
        />
        <div className={styles.cardGrid}>
          {filteredCards.length === 0 ? (
            <p>해당 강의 정보가 없습니다.</p>
          ) : filteredCards.length % 2 === 1 ? (
            <>
              {filteredCards.slice(0, -1).map((card) => (
                <Card key={card.id} {...card} />
              ))}
              <div className={styles.singleCardWrapper}>
                <Card {...filteredCards[filteredCards.length - 1]} />
              </div>
            </>
          ) : (
            filteredCards.map((card) => <Card key={card.id} {...card} />)
          )}
        </div>
      </div>
    </>
  );
};

export default ClassReservation;
