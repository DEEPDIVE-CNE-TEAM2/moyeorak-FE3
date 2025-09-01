// CloudFront CDN 도메인 (S3 원본 대신 여기를 써야 보안정책 통과)
const CDN_BASE_URL = "https://www.moyeorak.cloud";

/**
 * 이미지 경로를 CloudFront URL로 변환
 * - S3 URL, 상대경로, 절대경로 모두 CloudFront를 사용
 * - S3 경로는 파일명만 추출하여 CloudFront /img/ 경로로 매핑
 */
export const getFullImageUrl = (path) => {
  if (!path) return "";

  // 이미 절대경로인 경우
  if (path.startsWith("http://") || path.startsWith("https://")) {
    // S3 URL이면 CloudFront로 변환
    if (path.includes("s3-goorm-frontend.s3.ap-northeast-2.amazonaws.com")) {
      const filename = path.split("/").pop();
      return `${CDN_BASE_URL}/img/${filename}`;
    }
    // 이미 CloudFront 또는 다른 외부 URL이면 그대로 반환
    return encodeURI(path);
  }

  // '/img/'로 시작하는 경우 → CloudFront 경로로 합치기
  if (path.startsWith("/img/")) {
    return encodeURI(`${CDN_BASE_URL}${path}`);
  }

  // 그 외 (상대경로) → 파일명만 추출해서 CloudFront /img/ 로 매핑
  const filename = path.split("/").pop();
  return encodeURI(`${CDN_BASE_URL}/img/${filename}`);
};
