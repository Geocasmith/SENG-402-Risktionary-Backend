// import fs from 'fs';
// import { logToFile, logEvent } from './../src/util/logger';
// import 'jest';

// // Mocking fs.appendFile
// jest.mock('fs', () => ({
//     appendFile: jest.fn(),
//     ...jest.requireActual('fs') 
// }));

// interface LogData {
//     tag: string;
//     timestamp: Date;
//     username: string;
//     studentId: string;
//     description?: string;  // optional description
// }

// describe('Logger Tests', () => {
//     beforeEach(() => {
//         // Clear all instances and calls to constructor and all methods:
//         (fs.appendFile as any as jest.Mock).mockClear();
//     });

//     test('logToFile should write correctly formatted string to file', () => {
//         const sampleLog: LogData = {
//             tag: 'TestTag',
//             timestamp: new Date('2023-10-16T12:00:00Z'),
//             username: 'testUser',
//             studentId: '12345',
//             description: 'This is a test'
//         };

//         logToFile(sampleLog);
//         const expectedLogString = `[TestTag] {2023-10-16T12:00:00.000Z} (testUser, 12345) This is a test\n`;

//         // expect(fs.appendFile).toHaveBeenCalledWith('events.log', expectedLogString, expect.any(Function));
//     });

//     test('logEvent should call logToFile with correct parameters', () => {
//         logEvent('TestEvent', 'testUser', '12345', 'Event Description');

//         expect(fs.appendFile).toHaveBeenCalled();
//     });

//     test('logToFile should handle errors correctly', () => {
//         (fs.appendFile as any as jest.Mock).mockImplementationOnce((path, data, callback) => {
//             callback(new Error('Test Error'));
//         });

//         console.error = jest.fn();

//         logToFile({
//             tag: 'ErrorTest',
//             timestamp: new Date(),
//             username: 'testUser',
//             studentId: '12345'
//         });

//         expect(console.error).toHaveBeenCalledWith('Error writing to log:', new Error('Test Error'));
//     });
// });
