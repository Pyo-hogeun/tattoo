const shopProperties = {
  _id: { type: 'string', example: '66b1e29af0bf4fe4a1c08431' },
  name: { type: 'string', example: '눈썹미소 강남점' },
  address: { type: 'string', example: '서울특별시 강남구 테헤란로 123' },
  cityProvince: { type: 'string', example: '서울특별시', default: '서울특별시' },
  district: { type: 'string', example: '강남구' },
  town: { type: 'string', example: '역삼동' },
  addressDetail: { type: 'string', example: '3층 301호' },
  city: { type: 'string', example: '서울' },
  phone: { type: 'string', example: '02-1234-5678' },
  description: { type: 'string', example: '자연눈썹 전문 매장입니다.' },
  sourceName: { type: 'string', example: 'manual', default: 'manual' },
  sourceUrl: { type: 'string', format: 'uri' },
  externalId: { type: 'string', example: 'kakao:123456' },
  homepage: { type: 'string', format: 'uri' },
  instagram: { type: 'string', format: 'uri' },
  kakaoChannel: { type: 'string', format: 'uri' },
  tags: { type: 'array', items: { type: 'string' }, example: ['자연눈썹', '반영구'] },
  businessHours: { type: 'string', example: '10:00-20:00' },
  businessHoursDetail: { type: 'object', additionalProperties: true },
  bookingNotes: { type: 'string' },
  manualMemo: { type: 'string' },
  raw: { type: 'object', additionalProperties: true },
  dataSourceType: { type: 'string', enum: ['manual', 'crawl'], default: 'manual' },
  isActive: { type: 'boolean', default: true },
  lastScrapedAt: { type: 'string', format: 'date-time' },
  createdAt: { type: 'string', format: 'date-time' },
  updatedAt: { type: 'string', format: 'date-time' }
};

const browShapeProperties = {
  _id: { type: 'string', example: '66b1e29af0bf4fe4a1c08431' },
  name: { type: 'string', example: '아치형 눈썹' },
  imageUrl: { type: 'string', format: 'uri', example: 'https://cdn.example.com/brow-shapes/arch.webp' },
  description: { type: 'string', example: '부드러운 인상의 아치형 눈썹입니다.' },
  isActive: { type: 'boolean', default: true },
  createdAt: { type: 'string', format: 'date-time' },
  updatedAt: { type: 'string', format: 'date-time' }
};

const idParameter = {
  name: 'id',
  in: 'path',
  required: true,
  description: 'MongoDB ObjectId',
  schema: { type: 'string' }
};

const errorResponse = (description) => ({
  description,
  content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } }
});

