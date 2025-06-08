import moment from 'moment';

export const formatTimestamp = (timestamp: number, format = 'MMMM DD, YYYY [at] hh:mm A'): string => {
  return moment.unix(timestamp).format(format);
};

export const formatTimestampDetailed = (timestamp: number): string => {
  return moment.unix(timestamp).format('MMMM DD, YYYY [at] hh:mm:ss A');
};

export const formatTimestampRelative = (timestamp: number): string => {
  return moment.unix(timestamp).fromNow();
};

export const formatTimestampSafe = (
  timestamp: number | null | undefined,
  fallbackTimestamp?: number | null | undefined,
  format = 'MMMM DD, YYYY [at] hh:mm A'
): string => {
  const validTimestamp = timestamp || fallbackTimestamp || 0;
  return validTimestamp ? formatTimestamp(validTimestamp, format) : '';
};
