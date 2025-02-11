import React, {useCallback, useMemo, useState} from 'react'

const StorageContext = React.createContext({})

export function StorageProvider({children}) {
    const [storedData, setStoredData] = useState(() => {
        const keyValues = storageKeys
            .map(key => {
                const {defaultValue} = storageConfig[key]
                let rawValue = null
                let value = defaultValue
                try {
                    rawValue = localStorage.getItem(key) || JSON.stringify(defaultValue)
                    value = JSON.parse(rawValue) || defaultValue
                } catch (ex) {
                    console.warn('Invalid local storage value for key=${key}', rawValue)
                    return defaultValue
                }
                return {key, value}
            })
        return keyValues.reduce((acc, {key, value}) => ({...acc, [key]: value}), {})
    })

    const setStorageValue = useCallback((key, value) => {
        setStoredData({
            ...storedData,
            [key]: value
        })
        localStorage.setItem(key, JSON.stringify(value))
    }, [storedData])

    const value = useMemo(() => ({
        ...storedData,
        setStorageValue
    }), [setStorageValue, storedData])

    return (
        <StorageContext.Provider value={value}>
            {children}
        </StorageContext.Provider>
    )
}

const storageConfig = {
    starredEntries: {
        defaultValue: []
    }
}
const storageKeys = Object.keys(storageConfig)

export default StorageContext
