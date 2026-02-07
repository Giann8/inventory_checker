import { Model } from "@nozbe/watermelondb";
import { date, field, relation, text, writer } from "@nozbe/watermelondb/decorators";
import database from '../db';

class Scorte extends Model {
    static table = "scorte";

    static associations = {
        prodotti: { type: 'belongs_to', foreignKey: 'product_id' },
    };

    @relation('prodotti', 'product_id') prodotto;
    @text('product_id') productId;
    @field('quantita_in_linea') quantitaInLinea;
    @field('quantita_in_magazzino_sigillato') quantitaInMagazzinoSigillato;
    @field('quantita_in_magazzino_aperto') quantitaInMagazzinoAperto;
    @field('quantita_scarto') quantitaScarto;
    @date('created_at') createdAt;
    @date('updated_at') updatedAt;

    /**
     * Crea una nuova scorta con data e turno personalizzabili
     * @param {string} productId - ID del prodotto
     * @param {number} quantitaInLinea - Quantità in linea
     * @param {number} quantitaInMagazzinoSigillato - Quantità magazzino sigillato
     * @param {number} quantitaInMagazzinoAperto - Quantità magazzino aperto
     * @param {number} quantitaScarto - Quantità di scarto
     * @param {boolean} isMorningShift - true per turno mattina (8:00), false per sera (18:00)
     * @param {Date} data - Data per la scorta (opzionale, default oggi)
     */
    static async creaScorta(productId, quantitaInLinea, quantitaInMagazzinoSigillato, quantitaInMagazzinoAperto, quantitaScarto, isMorningShift = null, data = null) {
        try {
            const newScorta = await database.write(async () => {
                return await database.get('scorte').create(scorta => {
                    scorta.productId = productId;
                    scorta.quantitaInLinea = Number(quantitaInLinea) || 0;
                    scorta.quantitaInMagazzinoSigillato = Number(quantitaInMagazzinoSigillato) || 0;
                    scorta.quantitaInMagazzinoAperto = Number(quantitaInMagazzinoAperto) || 0;
                    scorta.quantitaScarto = Number(quantitaScarto) || 0;

                    // Gestione della data e turno
                    let dataScorta;
                    
                    if (isMorningShift === null) {
                        // Se turno non specificato, usa l'ora attuale
                        dataScorta = new Date();
                    } else {
                        // Usa la data fornita o oggi
                        dataScorta = data ? new Date(data) : new Date();
                        
                        // Imposta l'orario in base al turno
                        if (isMorningShift) {
                            dataScorta.setHours(8, 0, 0, 0); // Turno mattina: 8:00
                        } else {
                            dataScorta.setHours(18, 0, 0, 0); // Turno sera: 18:00
                        }
                    }
                    
                    scorta.createdAt = dataScorta;
                    scorta.updatedAt = new Date();
                });
            });
            return newScorta;
        } catch (error) {
            console.error('Errore creazione scorta:', error);
            throw error;
        }
    }

    get isMorningShift() {
        if (!this.createdAt) return false;
        const hours = new Date(this.createdAt).getHours();
        return hours < 14;
    }

    get quantitaTotale() {
        return this.quantitaInLinea + this.quantitaInMagazzinoSigillato + this.quantitaInMagazzinoAperto;
    }

    /** Aggiorna la quantità della scorta in linea attualmente in uso
     * @param {*} nuovaQuantita 
     */
    @writer async aggiornaScortaInLinea(nuovaQuantita) {
        await this.update(scorta => {
            scorta.quantitaInLinea = nuovaQuantita;
            scorta.updatedAt = new Date();
        });
    }

    /**
     * Aggiorna la quantità della scorta sigillata
     * @param {*} nuovaQuantita 
     */
    @writer async aggiornaScortaSigillata(nuovaQuantita) {
        await this.update(scorta => {
            scorta.quantitaInMagazzinoSigillato = nuovaQuantita;
            scorta.updatedAt = new Date();
        });
    }

    /** update della scorta aperta e inserita nelle gastro, sarà usata
     *  in sostituzione a quella che finirà in linea
     * @param {*} nuovaQuantita
     */
    @writer async aggiornaScortaAperta(nuovaQuantita) {
        await this.update(scorta => {
            scorta.quantitaInMagazzinoAperto = nuovaQuantita;
            scorta.updatedAt = new Date();
        });
    }

    /**
     * Aggiorna la quantità di scarto
     * @param {*} nuovaQuantita
     */
    @writer async aggiornaScortaScarto(nuovaQuantita) {
        await this.update(scorta => {
            scorta.quantitaScarto = nuovaQuantita;
            scorta.updatedAt = new Date();
        });
    }
}

export default Scorte;