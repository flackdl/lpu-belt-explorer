import ExpandMoreIcon from '@mui/icons-material/ExpandMore.js'
import {Button} from '@mui/material'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React from 'react'
import BeltStripe from './BeltStripe'
import FieldValue from './FieldValue'
import BeltIcon from './BeltIcon'

function Entry({index, expanded, entry, onAccordionChange}) {
    const handleChange = (_, isExpanded) => onAccordionChange(isExpanded ? index : false)

    return (
        <Accordion expanded={expanded} onChange={handleChange}>
            <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                <BeltStripe value={entry.belt}/>
                <Typography
                    component='span' style={{marginRight: 8}}
                    sx={{width: '50%', flexShrink: 0, flexDirection: 'column'}}
                >
                    <FieldValue name='Make / Model' value={
                        <Stack direction='row' spacing={0} sx={{flexWrap: 'wrap'}}>
                            {entry.makeModels.map(({make, model}, index) =>
                                <Typography key={index}>{make ? `${make} / ${model}` : model}</Typography>
                            )}
                        </Stack>
                    }/>
                    {!!entry.version && <FieldValue name='Version' value={entry.version}/>}
                </Typography>
                <Typography component='span' sx={{width: '50%', flexShrink: 0, flexDirection: 'column'}}>
                    {
                        entry.lockingMechanisms.length > 0 &&
                        <FieldValue name='Locking Mechanisms' value={
                            <Stack direction='row' spacing={0} sx={{flexWrap: 'wrap'}}>
                                {entry.lockingMechanisms.map((lockingMechanism, index) =>
                                    <Chip
                                        key={index} label={lockingMechanism} variant='outlined'
                                        style={{marginRight: 4, marginBottom: 4}}
                                    />
                                )}
                            </Stack>
                        }/>
                    }
                </Typography>
            </AccordionSummary>
            <AccordionDetails>
                <FieldValue name='Belt' value={
                    <React.Fragment>
                        <Typography>{entry.belt} <BeltIcon belt={entry.belt}/></Typography>
                    </React.Fragment>

                }/>
                {!!entry.notes &&
                    <FieldValue name='Notes' value={
                        <Typography>{entry.notes}</Typography>
                    }/>
                }
                {!!entry.features.length &&
                    <FieldValue name='Features' value={
                        <Stack direction='row' spacing={0} sx={{flexWrap: 'wrap'}}>
                            {entry.features.map((tag, index) =>
                                <Chip
                                    key={index} label={tag} variant='outlined'
                                    style={{marginRight: 4, marginBottom: 4}}
                                />
                            )}
                        </Stack>
                    }/>
                }
                {
                    !!entry.media?.length && expanded &&
                    <FieldValue name='Media' value={
                        <Stack direction='row' spacing={1}>
                            {entry.media.map(({text, url}, index) =>
                                <a key={index} href={url} target='_blank' rel='noopener noreferrer'>
                                    <img src={url} alt={text} width={75} height={75}/>
                                </a>
                            )}
                        </Stack>
                    }/>
                }
                {
                    !!entry.links.length &&
                    <FieldValue name='Links' value={
                        <Stack direction='row' spacing={1}>
                            {entry.links.map(({text, url}, index) =>
                                <Button
                                    key={index} href={url} target='_blank'
                                    rel='noopener noreferrer' color='secondary'>{text}
                                </Button>
                            )}
                        </Stack>
                    }/>
                }
                {
                    !!entry.regions.length &&
                    <FieldValue name='Regions' value={
                        <Stack direction='row' spacing={1}>
                            {entry.regions.map((region, index) =>
                                <Button key={index} color='inherit'>{region}</Button>
                            )}
                        </Stack>
                    }/>
                }
            </AccordionDetails>
        </Accordion>
    )
}

export default React.memo(Entry)
