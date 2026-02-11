-- ============================================
-- SUPABASE SYNC SETUP per WatermelonDB
-- ============================================

-- 1. CREAZIONE TABELLE PRINCIPALI
-- ============================================

-- Tabella prodotti
CREATE TABLE IF NOT EXISTS prodotti (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL
);

-- Aggiungi colonne se la tabella esiste già
ALTER TABLE prodotti ADD COLUMN IF NOT EXISTS created_at BIGINT;
ALTER TABLE prodotti ADD COLUMN IF NOT EXISTS updated_at BIGINT;

-- Tabella tare
CREATE TABLE IF NOT EXISTS tare (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    weight NUMERIC NOT NULL,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL
);

-- Aggiungi colonne se la tabella esiste già
ALTER TABLE tare ADD COLUMN IF NOT EXISTS created_at BIGINT;
ALTER TABLE tare ADD COLUMN IF NOT EXISTS updated_at BIGINT;

-- Tabella scorte
CREATE TABLE IF NOT EXISTS scorte (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    quantita_in_linea NUMERIC NOT NULL DEFAULT 0,
    quantita_in_magazzino_sigillato NUMERIC NOT NULL DEFAULT 0,
    quantita_in_magazzino_aperto NUMERIC NOT NULL DEFAULT 0,
    quantita_scarto NUMERIC NOT NULL DEFAULT 0,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL
);

-- Aggiungi colonne se la tabella esiste già
ALTER TABLE scorte ADD COLUMN IF NOT EXISTS created_at BIGINT;
ALTER TABLE scorte ADD COLUMN IF NOT EXISTS updated_at BIGINT;

-- Tabella pesi_standard
CREATE TABLE IF NOT EXISTS pesi_standard (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    peso NUMERIC NOT NULL,
    descrizione TEXT,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL
);

-- Aggiungi colonne se la tabella esiste già
ALTER TABLE pesi_standard ADD COLUMN IF NOT EXISTS created_at BIGINT;
ALTER TABLE pesi_standard ADD COLUMN IF NOT EXISTS updated_at BIGINT;

-- Imposta valori di default per record esistenti (timestamp corrente)
UPDATE prodotti SET created_at = EXTRACT(EPOCH FROM NOW())::BIGINT * 1000 WHERE created_at IS NULL;
UPDATE prodotti SET updated_at = EXTRACT(EPOCH FROM NOW())::BIGINT * 1000 WHERE updated_at IS NULL;
UPDATE tare SET created_at = EXTRACT(EPOCH FROM NOW())::BIGINT * 1000 WHERE created_at IS NULL;
UPDATE tare SET updated_at = EXTRACT(EPOCH FROM NOW())::BIGINT * 1000 WHERE updated_at IS NULL;
UPDATE scorte SET created_at = EXTRACT(EPOCH FROM NOW())::BIGINT * 1000 WHERE created_at IS NULL;
UPDATE scorte SET updated_at = EXTRACT(EPOCH FROM NOW())::BIGINT * 1000 WHERE updated_at IS NULL;
UPDATE pesi_standard SET created_at = EXTRACT(EPOCH FROM NOW())::BIGINT * 1000 WHERE created_at IS NULL;
UPDATE pesi_standard SET updated_at = EXTRACT(EPOCH FROM NOW())::BIGINT * 1000 WHERE updated_at IS NULL;

-- Rendi NOT NULL dopo aver impostato i valori
ALTER TABLE prodotti ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE prodotti ALTER COLUMN updated_at SET NOT NULL;
ALTER TABLE tare ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE tare ALTER COLUMN updated_at SET NOT NULL;
ALTER TABLE scorte ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE scorte ALTER COLUMN updated_at SET NOT NULL;
ALTER TABLE pesi_standard ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE pesi_standard ALTER COLUMN updated_at SET NOT NULL;

-- 2. INDICI per migliorare le performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_scorte_product_id ON scorte(product_id);
CREATE INDEX IF NOT EXISTS idx_pesi_standard_product_id ON pesi_standard(product_id);
CREATE INDEX IF NOT EXISTS idx_prodotti_updated ON prodotti(updated_at);
CREATE INDEX IF NOT EXISTS idx_tare_updated ON tare(updated_at);
CREATE INDEX IF NOT EXISTS idx_scorte_updated ON scorte(updated_at);
CREATE INDEX IF NOT EXISTS idx_pesi_standard_updated ON pesi_standard(updated_at);

-- 3. TABELLE PER TRACCIARE LE ELIMINAZIONI
-- ============================================

