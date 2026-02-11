import { Model } from "@nozbe/watermelondb";
import { field, relation, text, writer } from "@nozbe/watermelondb/decorators";
import { syncAfterChange } from "../Middleware/supabase_sync";
class PesoStandard extends Model {
    static table = "pesi_standard";

    static associations = {
        prodotto: { type: 'belongs_to', key: 'product_id' },
    };
    
    // Definizione dei campi del modello
    @relation('prodotti', 'product_id') prodotto;
    @text('product_id') productId;
    @field('peso') peso;
    @text('descrizione') descrizione;
    @field('is_default') isDefault;

    @writer async deletePesoStandard() {
        try {
            await this.markAsDeleted(); // Soft delete
            await syncAfterChange();
        } catch (error) {
            console.error('Errore eliminazione peso standard:', error);
            throw error; // Rilancia l'errore per handling upstream
        }
    }
    @writer async updatePreferito(){
        await this.update(pesoStandard=>{
            pesoStandard.isDefault = true;
        })
        await syncAfterChange();
    }
}

export default PesoStandard;