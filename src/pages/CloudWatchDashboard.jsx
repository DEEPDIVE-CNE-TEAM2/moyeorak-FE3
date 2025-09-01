import React, { useState } from "react";
import { getCloudWatchMetrics, queryCloudWatchLogs } from "../Api";

const CloudWatchDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [logs, setLogs] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // CloudWatch 메트릭 조회 요청 payload
      const payload = {
        namespace: "AWS/EC2",
        metricName: "CPUUtilization",
        startTime: new Date(Date.now() - 3600 * 1000).toISOString(),
        endTime: new Date().toISOString(),
        period: 300,
      };

      const metricsData = await getCloudWatchMetrics(payload);
      setMetrics(metricsData);

      // CloudWatch 로그 조회 요청 payload
      const logsData = await queryCloudWatchLogs({
        logGroupName: "/aws/lambda/my-function",
        startTime: Date.now() - 3600 * 1000,
        endTime: Date.now(),
        queryString: "fields @timestamp, @message | sort @timestamp desc | limit 20",
      });
      setLogs(logsData);

    } catch (error) {
      console.error("데이터 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>CloudWatch 대시보드</h2>
      <button onClick={fetchData} disabled={loading}>
        {loading ? "불러오는 중..." : "데이터 조회"}
      </button>

      <div style={{ marginTop: "20px" }}>
        <h3>메트릭</h3>
        <pre>{metrics ? JSON.stringify(metrics, null, 2) : "데이터 없음"}</pre>
      </div>

      <div style={{ marginTop: "20px" }}>
        <h3>로그</h3>
        <pre>{logs ? JSON.stringify(logs, null, 2) : "데이터 없음"}</pre>
      </div>
    </div>
  );
};

export default CloudWatchDashboard;
