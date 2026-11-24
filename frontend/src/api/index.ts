import type { DataSource } from './types';
import { MockDataSource } from './mockDataSource';
import { ApiDataSource } from './apiDataSource';

// Switch between mock and real hardware API via single env var
const dataSourceType = import.meta.env.VITE_DATA_SOURCE || 'mock';

export const dataSource: DataSource =
  dataSourceType === 'api' ? new ApiDataSource() : new MockDataSource();

export * from './types';
