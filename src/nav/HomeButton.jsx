import React, {useCallback, useContext} from 'react'
import IconButton from '@mui/material/IconButton'
import FilterContext from '../contexts/FilterContext'
import LPUImage from '../resources/LPU.png'
import AppContext from '../contexts/AppContext'
import Tooltip from '@mui/material/Tooltip'
import {useHotkeys} from 'react-hotkeys-hook'

function HomeButton() {
    const {setTab} = useContext(AppContext)
    const {clearFilters} = useContext(FilterContext)
    const handleClick = useCallback(() => {
        window.scrollTo({top: 0, behavior: 'smooth'})
        setTab('White')
        setTimeout(() => clearFilters(true), 150)
    }, [clearFilters, setTab])
    useHotkeys('h', handleClick)

    return (
        <Tooltip title='Home' arrow disableFocusListener>
            <IconButton edge='start' color='inherit' size='medium' sx={{mr: 1}} onClick={handleClick}>
                <img alt='LPU' src={LPUImage} width={36} height={36}/>
            </IconButton>
        </Tooltip>
    )
}

export default HomeButton
