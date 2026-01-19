import { useEffect } from 'react';

/**
 * ScannerService - Handles barcode scanner input
 * Most USB scanners act as a keyboard. This service listens for rapid keystrokes.
 */

export const useScanner = (onScan: (barcode: string) => void) => {
    useEffect(() => {
        let barcode = '';
        let lastKeyTime = 0;

        const handleKeyDown = (e: KeyboardEvent) => {
            const currentTime = Date.now();

            // Scanners typically send characters very fast (e.g., < 50ms between keys)
            if (currentTime - lastKeyTime > 50) {
                barcode = ''; // Reset if too slow (likely manual typing)
            }

            if (e.key === 'Enter') {
                if (barcode.length > 3) {
                    onScan(barcode);
                    barcode = '';
                }
            } else if (e.key.length === 1) {
                barcode += e.key;
            }

            lastKeyTime = currentTime;
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onScan]);
};
