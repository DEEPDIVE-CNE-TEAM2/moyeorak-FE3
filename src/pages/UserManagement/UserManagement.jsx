import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./UserManagement.module.css";
import AdminNavbar from "../../components/Navbar/Navbar";
import UserDetailModal from "./UserDetailModal/UserDetailModal";
import { fetchAdminUsers, fetchAdminUserDetail } from "../../Api";

const ITEMS_PER_PAGE = 10;

const formatDate = (dateString) => {
  if (!dateString) return "-";
  return dateString.slice(0, 10);
};

export default function UserManagement() {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    const loadMembers = async () => {
      try {
        const data = await fetchAdminUsers();

        const transformed = data.map((user) => ({
          id: user.id,
          name: user.name,
          gender: user.gender,
          email: user.email,
          address: user.region || "-",
          joinDate: formatDate(user.createdAt),
          regionId: user.regionId || 0,
        }));
        setMembers(transformed);
      } catch (e) {
        alert("회원 정보를 불러오는 데 실패했습니다.");
      }
    };

    loadMembers();
  }, []);

  useEffect(() => {
    let filtered = members;
    if (searchText.trim()) {
      filtered = filtered.filter(
        (m) =>
          (m.name || "").includes(searchText) ||
          (m.gender || "").includes(searchText) ||
          (m.email || "").includes(searchText) ||
          (m.address || "").includes(searchText) ||
          (m.joinDate || "").includes(searchText)
      );
    }
    setFilteredMembers(filtered);
    setCurrentPage(1);
  }, [searchText, members]);

  const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentMembers = filteredMembers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleUpdateUser = (updatedUser) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === updatedUser.id ? updatedUser : m))
    );
    setSelectedMember(null);
  };

  const handleMemberClick = async (member) => {
    try {
      const detail = await fetchAdminUserDetail(member.id);
      setSelectedMember({
        ...member,
        ...detail,
        joinDate: formatDate(detail.createdAt),
      });
    } catch (error) {
      alert("회원 상세 정보를 불러오는 데 실패했습니다.");
      console.error(error);
    }
  };

  return (
    <>
      <AdminNavbar />

      <div className={styles.container}>
        <div className={styles.filterRow}>
          <input
            type="text"
            placeholder="검색"
            className={styles.searchInput}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />

          <button
            className={styles.newUserBtn}
            onClick={() => navigate("/admin/member/add")}
          >
            신규등록
          </button>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>이름</th>
              <th>성별</th>
              <th>이메일</th>
              <th>주소</th>
              <th>가입일</th>
            </tr>
          </thead>
          <tbody>
            {currentMembers.length > 0 ? (
              currentMembers.map((m) => (
                <tr key={m.id}>
                  <td>{m.id}</td>
                  <td
                    className={styles.nameText}
                    onClick={() => handleMemberClick(m)}
                  >
                    {m.name}
                  </td>
                  <td>{m.gender}</td>
                  <td>{m.email}</td>
                  <td>{m.address || "-"}</td>
                  <td>{m.joinDate}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className={styles.noData}>
                  회원 정보가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className={styles.pagination}>
          {[...Array(totalPages)].map((_, idx) => {
            const pageNum = idx + 1;
            return (
              <button
                key={pageNum}
                className={`${styles.pageBtn} ${
                  pageNum === currentPage ? styles.activePage : ""
                }`}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </button>
            );
          })}
        </div>
      </div>

      {selectedMember && (
        <UserDetailModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
          onSave={handleUpdateUser}
        />
      )}
    </>
  );
}
