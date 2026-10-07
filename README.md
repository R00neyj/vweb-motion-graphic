# vweb-motion-graphic

브이웹(V WEB) 소개 + 딩딩파파.com 사례로 **관리자 로그인 후 사이트에서 직접 수정하는 기능**을 안내하는 모션그래픽 영상.

- 결과물: `out/vweb_motion.mp4` (1920×1080 · 30fps · 1분 45초 · 무음)
- 구성: 인트로 → 브이웹 소개 → STEP 01~07(로그인 · 수정모드 · 글자 · 이미지 · 대표번호 · 링크 · 슬라이드/게시판) → 안전장치·저장 → 관리자 페이지 → 아웃트로

## 구조
| 경로 | 내용 |
|---|---|
| `video/index.html` · `style.css` · `main.js` | 장면 마크업 + GSAP 타임라인 (`window.__seek(t)`로 프레임 단위 제어) |
| `assets/` | 사이트 캡처 크롭 · 프로젝트 카드 · 클라이언트 로고 |
| `fonts/` | SUIT · Pretendard · Montserrat (OFL) |
| `scripts/render.mjs` | 로컬 서버 → Playwright 프레임 캡처 → ffmpeg 인코딩 |
| `scripts/capture.mjs` | 사이트 전체 페이지 캡처 |

## 렌더
```bash
npm install
npx playwright install chromium   # 브라우저 없을 때
npm run render                    # out/vweb_motion.mp4 생성 (ffmpeg 필요)
npm run snap -- 12 43.5 60        # 특정 시점 스틸 → out/snaps/
```
문구·타이밍은 `video/main.js`의 각 장면 함수(S1~S14)에서 수정.
