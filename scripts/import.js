import fs from 'fs'
import dayjs from 'dayjs'
import {parse} from 'csv-parse/sync'
import {mainSchema, mediaSchema, linkSchema, viewSchema} from './schemas.js'
import {allBelts} from '../src/data/belts.js'
import fetch from 'node-fetch'
import validate from './validate.js'

// Helper to load and validate a file
const importValidate = async (tab, schema) => {
    const {GOOGLE_SHEET_ID: sheetId} = process.env
    if (!sheetId) {
        console.log('Config error! Set GOOGLE_SHEET_ID env var to run Import.')
        process.exit(1)
    }

    // Download file
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${tab}`
    const csvData = await (await fetch(url)).text()

    // Parse CSV into JSON
    const data = parse(csvData, {
        columns: true,
        skip_empty_lines: true,
        trim: true
    })

    // Validate data before merging in
    validate(data, schema)

    return data
}

// Load all 3 data files
const mainData = await importValidate('App Data', mainSchema)
const mediaData = await importValidate('Media', mediaSchema)
const linkData = await importValidate('Links', linkSchema)
const viewData = await importValidate('Lock Views', viewSchema)

// Transform fields into internal JSON format
const jsonData = mainData
    .map(datum => {
        const belt = datum.Belt
        const makes = datum.Make.split(',').filter(x => x)
        const models = datum.Model.split(',').filter(x => x)
        const makeModels = models.map((model, index) => ({
            make: makes[index],
            model: model
        }))
        const version = datum.Version
        const lockingMechanisms = datum['Locking Mechanisms'].split(',').filter(x => x)
        const features = datum.Features.split(',').filter(x => x)
        const notes = datum.Notes
        const id = datum['Unique ID']

        const value = {
            id,
            belt,
            makeModels,
            version,
            lockingMechanisms,
            features,
            notes
        }

        // Clean up empty values to reduce payload size
        Object.keys(value).forEach(key => {
            if (typeof value[key] === 'string' && value[key] === '') value[key] = undefined
            else if (Array.isArray(value[key]) && value[key].length === 0) value[key] = undefined
        })

        return value
    })
    .sort((a, b) => {
        // Sort by belt first, keeping all Black belt variations together
        const beltNumberA = allBelts.indexOf(a.belt.replace(/\s\d/g, ''))
        const beltNumberB = allBelts.indexOf(b.belt.replace(/\s\d/g, ''))

        if (beltNumberA === beltNumberB) {
            // If belt is equal, sort by make/model, keeping Any above others
            const fuzzyA = a.makeModels[0].make === 'Any'
                ? 'A' : a.makeModels
                    .map(({make, model}) => [make, model])
                    .flat()
                    .filter(a => a)
                    .join(',')
                    .toLowerCase()
            const fuzzyB = b.makeModels[0].make === 'Any'
                ? 'A' : b.makeModels
                    .map(({make, model}) => [make, model])
                    .flat()
                    .filter(a => a)
                    .join(',')
                    .toLowerCase()

            return fuzzyA < fuzzyB ? -1 : 1
        } else {
            return beltNumberA < beltNumberB ? -1 : 1
        }
    })

// Add media data
mediaData
    .sort((a, b) => {
        const one = a['Sequence ID']
        const two = b['Sequence ID']
        if (one === two) return 0
        else if (one > two) return 1
        else return -1
    })
    .forEach(item => {
        const entry = jsonData.find(e => e.id === item['Unique ID'])
        if (!entry) return console.log('Entry not found!', item)
        if (!entry.media) entry.media = []
        const media = {
            title: item.Title,
            subtitle: item.Subtitle,
            thumbnailUrl: item['Thumbnail URL'],
            fullUrl: item['Full URL']
        }
        if (item['Subtitle URL']) media.subtitleUrl = item['Subtitle URL']
        entry.media.push(media)
    })

// Add link data
linkData
    .sort((a, b) => {
        const one = a['Sequence ID']
        const two = b['Sequence ID']
        if (one === two) return 0
        else if (one > two) return 1
        else return -1
    })
    .forEach(item => {
        const entry = jsonData.find(e => e.id === item['Unique ID'])
        if (!entry.links) entry.links = []
        entry.links.push({
            title: item.Title,
            url: item.URL
        })
    })

// Add view data
viewData
    .forEach(item => {
        const entry = jsonData.find(e => e.id === item['Unique ID'])
        if (!entry) return console.log('Entry not found:', item)
        entry.views = +item['Count']
    })

// Recently updated data
const originalData = JSON.parse(fs.readFileSync('./src/data/data.json'))
jsonData
    .forEach(entry => {
        const {lastUpdated, views: oldViews, ...oldEntry} = originalData.find(e => e.id === entry.id) || {}
        const {views: newViews, ...newEntry} = entry
        if (JSON.stringify(newEntry) !== JSON.stringify(oldEntry)) {
            console.log(`Entry updated ${newEntry.id}`, )
            entry.lastUpdated = dayjs().toISOString()
        } else {
            entry.lastUpdated = lastUpdated
        }
    })

// Write out to src location for usage
fs.writeFileSync('./src/data/data.json', JSON.stringify(jsonData, null, 2))
