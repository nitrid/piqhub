import React from 'react';
import Base from './base.js';

import Autocomplete from 'devextreme-react/autocomplete';

export default class NdAutoComplete extends Base
{
    constructor(props)
    {
        super(props)
        
        this.state.value = typeof props.value == 'undefined' ? '' : props.value;
        this.state.suggestions = typeof props.suggestions == 'undefined' ? [] : props.suggestions;

        this._onValueChange = this._onValueChange.bind(this);
    }
    _onValueChange(e) 
    {       
        this.value = e;        

        if(typeof this.props.onValueChange != 'undefined')
        {
            this.props.onValueChange(e);
        }
    }
    get value()
    {
        return this.state.value
    }
    set value(e)
    {
        this.setState({value:e})
    }
    get suggestions()
    {
        return this.state.suggestions
    }
    set suggestions(e)
    {
        this.setState({suggestions:e})
    }
    render()
    {
        return(
            <Autocomplete dataSource={this.state.suggestions} value={this.state.value}
            onValueChange={this._onValueChange}
            showClearButton={true}
            minSearchLength={3}
            wrapItemText={true}
            searchTimeout={100}
            searchMode={''}
            />
        )
    }
}