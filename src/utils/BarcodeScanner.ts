/**
 * Classe per decodificare diversi formati di barcode e estrarre informazioni come il peso
 */
export class BarcodeScanner {
    /**
     * Decodifica un barcode e ne estrae il peso se disponibile
     * @param data - Il contenuto del barcode scansionato
     * @param type - Il tipo di barcode (ean13, code128, etc)
     * @returns Il peso estratto come stringa, o null se non riconosciuto
     */
    public static decode(data: string, type: string): string | null {
        console.log(`Decodifica barcode - Tipo: ${type}, Data: ${data}`);

        // Prova i vari handler nell'ordine
        const handlers = [
            this.handleEAN13Standard,
            this.handleEAN13Extended,
            this.handleCustomText,
            this.handleSeparatorFormat,
            this.handlePureNumeric,
        ];

        for (const handler of handlers) {
            const result = handler(data, type);
            if (result !== null) {
                console.log(`Formato riconosciuto: ${handler.name} → Peso: ${result}`);
                return result;
            }
        }

        console.warn('Nessun formato riconosciuto per:', data);
        return null;
    }

    /**
     * EAN-13 standard con peso variabile (inizia con 2)
     * Formato: 2PPPPPWWWWWC dove WWWWW è il peso in grammi
     * Esempio: 2123450156782 → peso 01567 → 1567
     */
    private static handleEAN13Standard(data: string, type: string): string | null {
        if (data.length === 13 && data.startsWith('2')) {
            const pesoStr = data.substring(7, 12);
            const peso = parseInt(pesoStr);
            
            if (!isNaN(peso)) {
                return peso.toString();
            }
        }
        return null;
    }

    /**
     * EAN-13 esteso con categorie (inizia con 20-29)
     * Alcune catene usano 20, 21, 22, etc per categorizzare prodotti
     * Formato: 2XPPPPPWWWWWC
     */
    private static handleEAN13Extended(data: string, type: string): string | null {
        if (data.length === 13 && /^2[0-9]/.test(data)) {
            const pesoStr = data.substring(7, 12);
            const peso = parseInt(pesoStr);
            
            if (!isNaN(peso)) {
                return peso.toString();
            }
        }
        return null;
    }

    /**
     * Formato testuale con prefisso
     * Formato: PESO1234 o WEIGHT1234
     * Esempio: PESO1560 → 1560
     */
    private static handleCustomText(data: string, type: string): string | null {
        const match = data.match(/^(PESO|WEIGHT)(\d+)$/i);
        if (match) {
            return match[2];
        }
        return null;
    }

    /**
     * Formato con separatore
     * Formato: P-1234, W-1234, PESO-1234
     * Esempio: P-1560 → 1560
     */
    private static handleSeparatorFormat(data: string, type: string): string | null {
        const match = data.match(/^[PW](?:ESO)?[-_](\d+)$/i);
        if (match) {
            return match[1];
        }
        return null;
    }

    /**
     * Barcode puramente numerico di lunghezza specifica
     * Formato: 12345678 (8 cifre = tutto peso)
     * Personalizzabile in base alle tue esigenze
     */
    private static handlePureNumeric(data: string, type: string): string | null {
        // Esempio: barcode di esattamente 8 cifre
        if (/^\d{8}$/.test(data)) {
            return data;
        }
        
        // Esempio: barcode di 6 cifre
        if (/^\d{6}$/.test(data)) {
            return data;
        }
        
        return null;
    }

    /**
     * Aggiunge un nuovo handler personalizzato
     * Utile per estendere la classe con formati specifici
     */
    public static addCustomHandler(
        handler: (data: string, type: string) => string | null
    ): void {
        // In futuro si potrebbe implementare un sistema di plugin
        console.log('Custom handler aggiunto (da implementare)');
    }
}
