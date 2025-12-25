# Mark-it Server

> NestJS + TypeScript로 구축된 북마크 관리 백엔드 API

게스트 사용자와 이메일 인증을 통한 등록 사용자를 모두 지원하며, 북마크를 카테고리와 태그로 분류하여 정리할 수 있습니다. 또한 오프라인 모드를 지원하며, AI 검색 시스템을 적용하여 편리한 사용자 경험을 제공합니다.

## 🚀 시작하기

### 사전 요구사항

- Node.js 24.11.1 이상
- npm 11.7.0 이상
- PostgreSQL 12 이상

### 설치 및 실행

```bash
# 저장소 클론
git clone <repository-url>
cd markit-server

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.dev
cp .env.example .env.prod
# .env.dev 파일을 열어 데이터베이스 정보 등을 수정

# 데이터베이스 마이그레이션
npm run migration:run

# 개발 서버 시작
npm run start:dev
```

서버가 `http://localhost:3000`에서 실행됩니다.

### 환경 설정

#### 환경 변수

1. **초기 설정:**

   ```bash
   cp .env.example .env.dev
   cp .env.example .env.prod
   ```

2. **환경 변수 파일 구조:**
   - `.env.dev` - 개발 환경 설정
   - `.env.prod` - 프로덕션 환경 설정
   - `.env.example` - 템플릿 파일 (git에 커밋됨)

3. **주요 환경 변수:**

   ```env
   # 데이터베이스
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=yourpassword
   DB_NAME=markit_dev

   # JWT
   JWT_SECRET=your-secret-key
   JWT_EXPIRES_IN=1h

   # 이메일
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   ```

4. **환경 선택:**
   - 개발: `NODE_ENV=dev npm run start:dev`
   - 프로덕션: `NODE_ENV=prod npm run start:prod`

#### 데이터베이스 설정

**PostgreSQL 데이터베이스 생성:**

```bash
# PostgreSQL 접속
psql -U postgres

# 데이터베이스 생성
CREATE DATABASE markit_dev;

# 종료
\q
```

## 📦 기술 스택

- **언어:** TypeScript 5.7.3
- **Node.js**: 24.11.1
- **프레임워크:** NestJS 11.0.1
- **데이터베이스:** PostgreSQL (pg 8.16.3), TypeORM 0.3.27
- **인증:** Passport 0.7.0, JWT (@nestjs/jwt 11.0.1), bcrypt 6.0.0
- **이메일:** Nodemailer 7.0.11
- **Web Scraping:** Axios 1.13.2, Cheerio 1.1.2
- **패키지 매니저:** npm 11.7.0

## 📁 프로젝트 구조

```
src/
├── common/                  # 공통 유틸리티
│   └── helpers/             # 헬퍼 함수
│       └── authorization.helper.ts  # 권한 검증 헬퍼
├── res/                     # 리소스 모듈
│   ├── auth/                # 인증 및 이메일 서비스
│   │   ├── guards/          # JWT, Local 가드
│   │   ├── strategies/      # Passport 전략
│   │   └── email.service.ts # Nodemailer 이메일 발송
│   ├── user/                # 사용자 CRUD
│   ├── bookmark/            # 북마크 CRUD
│   ├── category/            # 카테고리 CRUD
│   ├── tag/                 # 태그 CRUD
│   ├── entities/            # TypeORM 엔티티
│   └── common/              # 공통 인터셉터
├── decorators/              # 커스텀 데코레이터
├── migrations/              # 데이터베이스 마이그레이션
├── app.module.ts            # 루트 모듈
└── main.ts                  # 진입점 (포트 3000)
```

## 🛠️ 개발 스크립트

**앱 실행:**

```bash
npm run start:dev          # watch 모드로 개발 서버 실행
npm run start:debug        # 디버거와 함께 실행
npm run start:prod         # 프로덕션 모드로 실행
```

**빌드 및 코드 품질:**

```bash
npm run build              # 애플리케이션 빌드
npm run lint               # ESLint 실행 (자동 수정)
npm run format             # Prettier로 코드 포맷팅
npm run lint:fix           # ESLint + Prettier 모두 실행
```

**테스트:**

```bash
npm test                   # 유닛 테스트 실행
npm run test:watch         # watch 모드로 테스트 실행
npm run test:cov           # 커버리지와 함께 테스트 실행
npm run test:e2e           # E2E 테스트 실행
```

## 🗄️ 데이터베이스 마이그레이션

### 마이그레이션 워크플로우

```bash
# 1. 엔티티 수정 후 마이그레이션 생성
npm run migration:generate -- -n MigrationName

# 2. 생성된 마이그레이션 파일 확인
# src/migrations/ 디렉토리에서 확인

# 3. 마이그레이션 실행
npm run migration:run

# 4. 마이그레이션 롤백 (필요시)
npm run migration:revert
```

**⚠️ 중요:**
- TypeORM CLI는 기본적으로 `.env.dev`를 로드하는 `data-source.ts`를 사용합니다
- **절대 사용 금지:** `npm run schema:sync` (프로덕션 데이터 손실 위험)

## 🔌 API 엔드포인트

모든 엔드포인트는 `/api` 접두사를 사용합니다.

