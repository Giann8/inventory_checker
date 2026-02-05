import { withObservables } from "@nozbe/watermelondb/react";

const crude_scorta = ({scorta})=>{
    <div>
        <p>Scorta ID: {scorta.id}</p>
        <p>Quantità in Linea: {scorta.quantitaInLinea}</p>
        <p>Quantità in Magazzino Sigillato: {scorta.quantitaInMagazzinoSigillato}</p>
        <p>Quantità in Magazzino Aperto: {scorta.quantitaInMagazzinoAperto}</p>
        <p>Quantità Totale: {scorta.quantitaTotale}</p>
        <p>Ultimo Aggiornamento: {scorta.updatedAt.toLocaleString()}</p>
        <p>Creato: {scorta.createdAt.toLocaleString()}</p>
    </div>
}

const enhance = withObservables(['scorta'], ({scorta})=>({
    scorta
}));

const ScortaCard = enhance(crude_scorta);

export default ScortaCard;