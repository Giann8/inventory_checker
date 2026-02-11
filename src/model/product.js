import { Model } from "@nozbe/watermelondb";
import { children, date, text, writer } from "@nozbe/watermelondb/decorators";
import { Q } from "@nozbe/watermelondb";
import database from "../db";
import { syncAfterChange } from "../Middleware/supabase_sync";
class Product extends Model {
    static table = "prodotti";

    static associations = {
        // Define relationships with other tables here
        scorte: { type: 'has_many', foreignKey: 'product_id' },
        pesi_Standard: { type: 'has_many', foreignKey: 'product_id' },
    };

    @text('name') name;
    @text('type') type;
    @date('created_at') createdAt;
    @date('updated_at') updatedAt;
    @children('scorte') scorte;
    @children('pesi_standard') pesiStandard;


    /**
     * Crea un nuovo record prodotto nel database
     * @param {String} name - Nome del prodotto
     * @param {String} type - Tipo del prodotto
     * @returns {Model} - Il nuovo prodotto creato
     */
    static async creaProdotto(name, type) {
        try {
            const isDuplicate = (await database.get('prodotti').query(Q.where('name', name)).fetch()).length > 0;
            if (isDuplicate) {
                throw new Error('Prodotto duplicato');
            }
            const newProduct = await database.write(async () => {
                return await database.get('prodotti').create(prodotto => {
                    prodotto.name = name;
                    prodotto.type = type;
                    prodotto.createdAt = new Date();
                    prodotto.updatedAt = new Date();
                });
            });
            
            // Sincronizza dopo la creazione
            await syncAfterChange();
            
            return newProduct;
        } catch (error) {
            console.error('Errore creazione prodotto:', error);
            throw error; // Rilancia l'errore per handling upstream
        }
    }

    /**
     * elimina un prodotto dal database
     * @param {Product} prodotto 
     */
    static async eliminaProdotto(prodotto) {
        try {
            await database.write(async () => {
                const prod = await database.get('prodotti').find(prodotto.id);
                await prod.markAsDeleted(); // Soft delete per sync
            });
            
            // Sincronizza dopo l'eliminazione
            await syncAfterChange();
        } catch (error) {
            console.error('Errore eliminazione prodotto:', error);
            throw error; // Rilancia l'errore per handling upstream
        }
    }

    // Metodo dinamico per scorte di oggi (consigliato)
    getScorteDiOggi() {
        const startOfDay = new Date().setHours(0, 0, 0, 0);
        const endOfDay = new Date().setHours(23, 59, 59, 999);

        return this.scorte.extend(
            Q.where('created_at', Q.gte(startOfDay)),
            Q.where('created_at', Q.lte(endOfDay))
        ).observe();
    }

    // Metodo per ultima scorta registrata
    getUltimaScorta() {
        try {
            return this.scorte.extend(
                Q.sortBy('created_at', Q.desc),
                Q.take(1)
            ).observe();
        } catch (error) {
            console.error("Errore nel recuperare l'ultima scorta:", error);
            return null;
        }

    }

    @writer async creaNuovaScortaVuota() {
        try {
            const newScorta = await database.get('scorte').create(scorta => {
                scorta.productId = this.id;
                scorta.quantitaInLinea = 0;
                scorta.quantitaInMagazzinoSigillato = 0;
                scorta.quantitaInMagazzinoAperto = 0;
                scorta.quantitaScarto = 0;
                scorta.createdAt = new Date();
                scorta.updatedAt = new Date();
            });
            return newScorta;
        } catch (error) {
            console.error('Errore creazione scorta vuota:', error);
            throw error;
        }
    }

    @writer async aggiungiPesoStandard(peso, descrizione, isDefault = false) {
        try {
            const newPesoStandard = await database.get('pesi_standard').create(pesoStandard => {
                pesoStandard.productId = this.id; // ✅ Assegnazione diretta
                pesoStandard.peso = peso;
                pesoStandard.descrizione = descrizione;
                pesoStandard.isDefault = isDefault;
            });
            return newPesoStandard;
        } catch (error) {
            console.error('Errore aggiunta peso standard:', error);
            throw error; // Rilancia l'errore per handling upstream
        }
    }


}

export default Product;
