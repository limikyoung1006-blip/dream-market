# 드림마켓 (Dream Market) 포인트 시스템

예수인교회를 위한 전용 포인트 결제 시스템입니다.

## 주요 기능
- **이용자**: 고유 QR 코드 생성, 실시간 잔액 확인, 최근 이용 내역 조회
- **매장**: 카메라 기반 QR 스캐너, 포인트 차감 결제 기능
- **관리자**: 회원 관리, 월간 정기 포인트 일괄 충전, 오늘의 거래 통계

## 기술 스택
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **State Management**: Zustand
- **Icons**: Lucide React
- **QR**: html5-qrcode, qrcode.react

## 실행 방법

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

## 시스템 구조
- `src/store/useMarketStore.ts`: 포인트 및 회원 데이터 관리 (Zustand)
- `src/pages/UserPage.tsx`: 이용자용 지갑 및 QR 화면
- `src/pages/StorePage.tsx`: 매장용 결제 스캐너 화면
- `src/pages/AdminPage.tsx`: 관리자용 대시보드 화면
