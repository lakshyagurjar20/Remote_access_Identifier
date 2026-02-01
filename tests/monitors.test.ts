import { ContinuousMonitor } from '../src/monitors/continuousMonitor';
import { SessionMonitor } from '../src/monitors/sessionMonitor';

describe('Monitors', () => {
    let continuousMonitor: ContinuousMonitor;
    let sessionMonitor: SessionMonitor;

    beforeEach(() => {
        continuousMonitor = new ContinuousMonitor();
        sessionMonitor = new SessionMonitor();
    });

    afterEach(() => {
        continuousMonitor.stopMonitoring();
        sessionMonitor.endSessionMonitoring();
    });

    test('should start and stop continuous monitoring', () => {
        continuousMonitor.startMonitoring();
        expect(continuousMonitor.isMonitoring).toBe(true);
        
        continuousMonitor.stopMonitoring();
        expect(continuousMonitor.isMonitoring).toBe(false);
    });

    test('should start and end session monitoring', () => {
        sessionMonitor.startSessionMonitoring();
        expect(sessionMonitor.isMonitoring).toBe(true);
        
        sessionMonitor.endSessionMonitoring();
        expect(sessionMonitor.isMonitoring).toBe(false);
    });
});