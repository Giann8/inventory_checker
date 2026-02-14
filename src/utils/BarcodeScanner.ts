import { GS1Data, AIConfig } from '../types/BarcodeTypes';
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
    public static decode(data: string, type: string): string | GS1Data {
        console.log(`Decodifica barcode - Tipo: ${type}, Data: ${data}`);

        // Prova i vari handler nell'ordine
        const handlers = [
            this.handleEAN13Standard,
            this.handleEAN13Extended,
            this.handleCustomText,
            this.handleSeparatorFormat,
            this.handleGs1Weight, // Da implementare se usi GS1
        ];

        for (const handler of handlers) {
            const result = handler(data, type);
            if (result !== null) {
                console.log(`Formato riconosciuto: ${handler.name} → Peso: `, typeof result === 'string' ? result : JSON.stringify(result));
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
            const pesoGrammi = parseInt(pesoStr);

            if (!isNaN(pesoGrammi)) {
                const pesoKg = pesoGrammi / 1000;
                return pesoKg.toFixed(3);
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
    private static handleGs1Weight(rawData: string, type: string): GS1Data {
        const AI_MAP = new Map<string, AIConfig>([
            ['01', { field: 'gtin', length: 14 }],
            ['17', { field: 'expiryDate', length: 6 }],
            ['10', { field: 'lot', variable: true }],
            ['21', { field: 'serial', variable: true }],
        ]);
        const result: any = {};
        let pos = 0;

        while (pos < rawData.length) {
            let config: AIConfig | undefined;
            let aiLen = 0;
            let decimals: number | undefined;

            // Controlla AI peso (310n)
            if (pos + 4 <= rawData.length && rawData.substring(pos, pos + 3) === '310') {
                const decimalChar = rawData[pos + 3];
                if (decimalChar >= '0' && decimalChar <= '9') {
                    config = { field: 'weightKg', length: 6 };
                    decimals = parseInt(decimalChar);
                    aiLen = 4;
                }
            }

            // Altrimenti cerca AI standard
            if (!config && pos + 4 <= rawData.length) {
                config = AI_MAP.get(rawData.substring(pos, pos + 4));
                if (config) aiLen = 4;
            }

            if (!config && pos + 2 <= rawData.length) {
                config = AI_MAP.get(rawData.substring(pos, pos + 2));
                if (config) aiLen = 2;
            }

            if (!config) {
                pos++;
                continue;
            }

            pos += aiLen;

            if (config.variable) {
                // Per campi variabili, cerca il prossimo AI
                let end = rawData.length - pos;

                for (let i = 1; i <= rawData.length - pos; i++) {
                    const checkPos = pos + i;

                    // Controlla se inizia un nuovo AI
                    if (checkPos + 3 <= rawData.length &&
                        rawData.substring(checkPos, checkPos + 3) === '310' &&
                        checkPos + 4 <= rawData.length &&
                        rawData[checkPos + 3] >= '0' &&
                        rawData[checkPos + 3] <= '9') {
                        end = i;
                        break;
                    }

                    if (checkPos + 4 <= rawData.length && AI_MAP.has(rawData.substring(checkPos, checkPos + 4))) {
                        end = i;
                        break;
                    }

                    if (checkPos + 2 <= rawData.length && AI_MAP.has(rawData.substring(checkPos, checkPos + 2))) {
                        end = i;
                        break;
                    }
                }

                result[config.field] = rawData.substring(pos, pos + end);
                pos += end;

            } else if (config.length) {
                if (pos + config.length > rawData.length) break;

                const value = rawData.substring(pos, pos + config.length);

                if (decimals !== undefined) {
                    result[config.field] = parseInt(value) / Math.pow(10, decimals);
                    result.weightDecimals = decimals;
                } else {
                    result[config.field] = value;
                }

                pos += config.length;
            }
        }

        return result;
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
