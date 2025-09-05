import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './PromotionEdit.module.css';
import Navbar from '../../../components/Navbar/Navbar';
import { getPromotionImages, patchMainImage, deleteMainImage } from '../../../Api';

const toggleSwitchStyle = {
  position: 'relative',
  display: 'inline-block',
  width: '40px',
  height: '22px',
};

const sliderStyle = {
  position: 'absolute',
  cursor: 'pointer',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: '#ccc',
  transition: '.4s',
  borderRadius: '34px',
};

const sliderBeforeStyle = {
  position: 'absolute',
  content: '""',
  height: '16px',
  width: '16px',
  left: '3px',
  bottom: '3px',
  backgroundColor: 'white',
  transition: '.4s',
  borderRadius: '50%',
};

const PromotionEdit = () => {
  const [data, setData] = useState([]);
  const [deletedIds, setDeletedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getPromotionImages();

        const sorted = res
          .map(item => ({
            id: item.id,
            displayOrder: item.displayOrder,
            visible: item.isActive ?? item.active ?? false,
            image: item.imageUrl || '',
          }))
          .sort((a, b) => a.displayOrder - b.displayOrder);

        setData(sorted);
      } catch (e) {
        console.error(e);
        alert('홍보물 데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleVisibilityChange = (id, checked) => {
    setData(prev =>
      prev.map(item =>
        item.id === id ? { ...item, visible: checked } : item
      )
    );
  };

  const handleDelete = async (id) => {
    if (window.confirm('삭제하시겠습니까?')) {
      try {
        await deleteMainImage(id);
        alert('삭제되었습니다.');
        setData(prev => prev.filter(item => item.id !== id));
        setDeletedIds(prev => [...prev, id]);
      } catch (error) {
        console.error(error);
        alert('삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const handleSave = async () => {
  try {
    const payload = data.map(item => ({
      id: item.id,
      displayOrder: item.displayOrder,
      isActive: item.visible !== undefined ? item.visible : false,
    }));

    await patchMainImage(payload);
    alert('저장 완료되었습니다.');
    navigate('/admin/post/promotion');
  } catch (error) {
    console.error(error);
    alert('저장 중 오류가 발생했습니다.');
  }
};

  const handleCancel = () => {
    navigate('/admin/post/promotion');
  };

  if (loading) return <div>로딩 중...</div>;

  return (
    <div>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.header}>
          <div></div>
          <div className={styles.buttonGroup}>
            <button className={styles.editBtn} onClick={handleSave}>저장</button>
            <button className={styles.deleteBtn} onClick={handleCancel}>취소</button>
          </div>
        </div>

        <table className={styles.detailTable}>
          <thead>
            <tr>
              <th>순서</th>
              <th>이미지</th>
              <th>표시 여부</th>
              <th>삭제</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id}>
                <td>{item.displayOrder}</td>
                <td>
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={`홍보물 ${item.displayOrder}`}
                      className={styles.imagePreview}
                    />
                  ) : (
                    <div style={{
                      width: 100,
                      height: 60,
                      backgroundColor: '#eee',
                      textAlign: 'center',
                      lineHeight: '60px'
                    }}>
                      이미지 없음
                    </div>
                  )}
                </td>
                <td>
                  <label style={toggleSwitchStyle}>
                    <input
                      type="checkbox"
                      checked={item.visible}
                      onChange={(e) =>
                        handleVisibilityChange(item.id, e.target.checked)
                      }
                      style={{ display: 'none' }}
                    />
                    <span
                      style={{
                        ...sliderStyle,
                        backgroundColor: item.visible ? '#4caf50' : '#ccc',
                      }}
                    >
                      <span
                        style={{
                          ...sliderBeforeStyle,
                          transform: item.visible ? 'translateX(18px)' : 'translateX(0)',
                        }}
                      />
                    </span>
                  </label>
                </td>
                <td>
                  <button
                    className={styles.deleteBtnCustom}
                    onClick={() => handleDelete(item.id)}
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PromotionEdit;
