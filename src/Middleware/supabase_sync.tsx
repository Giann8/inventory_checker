import { hasUnsyncedChanges, SyncDatabaseChangeSet, synchronize } from '@nozbe/watermelondb/sync'
import database from '../db'
import { createClient } from '@supabase/supabase-js'
import NetInfo from '@react-native-community/netinfo'

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL as string
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_KEY as string

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Controlla se c'è connessione internet
const checkConnection = async (): Promise<boolean> => {
    try {
        const state = await NetInfo.fetch()
        return state.isConnected === true && state.isInternetReachable !== false
    } catch (error) {
        console.log('Impossibile verificare la connessione, assumo offline')
        return false
    }
}

export const syncWithSupabase = async () => {
    await synchronize({
        database,
        pullChanges: async ({ lastPulledAt, schemaVersion, migration }) => {

            console.log('=== PULL START ===')
            console.log('lastPulledAt:', lastPulledAt, 'schemaVersion:', schemaVersion, 'migration:', migration)

            const { data, error } = await supabase.rpc('pull', {
                last_pulled_at: lastPulledAt || 0,
            })

            if (error) {
                console.error('Pull error:', error)
                throw new Error('Failed to pull changes from Supabase: ' + error.message)
            }

            console.log('Raw data from pull:', JSON.stringify(data, null, 2))

            // Gestione risposta
            if (!data) {
                throw new Error('Pull returned null data')
            }

            // Se data è già l'oggetto completo con changes e timestamp
            let changes: SyncDatabaseChangeSet
            let timestamp: number

            if (typeof data === 'object' && 'changes' in data && 'timestamp' in data) {
                changes = data.changes
                timestamp = data.timestamp
                
                // Log dettagliato dei changes
                console.log('Changes structure:')
                Object.keys(changes).forEach(table => {
                    const tableChanges = changes[table];
                    console.log(`  ${table}:`)
                    console.log(`    - created: ${tableChanges.created?.length || 0} records`)
                    console.log(`    - updated: ${tableChanges.updated?.length || 0} records`)
                    console.log(`    - deleted: ${tableChanges.deleted?.length || 0} records`)
                })
            } else {
                // Se data è già il changes object direttamente
                changes = data as SyncDatabaseChangeSet
                timestamp = Date.now()
            }

            // Validazione timestamp
            if (!timestamp || typeof timestamp !== 'number' || timestamp <= 0) {
                console.warn('Invalid timestamp received, using current time')
                timestamp = Date.now()
            }

            console.log('Timestamp:', timestamp)
            console.log('=== PULL END ===')
            return { changes, timestamp }
        },
        pushChanges: async ({ changes, lastPulledAt }) => {
            console.log('=== PUSH START ===')
            console.log('Changes to push:', JSON.stringify(changes, null, 2))
            

            // Rimuovi campi non necessari che potrebbero causare errori di parsing
            const cleanChanges = JSON.parse(JSON.stringify(changes))
            
            const { error } = await supabase.rpc('push', { changes: cleanChanges })
            if (error) {
                console.error('Push error:', error)
                console.error('Changes that failed:', JSON.stringify(cleanChanges, null, 2))
                throw new Error('Failed to push changes to Supabase: ' + error.message)
            }
            console.log('=== PUSH END ===')
        },
        migrationsEnabledAtVersion: 1,
    })
}
// Controlla se ci sono modifiche locali non sincronizzate
export const checkUnsyncedChanges = async (): Promise<boolean> => {
    return await hasUnsyncedChanges({ database });
}

// Sincronizza automaticamente dopo una modifica al database
// Chiamala dopo ogni operazione di CREATE/UPDATE/DELETE
export const syncAfterChange = async () => {
    try {
        // Controlla connessione prima di tentare il sync
        const isConnected = await checkConnection()
        if (!isConnected) {
            console.log('Offline: modifiche salvate localmente, saranno sincronizzate quando tornerà la connessione')
            return // Non lancia errore, le modifiche restano locali
        }

        const hasChanges = await hasUnsyncedChanges({ database });
        if (hasChanges) {
            console.log('Modifiche rilevate, sincronizzazione in corso...');
            await syncWithSupabase();
            console.log('Sincronizzazione completata dopo modifica');
        }
    } catch (error) {
        // Errore silenzioso - l'app continua a funzionare offline
        console.log('Sincronizzazione non riuscita (probabilmente offline), modifiche salvate localmente:', error);
        // Non rilancia l'errore per non bloccare l'utente
    }
}

// Sincronizzazione manuale con feedback per l'utente
export const syncManuale = async (): Promise<{ success: boolean; message: string }> => {
    try {
        console.log('Avvio sincronizzazione manuale...');
        
        // Controlla connessione
        const isConnected = await checkConnection()
        if (!isConnected) {
            return {
                success: false,
                message: 'Nessuna connessione internet. Verifica il WiFi o i dati mobili.'
            }
        }
        
        // Controlla se ci sono modifiche non sincronizzate
        const hasChanges = await hasUnsyncedChanges({ database });
        
        await syncWithSupabase();
        
        if (hasChanges) {
            return { 
                success: true, 
                message: 'Sincronizzazione completata! Modifiche locali inviate al server.' 
            };
        } else {
            return { 
                success: true, 
                message: 'Sincronizzazione completata! Database già aggiornato.' 
            };
        }
    } catch (error) {
        console.error('Errore nella sincronizzazione manuale:', error);
        return { 
            success: false, 
            message: `Errore: ${error instanceof Error ? error.message : 'Sincronizzazione fallita'}` 
        };
    }
}