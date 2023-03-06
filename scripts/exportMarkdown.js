import fs from 'fs'
import belts, {uniqueBelts} from '../src/data/belts.js'

const rawData = JSON.parse(fs.readFileSync('./src/data/data.json', 'utf8'))
const infoMd = fs.readFileSync('./src/resources/info.md', 'utf8')

const initialVal = uniqueBelts.reduce((acc, val) => ({...acc, [val]: []}), [])
const groupedByBelt = rawData.reduce((acc, val) => {
    const belt = val.belt.replace(/\d/g, '')
    if (acc[belt]) acc[belt].push(val)
    return acc
}, initialVal)

const beltsMd = uniqueBelts.map(belt => {
    const header = `### ${belts[belt].label} Belt\n![](%%${belt}%%)\n\n`
    const reqs = fs.readFileSync(`./src/resources/${belt}.md`, 'utf8')
    const entries = groupedByBelt[belt].map(entry => {
        const makeModels = entry.makeModels.map(({make, model}) => {
            return make && make !== model ? `${make} ${model}` : model
        }).join (' / ')
        const url = `https://lpubelts.com/?id=${entry.id}`
        const version = entry.version ? ` (${entry.version})` : ''
        return `- [${makeModels}](${url}) ${version}`
    }).join('\n')
    return header + reqs + '\n\n' + entries
}).join('\n\n')

const footerMd = fs.readFileSync('./src/resources/footer.md', 'utf8')

const markdown = infoMd + '\n\n' + beltsMd + '\n\n' + footerMd

/*  -Layout-
    <./src/resources/info.md>

    ### Color Belt
    <./src/resources/color.md>
    <belt ranking info>

    <./src/resources/footer.md>
 */

fs.writeFileSync('./dist/belts.md', markdown)