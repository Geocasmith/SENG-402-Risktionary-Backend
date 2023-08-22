import fs from 'fs';

interface LogData {
    tag: string;
    timestamp: Date;
    username: string;
    studentId: string;
    description?: string;  // optional description
}

export const logToFile = (logData: LogData): void => {
    const logString = `[${logData.tag}] {${logData.timestamp.toISOString()}} (${logData.username}, ${logData.studentId}) ${logData.description ? logData.description : ''}`;
    fs.appendFile('events.log', logString + '\n', err => {
        if (err) console.error('Error writing to log:', err);
    });
}
