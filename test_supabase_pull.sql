-- Test manuale della funzione PULL su Supabase
-- Esegui questa query nel SQL Editor di Supabase per testare

-- Test 1: Controlla i valori effettivi di created_at e updated_at
SELECT 
    'scorte' as tabella,
    id,
    created_at,
    updated_at,
    CASE 
        WHEN created_at IS NULL THEN 'NULL'
        WHEN created_at = 0 THEN 'ZERO'
        WHEN created_at > 0 THEN 'OK'
        ELSE 'ALTRO'
    END as stato_created_at
FROM scorte
LIMIT 5;

-- Test 2: Correggi i created_at NULL o 0 (imposta = timestamp corrente)
UPDATE prodotti SET created_at = EXTRACT(EPOCH FROM NOW())::BIGINT * 1000 WHERE created_at IS NULL OR created_at = 0;
UPDATE tare SET created_at = EXTRACT(EPOCH FROM NOW())::BIGINT * 1000 WHERE created_at IS NULL OR created_at = 0;
UPDATE scorte SET created_at = EXTRACT(EPOCH FROM NOW())::BIGINT * 1000 WHERE created_at IS NULL OR created_at = 0;
UPDATE pesi_standard SET created_at = EXTRACT(EPOCH FROM NOW())::BIGINT * 1000 WHERE created_at IS NULL OR created_at = 0;

-- Test 3: Riprova il pull dopo la correzione (formato tabellare)
WITH pull_result AS (
    SELECT pull(0) as result
)
SELECT 
    'prodotti' as tabella,
    'created' as tipo,
    jsonb_array_length(result->'changes'->'prodotti'->'created') as numero_record
FROM pull_result
UNION ALL
SELECT 'prodotti', 'updated', jsonb_array_length(result->'changes'->'prodotti'->'updated') FROM pull_result
UNION ALL
SELECT 'prodotti', 'deleted', jsonb_array_length(result->'changes'->'prodotti'->'deleted') FROM pull_result
UNION ALL
SELECT 'tare', 'created', jsonb_array_length(result->'changes'->'tare'->'created') FROM pull_result
UNION ALL
SELECT 'tare', 'updated', jsonb_array_length(result->'changes'->'tare'->'updated') FROM pull_result
UNION ALL
SELECT 'tare', 'deleted', jsonb_array_length(result->'changes'->'tare'->'deleted') FROM pull_result
UNION ALL
SELECT 'scorte', 'created', jsonb_array_length(result->'changes'->'scorte'->'created') FROM pull_result
UNION ALL
SELECT 'scorte', 'updated', jsonb_array_length(result->'changes'->'scorte'->'updated') FROM pull_result
UNION ALL
SELECT 'scorte', 'deleted', jsonb_array_length(result->'changes'->'scorte'->'deleted') FROM pull_result
UNION ALL
SELECT 'pesi_standard', 'created', jsonb_array_length(result->'changes'->'pesi_standard'->'created') FROM pull_result
UNION ALL
SELECT 'pesi_standard', 'updated', jsonb_array_length(result->'changes'->'pesi_standard'->'updated') FROM pull_result
UNION ALL
SELECT 'pesi_standard', 'deleted', jsonb_array_length(result->'changes'->'pesi_standard'->'deleted') FROM pull_result
ORDER BY tabella, tipo;

-- Test 2: Verifica che ci siano dati nelle tabelle
SELECT 'prodotti' as tabella, COUNT(*) as totale FROM prodotti
UNION ALL
SELECT 'tare', COUNT(*) FROM tare
UNION ALL
SELECT 'scorte', COUNT(*) FROM scorte
UNION ALL
SELECT 'pesi_standard', COUNT(*) FROM pesi_standard;

-- Test 3: Verifica i timestamp dei record
SELECT 
    'prodotti' as tabella,
    MIN(created_at) as primo_record,
    MAX(created_at) as ultimo_record,
    COUNT(*) as totale
FROM prodotti
WHERE created_at IS NOT NULL
UNION ALL
SELECT 
    'tare',
    MIN(created_at),
    MAX(created_at),
    COUNT(*)
FROM tare
WHERE created_at IS NOT NULL
UNION ALL
SELECT 
    'scorte',
    MIN(created_at),
    MAX(created_at),
    COUNT(*)
FROM scorte
WHERE created_at IS NOT NULL
UNION ALL
SELECT 
    'pesi_standard',
    MIN(created_at),
    MAX(created_at),
    COUNT(*)
FROM pesi_standard
WHERE created_at IS NOT NULL;

-- Test 4: Verifica le policy RLS
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('prodotti', 'tare', 'scorte', 'pesi_standard');
