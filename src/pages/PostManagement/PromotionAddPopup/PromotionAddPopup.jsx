import React, { useState } from "react";
import { IoMdClose } from "react-icons/io";
import styles from "./PromotionAddPopup.module.css";
import { uploadPromotionImage } from "../../../Api";

const PromotionAddPopup = ({ onClose, onSave }) => {
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 이미지 선택 시 미리보기 설정
  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {

      console.log("[handleImageChange] 선택된 파일:", selectedFile);
      console.log("[handleImageChange] MIME 타입:", selectedFile.type); // ✅ 여기 추가
      setFile(selectedFile);

      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(selectedFile);

      setMessage("");
    }
  };

  // 이미지 삭제
  const handleDelete = () => {
    setFile(null);
    setImagePreview(null);
  };

  // 저장 버튼 클릭 시
  const handleSave = async () => {
    if (!file) {
      setMessage("이미지를 등록해주세요.");
      return;
    }

    setIsLoading(true);
    try {
      // Presigned URL + S3 업로드 + 생성 API 호출
      const result = await uploadPromotionImage(file);

      setMessage("홍보물이 등록되었습니다.");

      if (onSave) onSave(result.imageUrl);

      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error(error);
      setMessage("등록 실패. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose}>
          <IoMdClose size={24} />
        </button>

        <h3 className={styles.title}>홍보물 추가</h3>

        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className={styles.fileInput}
        />

        {imagePreview && (
          <img
            src={imagePreview}
            alt="등록된 홍보물"
            className={styles.previewImage}
          />
        )}

        {message && (
          <div
            className={`${styles.message} ${
              message.includes("등록") ? styles.success : styles.error
            }`}
          >
            {message}
          </div>
        )}

        <div className={styles.btnRow}>
          <button
            className={styles.deleteBtn}
            onClick={handleDelete}
            disabled={isLoading}
          >
            삭제
          </button>
        </div>

        <button
          className={`${styles.saveBtn} ${isLoading ? styles.loading : ""}`}
          onClick={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className={styles.spinner}>
              <svg viewBox="0 0 24 24" className={styles.spinnerIcon}>
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  fill="currentColor"
                />
              </svg>
              등록 중...
            </span>
          ) : (
            "저장"
          )}
        </button>
      </div>
    </>
  );
};

export default PromotionAddPopup;
