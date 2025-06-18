// Redirect Snowflake SDK logs to stderr
const originalStdoutWrite = process.stdout.write;
const snowflakeLogPattern = /^\{"level":|^\[[\d:]+\s+[AP]M\]:/;
// Override stdout.write to redirect Snowflake logs to stderr
process.stdout.write = function (chunk, ...args) {
    const str = chunk.toString();
    // If it looks like a Snowflake log, redirect to stderr
    if (snowflakeLogPattern.test(str)) {
        return process.stderr.write.apply(process.stderr, [chunk, ...args]);
    }
    // Otherwise, use original stdout
    return originalStdoutWrite.apply(process.stdout, [chunk, ...args]);
};
export function silenceSnowflakeLogs() {
    // Set environment variable
    process.env.SF_LOG_LEVEL = 'OFF';
    // The override is already in place
}
//# sourceMappingURL=silence-snowflake.js.map