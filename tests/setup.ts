import type { Mock } from 'vitest';

// Typed storage area mock that returns Record instead of void
interface StorageAreaMock {
  get: Mock<any[], Record<string, unknown>>;
  set: Mock<any[], void>;
}

interface ChromeMock {
  storage: {
    sync: StorageAreaMock;
    local: StorageAreaMock;
    onChanged: { addListener: Mock };
  };
  runtime: {
    sendMessage: Mock;
    getURL: Mock;
    onMessage: { addListener: Mock };
    onInstalled: { addListener: Mock };
  };
  alarms: {
    create: Mock;
    onAlarm: { addListener: Mock };
  };
  tabs: {
    create: Mock;
  };
}

// Minimal Chrome API mock for unit tests
const chromeMock: ChromeMock = {
  storage: {
    sync: {
      get: vi.fn().mockResolvedValue({}),
      set: vi.fn().mockResolvedValue(undefined),
    },
    local: {
      get: vi.fn().mockResolvedValue({}),
      set: vi.fn().mockResolvedValue(undefined),
    },
    onChanged: {
      addListener: vi.fn(),
    },
  },
  runtime: {
    sendMessage: vi.fn().mockResolvedValue(undefined),
    getURL: vi.fn((path: string) => `chrome-extension://test-id/${path}`),
    onMessage: {
      addListener: vi.fn(),
    },
    onInstalled: {
      addListener: vi.fn(),
    },
  },
  alarms: {
    create: vi.fn(),
    onAlarm: {
      addListener: vi.fn(),
    },
  },
  tabs: {
    create: vi.fn().mockResolvedValue({}),
  },
};

// @ts-expect-error chrome is not typed for test context
global.chrome = chromeMock;
