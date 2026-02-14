
# Inventory Checker

> Applicazione per migliorare le tempistiche di inventarizzazione nei negozi di fastfood.

---

## Info
Questo progetto è stato inizializzato con Expo e presenta un DB locale attraverso WatermelonDB sincronizzato con un Db sql Supabase. L'idea principale è quella di rendere rotatoria e uniforme l'informazione delle scorte presenti in magazzino e in cucina, così da permettere una efficacia maggiore nella risoluzione di problemi con l'inventario (eventuali ammanchi o surplus) e velocizzarne il controllo.

L'idea è nata per risolvere un problema reale (anche se temporaneo) ma presenta tecnologie moderne e verrà migliorata con un maggiore utilizzo di pattern e best practices oltre che dotata di testing per verificarne il corretto funzionamento.

L'applicazione funziona solo con Expo-dev-client e non con expo-go a causa di WatermelonDB.

---

## TODO
### Obbligatorio
- [] Aggiungere unit testing con jest
- [] Migliorare BarcodeScanner con pattern strategy
- [] Risolvere problema multi-barcode
- [] Aggiungere auth per ogni cliente e suddivisione per negozi
### Facoltativo (per ora)
- [] Miglioramento controllo automatico differenze
- [] Altre migliorie interne
<!-- Elenca qui le cose da fare -->
