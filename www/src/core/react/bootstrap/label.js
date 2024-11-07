
import React from "react";
import NbBase from "./base.js";

export default class NbLabel extends NbBase
{
    constructor(props)
    {
        super(props)
        this.state.value = typeof props.value == 'undefined' ? ''  : props.value;
        this.state.text = typeof props.value == 'undefined' ? ''  : props.value;
        this.state.style = this.props.style
    }
    get value()
    {
        return this.state.value
    }
    set value(e)
    {
        if(typeof this.props.format != 'undefined' && this.props.format == 'currency')
        {
            this.setState({value:e == null ? 0 : e.toString(),text:Number(e).currency()})
            return
        }
        
        this.setState({value:e == null ? '' : e.toString(),text:e.toString()})
    }
    get style()
    {
        return this.state.style
    }
    set style(e)
    {
        this.setState({style:e})
    }
    render()
    {
        return <span id={this.props.id} style={this.state.style}>{this.state.text}</span>
    }
}