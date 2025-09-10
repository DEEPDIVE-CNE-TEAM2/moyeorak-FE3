import React, { useState, useEffect } from "react";
import { getCloudWatchMetrics, getAccessToken } from "../Api"; 
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const CloudWatchDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 로그인 여부 확인
  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const metricsPayload = {
        namespace: "AWS/EC2",
        metricName: "CPUUtilization",
        dimensions: { InstanceId: "i-090af70deaf158865" },
        stat: "Average",
        period: 300,
        startTime: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        endTime: new Date().toISOString(),
      };

      const metricsData = await getCloudWatchMetrics(metricsPayload);

      const chartData = metricsData.timestamps.map((t, i) => ({
        time: new Date(t).toLocaleTimeString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        value: metricsData.values[i],
      }));

      setMetrics(chartData);
    } catch (error) {
      console.error("데이터 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  // 로그인 상태일 때만 자동 실행
  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
    }
  }, [isLoggedIn]);

  return (
    <div style={{ padding: "20px", backgroundColor: "#f9fafb", borderRadius: "12px" }}>
      <h2 style={{ fontSize: "24px", fontWeight: "bold", color: "#333" }}>
        AWS CloudWatch 대시보드
      </h2>
      <p style={{ fontSize: "16px", marginBottom: "20px" }}>
        EC2 인스턴스 CPU Utilization 모니터링
      </p>

      <div
        style={{
          marginTop: "20px",
          height: "400px",
          backgroundColor: "#fff",
          border: "1px solid #ddd",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "10px",
        }}
      >
        {!isLoggedIn ? (
          <p style={{ fontSize: "18px", color: "#999" }}>
            로그인 후 확인하실 수 있습니다.
          </p>
        ) : loading ? (
          <p>불러오는 중...</p>
        ) : metrics ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={metrics}>
              <CartesianGrid stroke="#eee" />
              <XAxis dataKey="time" />
              <YAxis domain={[0, "auto"]} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#4f46e5"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p>데이터 없음</p>
        )}
      </div>
    </div>
  );
};

export default CloudWatchDashboard;
