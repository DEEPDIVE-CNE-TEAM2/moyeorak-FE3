import React, { useState, useEffect } from "react";
import styles from "./ProgramManagement.module.css";
import AdminNavbar from "../../../components/Navbar/Navbar";
import { useNavigate } from "react-router-dom";
import { fetchPrograms } from "../../../Api";

const statusColorMap = {
  "진행중": "#4CAF50",
  "수업 종료": "#9E9E9E",
  "수업 예정": "#e6c533ff",
};

const regionMap = {
  "중구": 1,
  "성동구": 2,
  "송파구": 3,
};

export default function ProgramManagement() {
  const navigate = useNavigate();

  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [regionFilter, setRegionFilter] = useState("");
  const [searchText, setSearchText] = useState("");

  const [filteredPrograms, setFilteredPrograms] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const programsPerPage = 10;

  const loadPrograms = async () => {
    setLoading(true);
    setError(null);
    try {
      const regionId = regionMap[regionFilter] || "";
      const data = await fetchPrograms({ regionId });

      const mapped = data.map((p) => ({
        id: p.id,
        name: p.title,
        period: p.usagePeriod,
        facility: p.facilityName,
        capacity: p.capacity,
        currentEnrollment: p.currentEnrollment,
        status: p.progressStatus,
      }));

      setPrograms(mapped);
      setCurrentPage(1);
    } catch (e) {
      console.error("프로그램 불러오기 에러:", e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrograms();
  }, [regionFilter]);

  // 로컬 필터링
  useEffect(() => {
    let filtered = programs;

    if (searchText.trim()) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    setFilteredPrograms(filtered);
    setCurrentPage(1);
  }, [searchText, programs]);

  const indexOfLast = currentPage * programsPerPage;
  const indexOfFirst = indexOfLast - programsPerPage;
  const currentPrograms = filteredPrograms.slice(indexOfFirst, indexOfLast);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredPrograms.length / programsPerPage); i++) {
    pageNumbers.push(i);
  }

  if (loading) return <div>로딩중...</div>;
  if (error) return <div>에러 발생: {error}</div>;

  return (
    <>
      <AdminNavbar activeMenu="수강관리" activeSubMenu="프로그램 관리" />

      <div className={styles.container}>
        <div className={styles.filterRow}>
          <select
            className={styles.select}
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
          >
            <option value="">지역 선택</option>
            <option value="중구">중구</option>
            <option value="성동구">성동구</option>
            <option value="송파구">송파구</option>
          </select>

          <input
            type="text"
            placeholder="프로그램 검색"
            className={styles.searchInput}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>No</th>
              <th>프로그램</th>
              <th>수강기간</th>
              <th>시설</th>
              <th>정원</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            {currentPrograms.length > 0 ? (
              currentPrograms.map((p, index) => (
                <tr key={p.id}>
                  <td>{indexOfFirst + index + 1}</td>
                  <td
                    className={styles.nameText}
                    onClick={() => navigate(`/admin/program/${p.id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    {p.name}
                  </td>
                  <td>{p.period}</td>
                  <td>{p.facility}</td>
                  <td>{p.capacity}</td>
                  <td>
                    <span
                      className={styles.statusBadge}
                      style={{
                        backgroundColor: statusColorMap[p.status] || "#777",
                      }}
                    >
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className={styles.noData}>
                  프로그램 정보가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>

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