export const openapiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Eyebrow Backoffice API',
    version: '1.0.0',
    description: '눈썹문신 매장 및 눈썹 형태 데이터를 관리하는 백오피스 API입니다.'
  },
  servers: [{ url: '/', description: '현재 서버' }],
  tags: [
    { name: 'System', description: '서버 상태 확인' },
    { name: 'Shops', description: '매장 관리' },
    { name: 'Brow shapes', description: '눈썹 형태 관리' },
    { name: 'Gallery', description: 'R2 갤러리 이미지 조회' },
    { name: 'Auth', description: '회원가입, 로그인 및 권한 관리' }
  ],
  paths: {
    '/health': {
      get: {
        tags: ['System'], summary: '헬스 체크',
        responses: { 200: { description: '서버가 정상 동작 중입니다.', content: { 'application/json': { schema: { $ref: '#/components/schemas/Health' } } } } }
      }
    },
    '/api/shops': {
      get: {
        tags: ['Shops'], summary: '매장 목록 조회',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, default: 20 } },
          { name: 'search', in: 'query', description: '이름, 주소, 설명 또는 메모 검색어', schema: { type: 'string' } },
          { name: 'city', in: 'query', schema: { type: 'string', example: '서울' } },
          { name: 'district', in: 'query', schema: { type: 'string', example: '강남구' } },
          { name: 'invalidOnly', in: 'query', description: '서울 매장 데이터 검증 실패 항목만 조회', schema: { type: 'boolean' } },
          { name: 'validOnly', in: 'query', description: '서울 매장 데이터 검증 통과 항목만 조회', schema: { type: 'boolean' } }
        ],
        responses: { 200: { description: '매장 목록', content: { 'application/json': { schema: { $ref: '#/components/schemas/ShopList' } } } }, 500: errorResponse('서버 오류') }
      },
      post: {
        tags: ['Shops'], summary: '매장 등록',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ShopInput' } } } },
        responses: { 201: { description: '등록된 매장', content: { 'application/json': { schema: { $ref: '#/components/schemas/Shop' } } } }, 400: errorResponse('서울 매장 데이터 검증 실패'), 500: errorResponse('서버 오류') }
      }
    },
    '/api/shops/{id}': {
      put: {
        tags: ['Shops'], summary: '매장 수정', description: '유효성 검증을 위해 매장 필수 위치 정보를 포함한 전체 값을 전송합니다.', parameters: [idParameter],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ShopInput' } } } },
        responses: { 200: { description: '수정된 매장', content: { 'application/json': { schema: { $ref: '#/components/schemas/Shop' } } } }, 400: errorResponse('서울 매장 데이터 검증 실패'), 404: errorResponse('매장을 찾을 수 없음'), 500: errorResponse('서버 오류') }
      },
      delete: { tags: ['Shops'], summary: '매장 삭제', parameters: [idParameter], responses: { 204: { description: '삭제 완료' }, 404: errorResponse('매장을 찾을 수 없음'), 500: errorResponse('서버 오류') } }
    },
    '/api/brow-shapes': {
      get: { tags: ['Brow shapes'], summary: '눈썹 형태 목록 조회', responses: { 200: { description: '눈썹 형태 목록', content: { 'application/json': { schema: { $ref: '#/components/schemas/BrowShapeList' } } } }, 500: errorResponse('서버 오류') } },
      post: {
        tags: ['Brow shapes'], summary: '눈썹 형태 등록', description: 'JSON으로 imageUrl을 전송하거나 multipart/form-data의 image 파일을 전송할 수 있습니다.',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/BrowShapeInput' } }, 'multipart/form-data': { schema: { $ref: '#/components/schemas/BrowShapeMultipartInput' } } } },
        responses: { 201: { description: '등록된 눈썹 형태', content: { 'application/json': { schema: { $ref: '#/components/schemas/BrowShape' } } } }, 500: errorResponse('서버 오류') }
      }
    },
    '/api/brow-shapes/{id}': {
      put: {
        tags: ['Brow shapes'], summary: '눈썹 형태 수정', parameters: [idParameter],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/BrowShapeInput' } }, 'multipart/form-data': { schema: { $ref: '#/components/schemas/BrowShapeMultipartInput' } } } },
        responses: { 200: { description: '수정된 눈썹 형태', content: { 'application/json': { schema: { $ref: '#/components/schemas/BrowShape' } } } }, 404: errorResponse('눈썹 형태를 찾을 수 없음'), 500: errorResponse('서버 오류') }
      },
      delete: { tags: ['Brow shapes'], summary: '눈썹 형태 삭제', parameters: [idParameter], responses: { 204: { description: '삭제 완료' }, 404: errorResponse('눈썹 형태를 찾을 수 없음'), 500: errorResponse('서버 오류') } }
    },
    '/api/gallery': {
      get: {
        tags: ['Gallery'], summary: 'R2 갤러리 이미지 전체 조회',
        description: 'Cloudflare R2 버킷의 gallery/ 접두사 아래에 있는 모든 파일을 최신 수정 순으로 반환하며, DB에 등록된 파일은 매장명과 게시 정보를 포함합니다.',
        responses: {
          200: { description: '갤러리 이미지 목록', content: { 'application/json': { schema: { $ref: '#/components/schemas/R2GalleryList' } } } },
          503: errorResponse('R2 환경 변수 미설정'),
          500: errorResponse('서버 오류')
        }
      }
    },
    '/api/auth/test/signup': {
      post: {
        tags: ['Auth'], summary: '테스트 전용 ID/PW 회원가입',
        description: 'ENABLE_TEST_AUTH=true인 로컬/테스트 환경에서만 사용할 수 있습니다.',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/TestSignUpInput' } } } },
        responses: { 201: { description: '가입 및 로그인 완료' }, 400: errorResponse('입력값 오류'), 404: errorResponse('테스트 인증 비활성화'), 409: errorResponse('중복 ID 또는 매장') }
      }
    },
    '/api/auth/kakao/user/signup': {
      post: {
        tags: ['Auth'], summary: '일반 사용자 카카오 회원가입',
        description: '매장 파트너 회원가입과 분리된 일반 사용자 계정을 생성합니다. 매장 정보는 필요하지 않습니다.',
        responses: { 201: { description: '일반 사용자 가입 완료' }, 400: errorResponse('카카오 인증 오류'), 409: errorResponse('이미 가입한 일반 사용자') }
      }
    },
    '/api/auth/kakao/user/login': {
      post: { tags: ['Auth'], summary: '일반 사용자 카카오 로그인', responses: { 200: { description: '로그인 완료' }, 400: errorResponse('카카오 인증 오류'), 404: errorResponse('가입되지 않은 사용자') } }
    },
    '/api/auth/user/me': {
      get: { tags: ['Auth'], summary: '일반 사용자 세션 조회', responses: { 200: { description: '현재 일반 사용자' }, 401: errorResponse('인증 필요') } },
      delete: { tags: ['Auth'], summary: '일반 사용자 계정 삭제', responses: { 204: { description: '계정 및 상호작용 삭제 완료' }, 401: errorResponse('인증 필요') } }
    },
    '/api/interactions': {
      get: { tags: ['Gallery'], summary: '내 상호작용 목록', parameters: [{ name: 'type', in: 'query', schema: { type: 'string', enum: ['like', 'bookmark'] } }, { name: 'targetId', in: 'query', schema: { type: 'string' } }], responses: { 200: { description: '상호작용 목록' }, 401: errorResponse('일반 사용자 인증 필요') } },
      post: { tags: ['Gallery'], summary: '상호작용 생성', description: '좋아요 생성 응답에는 전체 likesCount가 포함됩니다.', requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/InteractionInput' } } } }, responses: { 201: { description: '상호작용 생성 또는 기존 항목 반환' }, 400: errorResponse('입력값 오류'), 401: errorResponse('일반 사용자 인증 필요') } },
      delete: { tags: ['Gallery'], summary: '대상 기준 상호작용 취소', description: 'targetType, targetId, type으로 본인의 상호작용을 취소합니다. 좋아요 취소 응답에는 전체 likesCount가 포함됩니다.', parameters: [{ name: 'targetType', in: 'query', schema: { type: 'string', enum: ['gallery'], default: 'gallery' } }, { name: 'targetId', in: 'query', required: true, schema: { type: 'string' } }, { name: 'type', in: 'query', required: true, schema: { type: 'string', enum: ['like', 'bookmark'] } }], responses: { 200: { description: '취소 완료' }, 400: errorResponse('입력값 오류'), 401: errorResponse('일반 사용자 인증 필요') } }
    },
    '/api/interactions/{id}': {
      delete: { tags: ['Gallery'], summary: '내 상호작용 삭제', parameters: [idParameter], responses: { 204: { description: '삭제 완료' }, 401: errorResponse('일반 사용자 인증 필요'), 404: errorResponse('상호작용을 찾을 수 없음') } }
    },
    '/api/auth/test/login': {
      post: {
        tags: ['Auth'], summary: '테스트 전용 ID/PW 로그인',
        description: 'ENABLE_TEST_AUTH=true인 로컬/테스트 환경에서만 사용할 수 있습니다.',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/TestLoginInput' } } } },
        responses: { 200: { description: '로그인 완료' }, 401: errorResponse('잘못된 ID 또는 비밀번호'), 404: errorResponse('테스트 인증 비활성화') }
      }
    },
    '/api/auth/users': {
      get: {
        tags: ['Auth'], summary: '사용자 목록 조회', description: 'master 또는 admin 권한이 필요합니다.',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
          { name: 'search', in: 'query', description: '닉네임 또는 로그인 ID 검색', schema: { type: 'string' } },
          { name: 'role', in: 'query', schema: { type: 'string', enum: ['master', 'admin', 'manager'] } }
        ],
        responses: { 200: { description: '사용자 목록', content: { 'application/json': { schema: { $ref: '#/components/schemas/UserList' } } } }, 401: errorResponse('인증 필요'), 403: errorResponse('권한 없음') }
      }
    },
    '/api/auth/customers': {
      get: { tags: ['Auth'], summary: '일반 사용자 관리 목록', description: 'master 또는 admin 권한이 필요합니다.', parameters: [{ name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } }, { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } }, { name: 'search', in: 'query', description: '닉네임 검색', schema: { type: 'string' } }], responses: { 200: { description: '일반 사용자 목록' }, 401: errorResponse('인증 필요'), 403: errorResponse('권한 없음') } }
    },
    '/api/auth/customers/{id}': {
      get: { tags: ['Auth'], summary: '일반 사용자 관리 상세', parameters: [idParameter], responses: { 200: { description: '일반 사용자 상세' }, 404: errorResponse('일반 사용자를 찾을 수 없음') } },
      patch: { tags: ['Auth'], summary: '일반 사용자 정보 수정', description: '닉네임과 활성 상태를 수정합니다.', parameters: [idParameter], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { nickname: { type: 'string' }, isActive: { type: 'boolean' } } } } } }, responses: { 200: { description: '수정된 일반 사용자' }, 400: errorResponse('입력값 오류'), 404: errorResponse('일반 사용자를 찾을 수 없음') } },
      delete: { tags: ['Auth'], summary: '일반 사용자 계정 삭제', description: '계정과 해당 상호작용을 함께 삭제합니다.', parameters: [idParameter], responses: { 204: { description: '삭제 완료' }, 404: errorResponse('일반 사용자를 찾을 수 없음') } }
    },
    '/api/auth/users/{id}': {
      get: { tags: ['Auth'], summary: '사용자 상세 조회', description: 'master 또는 admin 권한이 필요합니다.', parameters: [idParameter], responses: { 200: { description: '사용자 상세' }, 404: errorResponse('사용자를 찾을 수 없음') } },
      patch: { tags: ['Auth'], summary: '사용자 정보 수정', description: '닉네임, 권한, 활성 상태를 수정합니다. admin은 master 계정을 수정하거나 master 권한을 부여할 수 없습니다.', parameters: [idParameter], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UserUpdateInput' } } } }, responses: { 200: { description: '수정된 사용자' }, 400: errorResponse('입력값 오류'), 403: errorResponse('권한 없음'), 404: errorResponse('사용자를 찾을 수 없음') } },
      delete: { tags: ['Auth'], summary: '사용자 계정 삭제', description: 'master/admin이 사용자를 삭제합니다. admin은 master를 삭제할 수 없고 마지막 활성 master는 삭제할 수 없습니다.', parameters: [idParameter], responses: { 204: { description: '삭제 완료' }, 400: errorResponse('마지막 master 삭제 불가'), 403: errorResponse('권한 없음'), 404: errorResponse('사용자를 찾을 수 없음') } }
    },
    '/api/auth/me': {
      delete: { tags: ['Auth'], summary: '내 계정 삭제', description: '로그인한 본인의 백오피스 계정을 삭제합니다. 마지막 활성 master는 삭제할 수 없습니다.', responses: { 204: { description: '삭제 완료' }, 400: errorResponse('마지막 master 삭제 불가'), 401: errorResponse('인증 필요') } }
    }
  },
  components: {
    schemas: {
      Health: { type: 'object', required: ['ok', 'time'], properties: { ok: { type: 'boolean', example: true }, time: { type: 'string', format: 'date-time' } } },
      Error: { type: 'object', required: ['message'], properties: { message: { type: 'string' }, errors: { type: 'array', items: { type: 'string' } } } },
      Shop: { type: 'object', required: ['_id', 'name', 'district'], properties: shopProperties },
      ShopInput: { type: 'object', required: ['name', 'district'], properties: shopProperties },
      ShopList: { type: 'object', required: ['items', 'total', 'page', 'limit', 'totalPages'], properties: { items: { type: 'array', items: { $ref: '#/components/schemas/Shop' } }, total: { type: 'integer' }, page: { type: 'integer' }, limit: { type: 'integer' }, totalPages: { type: 'integer' } } },
      BrowShape: { type: 'object', required: ['_id', 'name', 'imageUrl'], properties: browShapeProperties },
      BrowShapeInput: { type: 'object', required: ['name', 'imageUrl'], properties: browShapeProperties },
      BrowShapeMultipartInput: { type: 'object', required: ['name'], properties: { name: browShapeProperties.name, imageUrl: browShapeProperties.imageUrl, description: browShapeProperties.description, isActive: { type: 'boolean', default: true }, image: { type: 'string', format: 'binary', description: 'JPEG, PNG, WebP 또는 GIF (최대 10MB)' } } },
      BrowShapeList: { type: 'object', required: ['items', 'total'], properties: { items: { type: 'array', items: { $ref: '#/components/schemas/BrowShape' } }, total: { type: 'integer' } } },
      R2GalleryImage: { type: 'object', required: ['key', 'url', 'size', 'publisherName', 'publishedAt', 'title', 'description', 'likesCount'], properties: { key: { type: 'string', example: 'gallery/example.webp' }, url: { type: 'string', format: 'uri' }, size: { type: 'integer', minimum: 0, description: '파일 크기(byte)' }, lastModified: { type: 'string', format: 'date-time' }, etag: { type: 'string' }, publisherName: { type: 'string', nullable: true, description: '게시 매장명' }, publishedAt: { type: 'string', format: 'date-time', nullable: true, description: '게시일' }, title: { type: 'string', nullable: true, description: '작품 제목' }, description: { type: 'string', nullable: true, description: '작품 설명' }, likesCount: { type: 'integer', minimum: 0, description: '전체 일반 사용자의 좋아요 합계' } } },
      R2GalleryList: { type: 'object', required: ['items', 'total'], properties: { items: { type: 'array', items: { $ref: '#/components/schemas/R2GalleryImage' } }, total: { type: 'integer' } } },
      TestLoginInput: { type: 'object', required: ['loginId', 'password'], properties: { loginId: { type: 'string', minLength: 4, maxLength: 40 }, password: { type: 'string', minLength: 8 } } },
      TestSignUpInput: { type: 'object', required: ['loginId', 'password'], description: 'manager 역할은 shopName, address, phone도 필수이며 admin/master 역할에는 매장 정보가 필요하지 않습니다.', properties: { loginId: { type: 'string', pattern: '^[a-z0-9._-]{4,40}$' }, password: { type: 'string', minLength: 8 }, nickname: { type: 'string' }, role: { type: 'string', enum: ['master', 'admin', 'manager'], default: 'manager' }, shopName: { type: 'string' }, address: { type: 'string' }, phone: { type: 'string' } } },
      ManagedUser: { type: 'object', required: ['id', 'role', 'isActive', 'createdAt', 'updatedAt'], properties: { id: { type: 'string' }, nickname: { type: 'string' }, loginId: { type: 'string', nullable: true }, kakaoId: { type: 'string', nullable: true }, role: { type: 'string', enum: ['master', 'admin', 'manager'] }, shop: { $ref: '#/components/schemas/Shop' }, isActive: { type: 'boolean' }, createdAt: { type: 'string', format: 'date-time' }, updatedAt: { type: 'string', format: 'date-time' } } },
      UserList: { type: 'object', required: ['items', 'total', 'page', 'limit', 'totalPages'], properties: { items: { type: 'array', items: { $ref: '#/components/schemas/ManagedUser' } }, total: { type: 'integer' }, page: { type: 'integer' }, limit: { type: 'integer' }, totalPages: { type: 'integer' } } },
      UserUpdateInput: { type: 'object', properties: { nickname: { type: 'string' }, role: { type: 'string', enum: ['master', 'admin', 'manager'] }, isActive: { type: 'boolean' } } },
      InteractionInput: { type: 'object', required: ['targetId', 'type'], properties: { targetType: { type: 'string', enum: ['gallery'], default: 'gallery' }, targetId: { type: 'string', example: 'gallery/example.webp' }, type: { type: 'string', enum: ['like', 'bookmark'] } } }
    }
  }
};
