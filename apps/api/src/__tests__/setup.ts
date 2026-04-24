// apps/api/src/__tests__/setup.ts
process.env.DATABASE_URL = 'postgresql://u:p@h:5432/d';
process.env.JWT_ACCESS_SECRET =
  'test-access-secret-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
process.env.JWT_REFRESH_SECRET =
  'test-refresh-secret-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
process.env.CORS_ORIGIN = 'http://localhost:3000';
