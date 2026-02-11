-- ============================================
-- ABILITA ROW LEVEL SECURITY (RLS)
-- ============================================
-- Protegge le tabelle da accessi non autorizzati

-- 1. ABILITA RLS SU TUTTE LE TABELLE
-- ============================================

ALTER TABLE prodotti ENABLE ROW LEVEL SECURITY;
ALTER TABLE tare ENABLE ROW LEVEL SECURITY;
ALTER TABLE scorte ENABLE ROW LEVEL SECURITY;
ALTER TABLE pesi_standard ENABLE ROW LEVEL SECURITY;
ALTER TABLE prodotti_deleted ENABLE ROW LEVEL SECURITY;
ALTER TABLE tare_deleted ENABLE ROW LEVEL SECURITY;
ALTER TABLE scorte_deleted ENABLE ROW LEVEL SECURITY;
ALTER TABLE pesi_standard_deleted ENABLE ROW LEVEL SECURITY;

-- ============================================
-- OPZIONE A: ACCESSO PUBBLICO (Per app interne)
-- ============================================
-- ✅ OK per app aziendali interne con pochi utenti
-- La sicurezza si basa sul non condividere le chiavi API

CREATE POLICY "Allow public access" ON prodotti FOR ALL USING (true);
CREATE POLICY "Allow public access" ON tare FOR ALL USING (true);
CREATE POLICY "Allow public access" ON scorte FOR ALL USING (true);
CREATE POLICY "Allow public access" ON pesi_standard FOR ALL USING (true);
CREATE POLICY "Allow public access" ON prodotti_deleted FOR ALL USING (true);
CREATE POLICY "Allow public access" ON tare_deleted FOR ALL USING (true);
CREATE POLICY "Allow public access" ON scorte_deleted FOR ALL USING (true);
CREATE POLICY "Allow public access" ON pesi_standard_deleted FOR ALL USING (true);

-- ============================================
-- OPZIONE B: SOLO UTENTI AUTENTICATI (Richiede login)
-- ============================================
-- Solo chi ha fatto login può accedere ai dati
-- ⚠️ Non utilizzare questa opzione se non vuoi implementare login
/*
CREATE POLICY "Authenticated users can do everything on prodotti" 
ON prodotti FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Authenticated users can do everything on tare" 
ON tare FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Authenticated users can do everything on scorte" 
ON scorte FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Authenticated users can do everything on pesi_standard" 
ON pesi_standard FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Authenticated users can do everything on prodotti_deleted" 
ON prodotti_deleted FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Authenticated users can do everything on tare_deleted" 
ON tare_deleted FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Authenticated users can do everything on scorte_deleted" 
ON scorte_deleted FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Authenticated users can do everything on pesi_standard_deleted" 
ON pesi_standard_deleted FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);
*/

-- ============================================
-- OPZIONE C: DATI PER UTENTE (Massima sicurezza)
-- ============================================
-- Ogni utente vede solo i propri dati
-- Richiede aggiungere colonna user_id a tutte le tabelle
/*
-- Aggiungi colonna user_id
ALTER TABLE prodotti ADD COLUMN user_id UUID REFERENCES auth.users(id);
ALTER TABLE tare ADD COLUMN user_id UUID REFERENCES auth.users(id);
ALTER TABLE scorte ADD COLUMN user_id UUID REFERENCES auth.users(id);
ALTER TABLE pesi_standard ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Policy per vedere solo i propri dati
CREATE POLICY "Users can view own prodotti" 
ON prodotti FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own prodotti" 
ON prodotti FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prodotti" 
ON prodotti FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own prodotti" 
ON prodotti FOR DELETE 
USING (auth.uid() = user_id);

-- Ripeti per tare, scorte, pesi_standard...
*/

-- ============================================
-- PERMESSI PER LE FUNZIONI RPCpubblicamente (con anon key)

-- Permetti a chiunque di chiamare le funzioni (tramite anon key)
GRANT EXECUTE ON FUNCTION pull(BIGINT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION push(JSONB) TO anon,hiamare le funzioni
GRANT EXECUTE ON FUNCTION pull(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION push(JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_deleted_records() TO authenticated;

-- ============================================
-- TEST DELLE POLICY
-- ============================================
-- Dopo aver eseguito questo script, testa che:
-- 1. Le chiamate senza autenticazione falliscono
-- 2. Le chiamate con autenticazione funzionano
-- 3. Le funzioni pull/push continuano a funzionare
