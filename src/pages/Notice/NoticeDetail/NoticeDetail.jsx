import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar/Navbar";
import { fetchNoticeDetail } from "../../../Api";
import styles from "./NoticeDetail.module.css";

export default function NoticeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNotice = async () => {
      try {
        const data = await fetchNoticeDetail(id);
        setNotice(data);
      } catch (err) {
        console.error("공지사항 상세조회 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    loadNotice();
  }, [id]);

  if (loading) return <div className={styles.loading}>로딩중...</div>;
  if (!notice) return <div className={styles.error}>공지사항을 불러올 수 없습니다.</div>;

  return (
    <>
      <Navbar activeMenu="notice" />

      <div className={styles.container}>
        <table className={styles.noticeTable}>
          <tbody>
            <tr>
              <th className={styles.th}>제목</th>
              <td className={styles.td}>{notice.title}</td>
            </tr>
            <tr>
              <th className={styles.th}>등록일</th>
              <td className={styles.td}>
                {new Date(notice.createdAt).toLocaleDateString()}
              </td>
            </tr>
            <tr>
              <th className={styles.th}>조회수</th>
              <td className={styles.td}>{notice.viewCount}</td>
            </tr>
            <tr>
              <th className={styles.th}>내용</th>
              <td className={styles.content}>{notice.content}</td>
            </tr>
          </tbody>
        </table>

        <div className={styles.btnWrap}>
          <button
            className={styles.backBtn}
            onClick={() => navigate("/notice")}
          >
            목록보기
          </button>
        </div>
      </div>
    </>
  );
}
