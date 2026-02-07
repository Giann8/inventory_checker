import { TouchableOpacity, Text, View, Alert } from "react-native";
import Product from "../model/product";

export default function AddProdotto() {

    const handleAddProduct = () => {
        Alert.prompt(
            'Nuovo Prodotto',
            'Inserisci il nome del prodotto:',
            [
                {
                    text: 'Annulla',
                    style: 'cancel'
                },
                {
                    text: 'Avanti',
                    onPress: (name) => {
                        if (name && name.trim()) {
                            handleProductType(name.trim());
                        } else {
                            Alert.alert('Errore', 'Il nome del prodotto è obbligatorio');
                        }
                    }
                }
            ],
            'plain-text',
            '',
            'default'
        );
    };

    const handleProductType = (name: string) => {
        Alert.prompt(
            'Tipo Prodotto',
            'Inserisci il tipo del prodotto:',
            [
                {
                    text: 'Indietro',
                    onPress: () => handleAddProduct()
                },
                {
                    text: 'Crea',
                    onPress: (type: any) => {
                        if (type && type.trim()) {
                            createProduct(name, type.trim());
                        } else {
                            Alert.alert('Errore', 'Il tipo del prodotto è obbligatorio');
                        }
                    }
                }
            ],
            'plain-text',
            '',
            'default'
        );
    };

    const createProduct = async (name: string, type: string) => {
        try {
            Product.creaProdotto(name, type);
            Alert.alert('Successo', `Prodotto "${name}" creato correttamente!`);
        } catch (error) {
            Alert.alert('Errore', 'Impossibile creare il prodotto');
            console.error('Errore creazione:', error);
        }
    };

    return (
        <TouchableOpacity
            style={styles.logisticButton}
            onPress={handleAddProduct}
            activeOpacity={0.8}
        >
            <View>
                <Text style={styles.buttonIcon}>📦</Text>
                <Text style={styles.buttonText}>Aggiungi Prodotto</Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = {
    logisticButton: {
        backgroundColor: '#2C5F2D', // Verde scuro professionale logistico
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 20,
        marginHorizontal: 16,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 8,
        borderWidth: 2,
        borderColor: '#4A7C59', // Bordo verde più chiaro
    },
    buttonContent: {
        justifyContent: 'center',
    },
    buttonIcon: {
        fontSize: 20,
        marginRight: 10,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,

        letterSpacing: 0.5,
    },
};