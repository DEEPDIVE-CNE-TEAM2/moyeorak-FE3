import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/VerifyPhone.module.css";

const VerifyPhone = () => {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const navigate = useNavigate();

  const handleSendCode = () => {
    alert("인증번호를 전송했습니다.");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("인증되었습니다.\n임시 비밀번호가 이메일로 발급되었습니다.");
    navigate("/login"); 
  };

  return (
    <div className={styles.container}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <div className={styles.header}>
          <span className={styles.title}>휴대폰 번호 인증</span>
        </div>
        <hr className={styles.divider} />

        <div className={styles.phoneRow}>
          <label className={styles.label}>휴대폰 번호</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={styles.input}
            placeholder="휴대폰 번호 입력"
            required
          />
          <button
            type="button"
            onClick={handleSendCode}
            className={styles.sendBtn}
          >
            인증번호 받기
          </button>
        </div>

        <div className={styles.codeRow}>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className={styles.input}
            placeholder="인증번호 입력"
            required
          />
        </div>
      </form>

      <button className={styles.nextBtn} onClick={handleSubmit}>
        다음
      </button>
    </div>
  );
};

export default VerifyPhone;
