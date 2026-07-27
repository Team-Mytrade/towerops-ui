import { BUILD_INFO } from '../app/core/config/build-info.generated';

export const environment = {
  production: false,

  apiBaseUrl: 'http://193.181.209.14:8787/api/v1',
//   websocketUrl: 'http://193.181.209.14:8787/ws',

  app: {
    internalName: 'towerops-ui',
    displayName: 'TowerOps [STAGING]',
    version: '0.1.0-staging',
    build: BUILD_INFO.build,
    generatedAt: BUILD_INFO.generatedAt
  },

  features: {
    demoMode: false,
    websocket: true,
    auditLogs: true,
    systemHealth: true
  }
} as const;