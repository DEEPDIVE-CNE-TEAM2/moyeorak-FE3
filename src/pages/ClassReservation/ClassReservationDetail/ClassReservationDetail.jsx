import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../../components/Navbar/Navbar';
import styles from './ClassReservationDetail.module.css';
import { getProgramDetail } from '../../../Api';
import { getFullImageUrl } from '../../../utils/imageUtils';

const ClassReservationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    getProgramDetail(id)
      .then((res) => {
        console.log("[getProgramDetail 응답]", res);
        setData(res);
        setError(null);
      })
      .catch(() => {
        setError('데이터를 불러오는데 실패했습니다.');
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const infoLabels = [
    '대상',
    '장소',
    '강의기간',
    '강의시간',
    '접수기간',
    '취소기간',
    '요금',
    '정원',
    '문의',
  ];

  const usagePeriodDateOnly = data?.usagePeriod
    ? data.usagePeriod.split('~').map((s) => s.trim()).join(' ~ ')
    : '-';

  const classTime =
    data?.classTime && data.classTime.trim() !== ''
      ? data.classTime.trim()
      : '-';

  const feeString = data
    ? (() => {
        const inPrice = data.inPrice;
        const outPrice = data.outPrice;
        const appliedPrice = data.appliedPrice;

        if (inPrice != null && outPrice != null)
          return `${inPrice.toLocaleString()}원(관내) / ${outPrice.toLocaleString()}원(관외)`;
        if (inPrice != null)
          return `${inPrice.toLocaleString()}원(관내)`;
        if (outPrice != null)
          return `${outPrice.toLocaleString()}원(관외)`;
        if (appliedPrice != null)
          return `${appliedPrice.toLocaleString()}원`;
        return '-';
      })()
    : '-';

  const infoValues = data
    ? [
        data.target || '-',
        data.location || '-',
        usagePeriodDateOnly,
        classTime,
        data.registrationPeriod || '-',
        data.cancelEndDate || '-',
        feeString,
        data.capacity ? `${data.capacity}명` : '-',
        data.contact || '-',
      ]
    : Array(infoLabels.length).fill('-');

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>{error}</div>;

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <h2 className={styles.title}>{data?.title || '제목 없음'}</h2>

        <div className={styles.infoSection}>
          <img
            src={getFullImageUrl(data?.imageUrl) || '/img/default.jpg'}
            alt="클래스 이미지"
            className={styles.image}
            onError={(e) => (e.target.src = '/img/default.jpg')}
          />

          <div className={styles.infoWrapper}>
            <table className={styles.infoTable}>
              <tbody>
                {infoLabels.map((label, idx) => (
                  <tr key={label}>
                    <th>{label}</th>
                    <td>{infoValues[idx]}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className={styles.buttonGroup}>
              <button
                className={styles.applyBtn}
                onClick={() => {
                  const token = sessionStorage.getItem("accessToken");
                  if (!token) {
                    alert("로그인이 필요합니다.");
                    navigate("/login");
                    return;
                  }

                  const confirmMessage =
                  "강의: " + data.title + "\n" +
                  "장소: " + infoValues[1] + "\n" +
                  "강의기간: " + infoValues[2] + "\n" +
                  "강의시간: " + infoValues[3] + "\n" +
                  "수강료: " + infoValues[6] + "\n\n" +
                  "위 내용으로 신청하시겠습니까?";

                  if (window.confirm(confirmMessage)) {
                    navigate(`/classreservation/payment/${id}`);
                  }
                }}
              >
                신청하기
              </button>

              <button className={styles.backBtn} onClick={() => navigate(-1)}>
                목록보기
              </button>
            </div>
          </div>
        </div>
        
        <div className={styles.noticeSection}>
          <h3>상세설명</h3>
          <p>{data?.description || '상세설명이 없습니다.'}</p>
        </div>

      </div>
    </>
  );
};

export default ClassReservationDetail;