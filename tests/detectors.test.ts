import { ProcessDetector } from '../src/detectors/processDetector';
import { NetworkDetector } from '../src/detectors/networkDetector';
import { RegistryDetector } from '../src/detectors/registryDetector';

describe('ProcessDetector', () => {
    let processDetector: ProcessDetector;

    beforeEach(() => {
        processDetector = new ProcessDetector();
    });

    test('should detect remote desktop processes', () => {
        const result = processDetector.detectProcesses();
        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
    });

    test('should identify if remote desktop is active', () => {
        const isActive = processDetector.isRemoteDesktopActive();
        expect(typeof isActive).toBe('boolean');
    });
});

describe('NetworkDetector', () => {
    let networkDetector: NetworkDetector;

    beforeEach(() => {
        networkDetector = new NetworkDetector();
    });

    test('should check network connections for remote access services', () => {
        const connections = networkDetector.checkNetworkConnections();
        expect(connections).toBeDefined();
        expect(Array.isArray(connections)).toBe(true);
    });

    test('should identify if remote access service is active', () => {
        const isActive = networkDetector.isRemoteAccessServiceActive();
        expect(typeof isActive).toBe('boolean');
    });
});

describe('RegistryDetector', () => {
    let registryDetector: RegistryDetector;

    beforeEach(() => {
        registryDetector = new RegistryDetector();
    });

    test('should check registry keys for remote desktop software', () => {
        const keys = registryDetector.checkRegistryKeys();
        expect(keys).toBeDefined();
        expect(Array.isArray(keys)).toBe(true);
    });

    test('should identify if remote desktop is configured', () => {
        const isConfigured = registryDetector.isRemoteDesktopConfigured();
        expect(typeof isConfigured).toBe('boolean');
    });
});