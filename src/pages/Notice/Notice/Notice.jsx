import React, { useState, useEffect } from "react";
import styles from "./Notice.module.css";
import Navbar from "../../../components/Navbar/Navbar";
import { fetchNotices } from "../../../Api";
import { useNavigate } from "react-router-dom";

export default function Notice() {
  const navigate = useNavigate();

  const [notices, setNotices] = useState([]);
  const [filteredNotices, setFilteredNotices] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const noticesPerPage = 10;

  const regionId = sessionStorage.getItem("selectedRegionId") || 1;

  const loadNotices = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchNotices(regionId);

      const mapped = data.map((n) => ({
        id: n.id,
        title: n.title,
        createdAt: new Date(n.createdAt).toLocaleDateString(),
        viewCount: n.viewCount,
      }));

      setNotices(mapped);
      setCurrentPage(1);
    } catch (e) {
      console.error("공지사항 불러오기 오류:", e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotices();
  }, [regionId]);

  // 검색 필터링
  useEffect(() => {
    let filtered = notices;

    if (searchText.trim()) {
      filtered = filtered.filter((n) =>
        n.title.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    setFilteredNotices(filtered);
    setCurrentPage(1);
  }, [searchText, notices]);

  const indexOfLast = currentPage * noticesPerPage;
  const indexOfFirst = indexOfLast - noticesPerPage;
  const currentNotices = filteredNotices.slice(indexOfFirst, indexOfLast);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredNotices.length / noticesPerPage); i++) {
    pageNumbers.push(i);
  }

  if (loading) return <div>로딩중...</div>;
  if (error) return <div>에러 발생: {error}</div>;

  return (
    <>
      <Navbar />

      <div className={styles.container}>
        {/* 검색창 */}
        <div className={styles.searchRow}>
          <input
            type="text"
            placeholder="공지사항 검색"
            className={styles.searchInput}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        {/* 공지사항 테이블 */}
        <table className={styles.table}>
          <thead>
            <tr>
              <th>No</th>
              <th>제목</th>
              <th>등록일</th>
              <th>조회수</th>
            </tr>
          </thead>
          <tbody>
            {currentNotices.length > 0 ? (
              currentNotices.map((n, index) => (
                <tr key={n.id}>
                  <td>{indexOfFirst + index + 1}</td>
                  <td
                    className={styles.titleText}
                    onClick={() => navigate(`/notice/${n.id}`)}
                  >
                    {n.title}
                  </td>
                  <td>{n.createdAt}</td>
                  <td>{n.viewCount}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className={styles.noData}>
                  공지사항이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* 페이지네이션 */}
        <div className={styles.pagination}>
          {pageNumbers.map((number) => (
            <button
              key={number}
              onClick={() => setCurrentPage(number)}
              className={`${styles.pageBtn} ${
                currentPage === number ? styles.activePage : ""
              }`}
            >
              {number}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
