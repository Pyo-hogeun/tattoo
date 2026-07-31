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
    { name: 'Gallery', description: 'R2 갤러리 이미지 조회' }
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
        description: 'Cloudflare R2 버킷의 gallery/ 접두사 아래에 있는 모든 파일을 최신 수정 순으로 반환합니다.',
        responses: {
          200: { description: '갤러리 이미지 목록', content: { 'application/json': { schema: { $ref: '#/components/schemas/R2GalleryList' } } } },
          503: errorResponse('R2 환경 변수 미설정'),
          500: errorResponse('서버 오류')
        }
      }
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
      R2GalleryImage: { type: 'object', required: ['key', 'url', 'size'], properties: { key: { type: 'string', example: 'gallery/example.webp' }, url: { type: 'string', format: 'uri' }, size: { type: 'integer', minimum: 0, description: '파일 크기(byte)' }, lastModified: { type: 'string', format: 'date-time' }, etag: { type: 'string' } } },
      R2GalleryList: { type: 'object', required: ['items', 'total'], properties: { items: { type: 'array', items: { $ref: '#/components/schemas/R2GalleryImage' } }, total: { type: 'integer' } } }
    }
  }
};