CREATE TABLE IF NOT EXISTS prodotti_deleted (
    id TEXT PRIMARY KEY,
    deleted_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS tare_deleted (
    id TEXT PRIMARY KEY,
    deleted_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS scorte_deleted (
    id TEXT PRIMARY KEY,
    deleted_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS pesi_standard_deleted (
    id TEXT PRIMARY KEY,
    deleted_at BIGINT NOT NULL
);

-- 4. FUNZIONE PULL - Recupera modifiche dal server
-- ============================================
DROP FUNCTION IF EXISTS pull(BIGINT);
-- Elimina la vecchia funzione se esiste
DROP FUNCTION IF EXISTS pull(BIGINT);

CREATE OR REPLACE FUNCTION pull(last_pulled_at BIGINT DEFAULT 0)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  current_ts BIGINT;
BEGIN
  current_ts := EXTRACT(EPOCH FROM NOW())::BIGINT * 1000;
  
  result := jsonb_build_object(
    'changes', jsonb_build_object(
      -- Tabella prodotti
      'prodotti', jsonb_build_object(
        'created', COALESCE(
          (SELECT jsonb_agg(jsonb_build_object(
            'id', id,
            'name', name,
            'type', type,
            'created_at', created_at,
            'updated_at', updated_at
          )) FROM prodotti WHERE created_at > last_pulled_at),
          '[]'::jsonb
        ),
        'updated', COALESCE(
          (SELECT jsonb_agg(jsonb_build_object(
            'id', id,
            'name', name,
            'type', type,
            'created_at', created_at,
            'updated_at', updated_at
          )) FROM prodotti WHERE updated_at > last_pulled_at AND created_at <= last_pulled_at),
          '[]'::jsonb
        ),
        'deleted', COALESCE(
          (SELECT jsonb_agg(id) FROM prodotti_deleted WHERE deleted_at > last_pulled_at),
          '[]'::jsonb
        )
      ),
      
      -- Tabella tare
      'tare', jsonb_build_object(
        'created', COALESCE(
          (SELECT jsonb_agg(jsonb_build_object(
            'id', id,
            'name', name,
            'weight', weight,
            'created_at', created_at,
            'updated_at', updated_at
          )) FROM tare WHERE created_at > last_pulled_at),
          '[]'::jsonb
        ),
        'updated', COALESCE(
          (SELECT jsonb_agg(jsonb_build_object(
            'id', id,
            'name', name,
            'weight', weight,
            'created_at', created_at,
            'updated_at', updated_at
          )) FROM tare WHERE updated_at > last_pulled_at AND created_at <= last_pulled_at),
          '[]'::jsonb
        ),
        'deleted', COALESCE(
          (SELECT jsonb_agg(id) FROM tare_deleted WHERE deleted_at > last_pulled_at),
          '[]'::jsonb
        )
      ),
      
      -- Tabella scorte
      'scorte', jsonb_build_object(
        'created', COALESCE(
          (SELECT jsonb_agg(jsonb_build_object(
            'id', id,
            'product_id', product_id,
            'quantita_in_linea', quantita_in_linea,
            'quantita_in_magazzino_sigillato', quantita_in_magazzino_sigillato,
            'quantita_in_magazzino_aperto', quantita_in_magazzino_aperto,
            'quantita_scarto', quantita_scarto,
            'created_at', created_at,
            'updated_at', updated_at
          )) FROM scorte WHERE created_at > last_pulled_at),
          '[]'::jsonb
        ),
        'updated', COALESCE(
          (SELECT jsonb_agg(jsonb_build_object(
            'id', id,
            'product_id', product_id,
            'quantita_in_linea', quantita_in_linea,
            'quantita_in_magazzino_sigillato', quantita_in_magazzino_sigillato,
            'quantita_in_magazzino_aperto', quantita_in_magazzino_aperto,
            'quantita_scarto', quantita_scarto,
            'created_at', created_at,
            'updated_at', updated_at
          )) FROM scorte WHERE updated_at > last_pulled_at AND created_at <= last_pulled_at),
          '[]'::jsonb
        ),
        'deleted', COALESCE(
          (SELECT jsonb_agg(id) FROM scorte_deleted WHERE deleted_at > last_pulled_at),
          '[]'::jsonb
        )
      ),
      
      -- Tabella pesi_standard
      'pesi_standard', jsonb_build_object(
        'created', COALESCE(
          (SELECT jsonb_agg(jsonb_build_object(
            'id', id,
            'product_id', product_id,
            'peso', peso,
            'descrizione', descrizione,
            'is_default', is_default,
            'created_at', created_at,
            'updated_at', updated_at
          )) FROM pesi_standard WHERE created_at > last_pulled_at),
          '[]'::jsonb
        ),
        'updated', COALESCE(
          (SELECT jsonb_agg(jsonb_build_object(
            'id', id,
            'product_id', product_id,
            'peso', peso,
            'descrizione', descrizione,
            'is_default', is_default,
            'created_at', created_at,
            'updated_at', updated_at
          )) FROM pesi_standard WHERE updated_at > last_pulled_at AND created_at <= last_pulled_at),
          '[]'::jsonb
        ),
        'deleted', COALESCE(
          (SELECT jsonb_agg(id) FROM pesi_standard_deleted WHERE deleted_at > last_pulled_at),
          '[]'::jsonb
        )
      )
    ),
    'timestamp', current_ts
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. FUNZIONE PUSH - Invia modifiche al server
-- ============================================

-- Elimina la vecchia funzione se esiste
DROP FUNCTION IF EXISTS push(JSON);
DROP FUNCTION IF EXISTS push(JSONB);

CREATE OR REPLACE FUNCTION push(changes JSONB)
RETURNS VOID AS $$
DECLARE
  record_data JSONB;
BEGIN
  -- ========== PRODOTTI ==========
  -- Created
  IF changes ? 'prodotti' AND changes->'prodotti' ? 'created' THEN
    FOR record_data IN SELECT jsonb_array_elements(changes->'prodotti'->'created')
    LOOP
      INSERT INTO prodotti (id, name, type, created_at, updated_at)
      VALUES (
        record_data->>'id',
        record_data->>'name',
        record_data->>'type',
        (record_data->>'created_at')::BIGINT,
        (record_data->>'updated_at')::BIGINT
      )
      ON CONFLICT (id) DO NOTHING;
    END LOOP;
  END IF;
  
  -- Updated
  IF changes ? 'prodotti' AND changes->'prodotti' ? 'updated' THEN
    FOR record_data IN SELECT jsonb_array_elements(changes->'prodotti'->'updated')
    LOOP
      UPDATE prodotti SET
        name = record_data->>'name',
        type = record_data->>'type',
        updated_at = (record_data->>'updated_at')::BIGINT
      WHERE id = record_data->>'id';
    END LOOP;
  END IF;
  
  -- Deleted
  IF changes ? 'prodotti' AND changes->'prodotti' ? 'deleted' THEN
    FOR record_data IN SELECT jsonb_array_elements_text(changes->'prodotti'->'deleted')
    LOOP
      INSERT INTO prodotti_deleted (id, deleted_at)
      VALUES (record_data, EXTRACT(EPOCH FROM NOW())::BIGINT * 1000)
      ON CONFLICT (id) DO NOTHING;
      
      DELETE FROM prodotti WHERE id = record_data;
    END LOOP;
  END IF;
  
  -- ========== TARE ==========
  -- Created
  IF changes ? 'tare' AND changes->'tare' ? 'created' THEN
    FOR record_data IN SELECT jsonb_array_elements(changes->'tare'->'created')
    LOOP
      INSERT INTO tare (id, name, weight, created_at, updated_at)
      VALUES (
        record_data->>'id',
        record_data->>'name',
        (record_data->>'weight')::NUMERIC,
        (record_data->>'created_at')::BIGINT,
        (record_data->>'updated_at')::BIGINT
      )
      ON CONFLICT (id) DO NOTHING;
    END LOOP;
  END IF;
  
  -- Updated
  IF changes ? 'tare' AND changes->'tare' ? 'updated' THEN
    FOR record_data IN SELECT jsonb_array_elements(changes->'tare'->'updated')
    LOOP
      UPDATE tare SET
        name = record_data->>'name',
        weight = (record_data->>'weight')::NUMERIC,
        updated_at = (record_data->>'updated_at')::BIGINT
      WHERE id = record_data->>'id';
    END LOOP;
  END IF;
  
  -- Deleted
  IF changes ? 'tare' AND changes->'tare' ? 'deleted' THEN
    FOR record_data IN SELECT jsonb_array_elements_text(changes->'tare'->'deleted')
    LOOP
      INSERT INTO tare_deleted (id, deleted_at)
      VALUES (record_data, EXTRACT(EPOCH FROM NOW())::BIGINT * 1000)
      ON CONFLICT (id) DO NOTHING;
      
      DELETE FROM tare WHERE id = record_data;
    END LOOP;
  END IF;
  
  -- ========== SCORTE ==========
  -- Created
  IF changes ? 'scorte' AND changes->'scorte' ? 'created' THEN
    FOR record_data IN SELECT jsonb_array_elements(changes->'scorte'->'created')
    LOOP
      INSERT INTO scorte (id, product_id, quantita_in_linea, quantita_in_magazzino_sigillato, 
                         quantita_in_magazzino_aperto, quantita_scarto, created_at, updated_at)
      VALUES (
        record_data->>'id',
        record_data->>'product_id',
        (record_data->>'quantita_in_linea')::NUMERIC,
        (record_data->>'quantita_in_magazzino_sigillato')::NUMERIC,
        (record_data->>'quantita_in_magazzino_aperto')::NUMERIC,
        (record_data->>'quantita_scarto')::NUMERIC,
        (record_data->>'created_at')::BIGINT,
        (record_data->>'updated_at')::BIGINT
      )
      ON CONFLICT (id) DO NOTHING;
    END LOOP;
  END IF;
  
  -- Updated
  IF changes ? 'scorte' AND changes->'scorte' ? 'updated' THEN
    FOR record_data IN SELECT jsonb_array_elements(changes->'scorte'->'updated')
    LOOP
      UPDATE scorte SET
        product_id = record_data->>'product_id',
        quantita_in_linea = (record_data->>'quantita_in_linea')::NUMERIC,
        quantita_in_magazzino_sigillato = (record_data->>'quantita_in_magazzino_sigillato')::NUMERIC,
        quantita_in_magazzino_aperto = (record_data->>'quantita_in_magazzino_aperto')::NUMERIC,
        quantita_scarto = (record_data->>'quantita_scarto')::NUMERIC,
        updated_at = (record_data->>'updated_at')::BIGINT
      WHERE id = record_data->>'id';
    END LOOP;
  END IF;
  
  -- Deleted
  IF changes ? 'scorte' AND changes->'scorte' ? 'deleted' THEN
    FOR record_data IN SELECT jsonb_array_elements_text(changes->'scorte'->'deleted')
    LOOP
      INSERT INTO scorte_deleted (id, deleted_at)
      VALUES (record_data, EXTRACT(EPOCH FROM NOW())::BIGINT * 1000)
      ON CONFLICT (id) DO NOTHING;
      
      DELETE FROM scorte WHERE id = record_data;
    END LOOP;
  END IF;
  
  -- ========== PESI_STANDARD ==========
  -- Created
  IF changes ? 'pesi_standard' AND changes->'pesi_standard' ? 'created' THEN
    FOR record_data IN SELECT jsonb_array_elements(changes->'pesi_standard'->'created')
    LOOP
      INSERT INTO pesi_standard (id, product_id, peso, descrizione, is_default, created_at, updated_at)
      VALUES (
        record_data->>'id',
        record_data->>'product_id',
        (record_data->>'peso')::NUMERIC,
        record_data->>'descrizione',
        (record_data->>'is_default')::BOOLEAN,
        (record_data->>'created_at')::BIGINT,
        (record_data->>'updated_at')::BIGINT
      )
      ON CONFLICT (id) DO NOTHING;
    END LOOP;
  END IF;
  
  -- Updated
  IF changes ? 'pesi_standard' AND changes->'pesi_standard' ? 'updated' THEN
    FOR record_data IN SELECT jsonb_array_elements(changes->'pesi_standard'->'updated')
    LOOP
      UPDATE pesi_standard SET
        product_id = record_data->>'product_id',
        peso = (record_data->>'peso')::NUMERIC,
        descrizione = record_data->>'descrizione',
        is_default = (record_data->>'is_default')::BOOLEAN,
        updated_at = (record_data->>'updated_at')::BIGINT
      WHERE id = record_data->>'id';
    END LOOP;
  END IF;
  
  -- Deleted
  IF changes ? 'pesi_standard' AND changes->'pesi_standard' ? 'deleted' THEN
    FOR record_data IN SELECT jsonb_array_elements_text(changes->'pesi_standard'->'deleted')
    LOOP
      INSERT INTO pesi_standard_deleted (id, deleted_at)
      VALUES (record_data, EXTRACT(EPOCH FROM NOW())::BIGINT * 1000)
      ON CONFLICT (id) DO NOTHING;
      
      DELETE FROM pesi_standard WHERE id = record_data;
    END LOOP;
  END IF;
  
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. PERMESSI (esegui se usi Row Level Security)
-- ============================================

-- Abilita RLS sulle tabelle se necessario
-- ALTER TABLE prodotti ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE tare ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE scorte ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE pesi_standard ENABLE ROW LEVEL SECURITY;

-- Crea policy di accesso (esempio per autenticazione)
-- CREATE POLICY "Users can CRUD their own data" ON prodotti
-- FOR ALL USING (auth.uid() = user_id);

-- 7. CLEANUP PERIODICO (opzionale)
-- ============================================
-- Elimina record deleted più vecchi di 30 giorni

CREATE OR REPLACE FUNCTION cleanup_deleted_records()
RETURNS VOID AS $$
DECLARE
  cutoff_time BIGINT;
BEGIN
  cutoff_time := EXTRACT(EPOCH FROM NOW() - INTERVAL '30 days')::BIGINT * 1000;
  
  DELETE FROM prodotti_deleted WHERE deleted_at < cutoff_time;
  DELETE FROM tare_deleted WHERE deleted_at < cutoff_time;
  DELETE FROM scorte_deleted WHERE deleted_at < cutoff_time;
  DELETE FROM pesi_standard_deleted WHERE deleted_at < cutoff_time;
END;
$$ LANGUAGE plpgsql;

-- Puoi creare un cron job per eseguire questa funzione periodicamente
