import queryString from 'query-string'
import React, {useEffect, useState} from 'react'
import Entries from './Entries.jsx'
import Nav from './Nav.jsx'

function App() {
    const [searchTerm, setSearchTerm] = useState('')
    const query = queryString.parse(location.search)
    const [belt, setBelt] = useState(() => {
        return Object.keys(query).length > 0 ? 'search' : 'white'
    })
    const handleChangeTab = (event, newBelt) => setBelt(newBelt)
    const handleSearch = value => {
        setSearchTerm(value)
        setBelt('search')
    }

    const [data, setData] = useState([])
    useEffect(() => {
        if (!data.length) {
            const loadData = async () => {
                const raw = (await import('./data/data.json')).default

                // Add extra properties for easier filtering
                const value = raw.map(datum => ({
                    ...datum,
                    makes: datum.makeModels.map(({make}) => make),
                    fuzzy: datum.makeModels.map(({make, model}) => [make, model]).flat().filter(a => a).join(','),
                    hasImages: datum.media?.length > 0 ? 'true' : 'false',
                    hasLinks: datum.links?.length > 0 ? 'true' : 'false'
                }))
                setData(value)
            }
            loadData()
        }
    }, [data])

    return (
        <React.Fragment>
            <Nav
                data={data}
                belt={belt}
                searchTerm={searchTerm}
                onSearch={handleSearch}
                onChangeTab={handleChangeTab}
            />

            <Entries
                data={data}
                belt={belt}
                query={query}
                searchTerm={searchTerm}
            />
        </React.Fragment>
    )
}


export default App
