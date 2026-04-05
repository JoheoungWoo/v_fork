// 메인 페이지를 구성하는 각 섹션 컴포넌트들을 불러옵니다.
import HeroSection from "@/components/main/HeroSection";
import CoreFeaturesSection from "@/components/main/CoreFeaturesSection";
import AboutSection from "@/components/main/AboutSection";
import RoadmapSection from "@/components/main/RoadmapSection";
import CtaSection from "@/components/main/CtaSection";

/**
 * 메인 랜딩 페이지 컴포넌트
 * 조립된 5개의 하위 컴포넌트를 순서대로 렌더링합니다.
 */
export default function MainPage() {
  return (
    <div className="bg-background text-on-background font-body w-full">
      {/* 1. 상단 인트로 영역: 플랫폼의 핵심 메시지와 비주얼 요소 (AI 기술 소개 등) */}
      <HeroSection />

      {/* 2. 핵심 기능 영역: AI 기반 문제 생성, 오답 분석 등 주요 서비스 4가지 특징 설명 */}
      <CoreFeaturesSection />

      {/* 3. 서비스 소개 및 신뢰도 영역: 기술적 공신력, 전문가 검수 프로세스, 커리어 로드맵 안내 */}
      <AboutSection />

      {/* 4. 서비스 로드맵 영역: 현재 Beta 테스트부터 정식 오픈까지의 타임라인 */}
      <RoadmapSection />

      {/* 5. 하단 CTA(Call to Action) 영역: 사용자에게 무료 체험이나 제휴 제안서 다운로드를 유도하는 버튼 */}
      <CtaSection />
    </div>
  );
}
