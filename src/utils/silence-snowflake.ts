// Silence all Snowflake SDK logging
process.env.SF_LOG_LEVEL = 'OFF';
process.env.SNOWFLAKE_LOG_LEVEL = 'OFF';
process.env.SNOWFLAKE_DISABLE_CONSOLE_LOGGING = 'true';

// Redirect Snowflake SDK logs away from stdout
const originalStdoutWrite = process.stdout.write.bind(process.stdout);
const snowflakeLogPattern = /^\{"level":|^\[[\d:]+\s+[AP]M\]:|snowflake-sdk|Creating Connection|authentication successful/i;

// Override stdout.write to filter out Snowflake logs
(process.stdout as any).write = function(chunk: string | Uint8Array, ...args: any[]): boolean {
  const str = chunk.toString();
  
  // Block all Snowflake SDK logs from stdout
  if (snowflakeLogPattern.test(str)) {
    // Silently discard or optionally redirect to stderr
    // return process.stderr.write.apply(process.stderr, [chunk, ...args] as any);
    return true; // Pretend write succeeded but don't actually write
  }
  
  // Allow JSON-RPC messages and other output
  return originalStdoutWrite(chunk, ...args);
};

export function silenceSnowflakeLogs() {
  // Already configured above
}