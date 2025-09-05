/*
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
*/





/*
import React from 'react';

const CloudWatchDashboard = () => {
  const dashboardUrl = "https://cloudwatch.amazonaws.com/dashboard.html?dashboard=goorm-cloudwatch&context=eyJSIjoidXMtZWFzdC0xIiwiRCI6ImN3LWRiLTAwNDQwNzE1NzcwNCIsIlUiOiJ1cy1lYXN0LTFfTDBWYlBja3VSIiwiQyI6Ijc2Mzl2M21kbTc1OXVuYnNlM3I4bHBtZWJmIiwiSSI6InVzLWVhc3QtMToxNTJjMzNkMS1kZjEzLTQ0ZDctOWIwNS04YjEwZDk3ZjI5NWEiLCJNIjoiUHVibGljIn0=";

  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f2f5' }}>
      <h1>AWS CloudWatch 대시보드</h1>
      
      <iframe
        src={dashboardUrl}
        title="AWS CloudWatch Dashboard"
        width="100%"
        height="700px"
        frameBorder="0"
        allowFullScreen
        style={{ border: '1px solid #ddd', borderRadius: '8px' }}
      ></iframe>
    </div>
  );
};

export default CloudWatchDashboard;
*/




import React, { useState } from "react";
import { getCloudWatchMetrics, queryCloudWatchLogs } from "../Api";

const CloudWatchDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [logs, setLogs] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // =========================
      // CloudWatch 메트릭 조회 payload
      // =========================
      const metricsPayload = {
        namespace: "AWS/EC2",
        metricName: "CPUUtilization",
        startTime: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        endTime: new Date().toISOString(),
        period: 300,
      };

      console.log("📌 요청 보낼 metrics payload:", metricsPayload);

      const metricsData = await getCloudWatchMetrics(metricsPayload);
      console.log("📌 수신한 metricsData:", metricsData);
      setMetrics(metricsData);

      // =========================
      // CloudWatch 로그 조회 payload
      // =========================
      const logPayload = {
        logGroupNames: ["/aws/ec2/myapp"], 
        startTime: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        endTime: new Date().toISOString(),
        queryString: "fields @timestamp, @message | sort @timestamp desc | limit 20",
      };

      // 타입과 값 확인
      console.log("startTime 타입:", typeof logPayload.startTime, "값:", logPayload.startTime);
      console.log("endTime 타입:", typeof logPayload.endTime, "값:", logPayload.endTime);
      console.log("📌 요청 보낼 logs payload:", logPayload);

      const logsData = await queryCloudWatchLogs(logPayload);
      console.log("📌 수신한 logsData:", logsData);
      setLogs(logsData);

    } catch (error) {
      console.error("❌ 데이터 조회 실패:", error);
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
