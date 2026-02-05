import { Platform } from 'react-native'
import { Database } from '@nozbe/watermelondb'
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'

import Schema from './src/model/schema'
import migrations from './src/model/migrations'
import Product from './src/model/product'
import Scorte from './src/model/scorte'

// First, create the adapter to the underlying database:
const adapter = new SQLiteAdapter({
    schema: Schema,
    migrations: migrations,
    // (optional database name or file system path)
    dbName: 'scorte_checker.db',
    // (recommended option, should work flawlessly out of the box on iOS. On Android,
    // additional installation steps have to be taken - disable if you run into issues...)
    jsi: false, /* Platform.OS === 'ios' */
    // (optional, but you should implement this method)
    onSetUpError: error => {
        // Database failed to load -- offer the user to reload the app or log out
        console.error('Database setup error:', error);
    }
})

// Then, make a Watermelon database from it!
const database = new Database({
    adapter,
    modelClasses: [
        Product,
        Scorte
    ],
})

export default database;