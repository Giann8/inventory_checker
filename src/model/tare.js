import { Model } from "@nozbe/watermelondb";
import { field, text, writer } from "@nozbe/watermelondb/decorators";

class Tare extends Model {
    static table = "tare";

    @text('name') name;
    @field('weight') weight;

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