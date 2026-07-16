import path from 'node:path';
import { defineConfig } from 'prisma/config';

const connectionString = process.env.DATABASE_URL || 'postgresql://securelens:securelens@localhost:5433/securelens';

export default defineConfig({
  schema: path.join(__dirname, 'prisma/schema.prisma'),
  datasource: {
    url: connectionString,
  },
});
