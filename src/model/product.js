import { Model } from "@nozbe/watermelondb";
import { children, text, writer } from "@nozbe/watermelondb/decorators";
import { Q } from "@nozbe/watermelondb";

class Product extends Model {
    static table = "prodotti";

    static associations = {
        // Define relationships with other tables here
        scorte: { type: 'has_many', foreignKey: 'product_id' },
        peso_standard: { type: 'has_many', foreignKey: 'product_id' },
    };

    @text('name') name;
    @text('type') type;
    @children('scorte') scorte;
    @children('peso_standard') pesoStandard;

    // Metodo dinamico per scorte di oggi (consigliato)
    getScorteDiOggi() {
        const startOfDay = new Date().setHours(0, 0, 0, 0);
        const endOfDay = new Date().setHours(23, 59, 59, 999);
        
        return this.scorte.extend(
            Q.where('date', Q.gte(startOfDay)),
            Q.where('date', Q.lte(endOfDay))
        ).observe();
    }

    // Metodo per ultima scorta registrata
    getUltimaScorta() {
        try {
           return this.scorte.extend(
            Q.sortBy('date', Q.desc),
            Q.take(1)
        ).observe();
        } catch (error) {
            console.error("Errore nel recuperare l'ultima scorta:", error);
            return null;
        }
        
    }

    @writer async creaNuovaScortaVuota() {
        try {
            const newScorta = await this.database.get('scorte').create(scorta => {
                scorta.productId = this.id; // ✅ Assegnazione diretta
                scorta.quantitaInLinea = 0;
                scorta.quantitaInMagazzinoSigillato = 0;
                scorta.quantitaInMagazzinoAperto = 0;
                scorta.date = Date.now(); // ✅ Timestamp
            });
            return newScorta;
        } catch (error) {
            console.error('Errore creazione scorta vuota:', error);
            throw error; // ✅ Rilancia l'errore per handling upstream
        }
    }
    
 

}

export default Product;
