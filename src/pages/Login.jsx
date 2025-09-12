import { useState } from "react";
import styles from "../styles/Login.module.css";
import { FaUser } from "react-icons/fa";
import { TbLockPassword } from "react-icons/tb";
import { login, getUserInfo } from "../Api";
import { useNavigate } from "react-router-dom";
import Logo from "../img/아이콘최종.png";

const Login = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await login(form.email, form.password);

      const userInfo = await getUserInfo();

      if (userInfo) {
        sessionStorage.setItem("userInfo", JSON.stringify(userInfo));
      } else {
        sessionStorage.setItem("userInfo", JSON.stringify({ regionId: 1 }));
      }

      const storedUserInfo = JSON.parse(sessionStorage.getItem("userInfo"));

      const localRegionId = storedUserInfo?.regionId || 1;

      const regionMap = {
        1: "jung",
        2: "seongdong",
        3: "songpa",
      };

      const regionPath = regionMap[localRegionId] || "jung";

      navigate(`/${regionPath}`);
    } catch (error) {
      console.error("로그인 실패:", error.response?.data || error.message);
      alert(
        error.response?.data?.message ||
        "로그인에 실패했습니다. 이메일 또는 비밀번호를 확인해주세요."
      );
    }
  };

  return (
    <div className={styles.container}>
      <img src={Logo} alt="모여락" className={styles.logo} />

      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.label}>이메일</label>
        <div className={styles.inputWithIcon}>
          <input
            type="email"
            name="email"
            placeholder="이메일 입력"
            value={form.email}
            onChange={handleChange}
            className={styles.input}
            autoComplete="username"
            required
          />
          <FaUser className={styles.iconInside} />
        </div>

        <label className={styles.label}>비밀번호</label>
        <div className={styles.inputWithIcon}>
          <input
            type="password"
            name="password"
            placeholder="비밀번호 입력"
            value={form.password}
            onChange={handleChange}
            className={styles.input}
            autoComplete="current-password"
            required
          />
          <TbLockPassword className={styles.iconInside} />
        </div>

        <div className={styles.forgotPassword}>
          <a href="/forgot-password">비밀번호를 잊으셨나요?</a>
        </div>

        <button type="submit" className={styles.submitBtn}>
          로그인
        </button>
      </form>

      <div className={styles.signUpLink}>
        아직 계정이 없으신가요?{" "}
        <a href="/joinMembership">회원가입하기</a>
      </div>
    </div>
  );
};

export default Login;