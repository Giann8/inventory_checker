import { Model } from "@nozbe/watermelondb";
import { field, text, date } from "@nozbe/watermelondb/decorators";
import database from "../db";
import { syncAfterChange } from '../Middleware/supabase_sync';

class Tare extends Model {
    static table = "tare";

    @text('name') name;
    @field('weight') weight;
    @date('created_at') createdAt;
    @date('updated_at') updatedAt;

    static async creaTara(name, weight) {
        try {
            const newTara = await database.write(async () => {
                return await database.get('tare').create(tara => {
                    tara.name = name;
                    tara.weight = Number(weight) || 0;
                });
            });
            
            // Sincronizza dopo la creazione
            await syncAfterChange();
            
            return newTara;
        } catch (error) {
            console.error('Errore creazione tara:', error);
            throw error; // Rilancia l'errore per handling upstream
        }
    }

    static async getAllTare() {
        try {
            const tareList = await database.get('tare').query().fetch();
            return tareList;
        } catch (error) {
            console.error('Errore recupero tare:', error);
            throw error; // Rilancia l'errore per handling upstream
        }
    }

    @writer async deleteTare() {
        try {
            await this.markAsDeleted(); // Soft delete
        } catch (error) {
            console.error('Errore eliminazione tare:', error);
            throw error; // Rilancia l'errore per handling upstream
        }
    }

}

export default Tare;