"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let prisma = null;
try {
    // Require at runtime so project doesn't break if client isn't generated yet
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pkg = require('@prisma/client');
    const { PrismaClient } = pkg;
    prisma = new PrismaClient();
    // eslint-disable-next-line no-console
    console.log('Prisma client initialized');
}
catch (err) {
    // Prisma client not available (not generated) — fall back to null
    // eslint-disable-next-line no-console
    console.log('Prisma client not initialized, continuing with mock stores');
    prisma = null;
}
exports.default = prisma;
