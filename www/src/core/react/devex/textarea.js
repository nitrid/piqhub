import React from 'react';
import Base from './base.js';

import TextArea from 'devextreme-react/text-area';

export default class NdTextArea extends Base
{
    constructor(props)
    {
        super(props)
        
        this.state.value = typeof props.value == 'undefined' ? [] : props.value;
        this.state.height = typeof props.height == 'undefined' ? 'auto' : props.height

        this._onValueChanged = this._onValueChanged.bind(this);
    }
    _onValueChanged(e) 
    {       
        this.value = e.value;
        
        if(typeof this.props.onValueChanged != 'undefined')
        {
            this.props.onValueChanged(e);
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
    render()
    {
        return(
            <TextArea
            height={this.state.height}
            value={typeof this.state.value == 'undefined' ? '' : this.state.value.toString()}
            valueChangeEvent={"keyup"}
            onValueChanged={this._onValueChanged}
            />
        )
    }
}