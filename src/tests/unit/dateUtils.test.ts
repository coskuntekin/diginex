import { describe, it, expect } from 'vitest';
import {
  formatTimestamp,
  formatTimestampDetailed,
  formatTimestampRelative,
  formatTimestampSafe
} from '@/utils/dateUtils';

describe('dateUtils', () => {
  const testTimestamp = 1640995200; // January 1, 2022 00:00:00 UTC

  describe('formatTimestamp', () => {
    it('should format timestamp with default format', () => {
      const result = formatTimestamp(testTimestamp);
      expect(result).toMatch(/January 01, 2022 at \d{2}:\d{2} [AP]M/);
    });

    it('should format timestamp with custom format', () => {
      const result = formatTimestamp(testTimestamp, 'YYYY-MM-DD');
      expect(result).toBe('2022-01-01');
    });

    it('should handle different timestamp values', () => {
      const result = formatTimestamp(0, 'YYYY');
      expect(result).toBe('1970');
    });
  });

  describe('formatTimestampDetailed', () => {
    it('should format timestamp with detailed format including seconds', () => {
      const result = formatTimestampDetailed(testTimestamp);
      expect(result).toMatch(/January 01, 2022 at \d{2}:\d{2}:\d{2} [AP]M/);
    });
  });

  describe('formatTimestampRelative', () => {
    it('should return relative time string', () => {
      const result = formatTimestampRelative(testTimestamp);
      expect(result).toMatch(/ago$/);
    });

    it('should handle recent timestamps', () => {
      const recentTimestamp = Math.floor(Date.now() / 1000) - 60; // 1 minute ago
      const result = formatTimestampRelative(recentTimestamp);
      expect(result).toMatch(/minute/);
    });
  });

  describe('formatTimestampSafe', () => {
    it('should format valid timestamp', () => {
      const result = formatTimestampSafe(testTimestamp);
      expect(result).toMatch(/January 01, 2022 at \d{2}:\d{2} [AP]M/);
    });

    it('should use fallback timestamp when main timestamp is null', () => {
      const fallbackTimestamp = testTimestamp;
      const result = formatTimestampSafe(null, fallbackTimestamp);
      expect(result).toMatch(/January 01, 2022 at \d{2}:\d{2} [AP]M/);
    });

    it('should return empty string when both timestamps are null', () => {
      const result = formatTimestampSafe(null, null);
      expect(result).toBe('');
    });

    it('should return empty string when timestamp is 0 and no fallback', () => {
      const result = formatTimestampSafe(0);
      expect(result).toBe('');
    });

    it('should use custom format', () => {
      const result = formatTimestampSafe(testTimestamp, null, 'YYYY-MM-DD');
      expect(result).toBe('2022-01-01');
    });
  });
});
