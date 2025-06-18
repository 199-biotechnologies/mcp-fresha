// Redirect Snowflake SDK logs to stderr
const originalStdoutWrite = process.stdout.write;
const snowflakeLogPattern = /^\{"level":|^\[[\d:]+\s+[AP]M\]:/;

// Override stdout.write to redirect Snowflake logs to stderr
process.stdout.write = function(chunk: string | Uint8Array, ...args: any[]): boolean {
  const str = chunk.toString();
  
  // If it looks like a Snowflake log, redirect to stderr
  if (snowflakeLogPattern.test(str)) {
    return process.stderr.write.apply(process.stderr, [chunk, ...args] as any);
  }
  
  // Otherwise, use original stdout
  return originalStdoutWrite.apply(process.stdout, [chunk, ...args] as any);
};

export function silenceSnowflakeLogs() {
  // Set environment variable
  process.env.SF_LOG_LEVEL = 'OFF';
  
  // The override is already in place
}