**인증 (Auth):**
- `POST /api/auth/send-code` - 인증 코드 발송
- `POST /api/auth/verify-code` - 인증 코드 검증
- `POST /api/auth/login` - 이메일 로그인
- `POST /api/auth/refresh` - 액세스 토큰 갱신

**사용자 (User):**
- `POST /api/user/guest` - 게스트 사용자 등록
- `POST /api/user/check-email` - 이메일 중복 확인
- `POST /api/user/register` - 이메일 회원가입

**북마크 (Bookmark):**
- `GET /api/bookmarks` - 북마크 목록 조회 (페이지네이션)
- `POST /api/bookmarks` - 북마크 생성
- `GET /api/bookmarks/:id` - 북마크 상세 조회
- `PATCH /api/bookmarks/:id` - 북마크 수정
- `DELETE /api/bookmarks/:id` - 북마크 삭제

**카테고리 (Category):**
- `GET /api/categories` - 카테고리 목록 조회
- `POST /api/categories` - 카테고리 생성
- `PATCH /api/categories/:id` - 카테고리 수정
- `DELETE /api/categories/:id` - 카테고리 삭제

**태그 (Tag):**
- `GET /api/tags` - 태그 목록 조회
- `POST /api/tags` - 태그 생성
- `PATCH /api/tags/:id` - 태그 수정
- `DELETE /api/tags/:id` - 태그 삭제

자세한 API 문서는 추후 Swagger를 통해 제공될 예정입니다.

## 🛠️ 트러블슈팅

### 데이터베이스 연결 실패

**증상:** 서버 시작 시 데이터베이스 연결 오류

**해결:**
1. PostgreSQL이 실행 중인지 확인
   ```bash
   # Windows
   services.msc에서 postgresql 서비스 확인

   # Mac/Linux
   sudo service postgresql status
   ```
2. `.env.dev` 파일의 데이터베이스 정보 확인
3. 데이터베이스가 생성되어 있는지 확인

### 마이그레이션 실패

**증상:** `npm run migration:run` 실행 시 오류

**해결:**
```bash
# 데이터베이스 초기화 후 재실행
psql -U postgres -d markit_dev -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
npm run migration:run
```

### 이메일 발송 실패

**증상:** 인증 코드 발송 시 오류

**해결:**
1. `.env.dev` 파일의 이메일 설정 확인
2. Gmail 사용 시 "앱 비밀번호" 생성 필요
   - Google 계정 > 보안 > 2단계 인증 > 앱 비밀번호
3. `EMAIL_PASSWORD`에 앱 비밀번호 입력

## 📚 참고 자료

**공식 문서:**

- [NestJS 공식 문서](https://docs.nestjs.com/)
- [TypeORM 공식 문서](https://typeorm.io/)
- [PostgreSQL 공식 문서](https://www.postgresql.org/docs/)

**프로젝트 관련:**

- AI 작업 가이드: [CLAUDE.md](./CLAUDE.md)
- API 문서: (추가 예정)
- 프론트엔드 저장소: (추가 예정)

## 🤝 기여하기

### Git 워크플로우

**브랜치 전략:**

- `main`: 프로덕션 배포 브랜치 (보호됨)
- `develop`: 개발 통합 브랜치
- `feature/*`: 새로운 기능 개발
- `bugfix/*`: 버그 수정
- `hotfix/*`: 긴급 수정

**커밋 메시지 규칙 (Conventional Commits):**

```
<타입>(<범위>): <제목>

<본문>

<푸터>
```

**타입:**
- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서 변경
- `style`: 코드 포맷팅 (기능 변경 없음)
- `refactor`: 리팩토링
- `test`: 테스트 추가/수정
- `chore`: 빌드, 패키지 매니저 설정

**예시:**
```
feat(bookmark): 북마크 태그 필터링 기능 추가

- 태그별 북마크 필터링 API 엔드포인트 구현
- 태그 조합 검색 로직 추가
- 성능 최적화를 위한 인덱스 추가

Closes #123
```

**PR 규칙:**

- 제목: `[타입] 간결한 설명` (예: `[Feat] 북마크 삭제 기능`)
- 설명: 변경 사항, 테스트 방법 포함
- 리뷰어: 최소 1명 승인 필요
- CI 통과 후 머지

### 개발 규칙

프로젝트의 상세한 개발 규칙, 아키텍처, 코딩 가이드는 [CLAUDE.md](./CLAUDE.md)를 참고하세요.

## 📝 현재 개발 상태

**활성 브랜치:** `main`

**구현 완료:**

- 게스트 사용자 등록
- 이메일 회원가입 및 로그인
- 이메일 중복 확인
- 인증 코드 발송 및 검증
- 액세스 토큰 갱신
- 게스트 데이터 마이그레이션
- 북마크 CRUD (생성, 조회, 수정, 삭제, 페이지네이션)
- 카테고리 CRUD
- 태그 CRUD (랜덤 컬러 자동 할당)
- 웹 스크래핑 (북마크 제목 자동 추출)

**진행 중:**

- API 문서화 (Swagger)

**미구현:**

- 오프라인 북마크 기능
- AI 검색 기능
- 소셜 로그인 (Google, Apple)

## 📄 라이선스

0BSD
