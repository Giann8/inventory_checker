import { appSchema, tableSchema } from "@nozbe/watermelondb";

export default appSchema({
    version: 1,
    tables: [
        tableSchema({
            name: "prodotti",
            columns: [
                { name: "name", type: "string" },
                { name: "type", type: "string" }
            ]
        }),
        tableSchema({
            name: "tare",
            columns: [
                { name: "name", type: "string" },
                { name: "weight", type: "number" }
            ]
        }),
        tableSchema({
            name: "scorte",
            columns: [
                { name: "product_id", type: "string", isIndexed: true },
                { name: "quantita_in_linea", type: "number" },
                { name: "quantita_in_magazzino_sigillato", type: "number" },
                { name: "quantita_in_magazzino_aperto", type: "number" },
                { name: "quantita_totale", type: "number" },
                { name: "quantita_scarto", type: "number" },
                { name: "created_at", type: "number" },
                { name: "updated_at", type: "number" }
            ]
        }),
        tableSchema({
            name: "pesi_standard",
            columns: [
                { name: "product_id", type: "string", isIndexed: true },
                { name: "peso", type: "number" },
                { name: "descrizione", type: "string" },
                { name: "is_default", type: "boolean" }
            ]
        })
    ]
});
