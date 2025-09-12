const CDN_BASE_URL = "https://www.moyeorak.cloud";

export const getFullImageUrl = (path) => {
  if (!path) return "";

  // 이미 절대경로이면 처리
  if (path.startsWith("http://") || path.startsWith("https://")) {
    // S3 URL이면 CloudFront로 변환
    if (path.includes("s3-goorm-frontend.s3.ap-northeast-2.amazonaws.com")) {
      const filename = path.split("/").pop();
      return `${CDN_BASE_URL}/img/${filename}`;
    }
    // 이미 CloudFront나 다른 외부 URL이면 그대로 반환
    return encodeURI(path);
  }

  // '/img/' 로 시작하면 CDN_BASE_URL과 결합
  if (path.startsWith("/img/")) {
    return encodeURI(`${CDN_BASE_URL}${path}`);
  }

  // '/' 없는 상대경로면 '/' 추가 후 파일명만 사용
  const filename = path.split("/").pop();
  return encodeURI(`${CDN_BASE_URL}/img/${filename}`);
};

