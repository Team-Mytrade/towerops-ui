import { BUILD_INFO } from '../app/core/config/build-info.generated';

export const environment = {
  production: true,

  apiBaseUrl: 'http://193.181.209.14:8787/api/v1',

//   websocketUrl: 'http://193.181.209.14:8787/ws',

  app: {
    internalName: 'towerops-ui',
    displayName: 'TowerOps',
    version: BUILD_INFO.build,
    build: BUILD_INFO.generatedAt
  },

  features: {
    demoMode: false,
    websocket: true,
    auditLogs: true,
    systemHealth: true
  }
} as const;