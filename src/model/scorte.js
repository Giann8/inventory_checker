import { Model } from "@nozbe/watermelondb";
import { date, field, text, writer } from "@nozbe/watermelondb/decorators";
class Scorte extends Model {
    static table = "scorte";

    static associations = {
        prodotti: { type: 'belongs_to', foreignKey: 'product_id' },
    };

    @text('product_id') productId;
    @field('quantita_in_linea') quantitaInLinea;
    @field('quantita_in_magazzino_sigillato') quantitaInMagazzinoSigillato;
    @field('quantita_in_magazzino_aperto') quantitaInMagazzinoAperto;
    @date('created_at') createdAt;
    @date('updated_at') updatedAt;

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
}

export default Scorte;