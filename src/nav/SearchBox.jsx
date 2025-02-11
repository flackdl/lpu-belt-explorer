import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import SearchIcon from '@mui/icons-material/Search'
import ClearIcon from '@mui/icons-material/Clear'
import FilterContext from '../contexts/FilterContext'
import AppContext from '../contexts/AppContext'
import useWindowSize from '../util/useWindowSize'
import debounce from 'debounce'
import {useHotkeys} from 'react-hotkeys-hook'

function SearchBox() {
    const {tab, setTab} = useContext(AppContext)
    const {filters, addFilter, removeFilter} = useContext(FilterContext)
    const [text, setText] = useState(filters.search || '')
    const {width} = useWindowSize()
    const inputEl = useRef()
    useHotkeys('s', () => inputEl?.current?.focus(), {preventDefault: true})

    const handleClear = useCallback(() => {
        window.scrollTo({top: 0, behavior: 'smooth'})
        setText('')
        removeFilter('search', '')
    }, [removeFilter])

    const debounceChange = useMemo(() => {
        return debounce(value => {
            addFilter('search', value, true)

            setTimeout(() => {
                if (tab !== 'search') {
                    setTab('search')
                    window.scrollTo({top: 0, behavior: 'smooth'})
                }
            }, 0)
        }, 150)
    }, [addFilter, setTab, tab])

    const handleChange = useCallback(event => {
        const {value} = event.target
        setText(value)
        debounceChange(value)
    }, [debounceChange])

    useEffect(() => {
        if (filters.search === undefined) {
            setText('')
            addFilter('search', '', true)
        }
    }, [addFilter, filters.search])

    const endAdornment = text ? (
        <InputAdornment position='end'>
            <Tooltip title='Clear' arrow disableFocusListener>
                <IconButton color='inherit' onClick={handleClear} edge='end' size='small'>
                    <ClearIcon/>
                </IconButton>
            </Tooltip>
        </InputAdornment>
    ) : null
    const style = width < 650
        ? {maxWidth: 450}
        : {maxWidth: 450, paddingLeft: 60}

    return (
        <TextField
            placeholder='Quick Search'
            InputProps={{
                inputProps: {
                    ref: inputEl
                },
                startAdornment: (
                    <InputAdornment position='start'>
                        <SearchIcon/>
                    </InputAdornment>
                ),
                endAdornment
            }}
            variant='standard'
            color='secondary'
            onChange={handleChange}
            value={text}
            style={style}
            fullWidth
            inputRef={input => input && input.focus()}
        />
    )
}

export default SearchBox
