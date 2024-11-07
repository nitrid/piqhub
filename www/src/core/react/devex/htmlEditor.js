import React from 'react';
import Base from './base.js';

import HtmlEditor, { Toolbar, Item,ImageUpload,MediaResizing } from 'devextreme-react/html-editor';


export default class NdHtmlEditor extends Base
{
    constructor(props)
    {
        super(props)
        
        this.state.value = typeof props.value == 'undefined' ? [] : props.value;
        this.state.placeholder = typeof props.placeholder == 'undefined' ? '' : props.placeholder

        this._onValueChanged = this._onValueChanged.bind(this);
        this.sizeValues = ['8pt', '10pt', '12pt', '14pt', '18pt', '24pt', '36pt'];
        this.fontValues = ['Arial', 'Courier New', 'Georgia', 'Impact', 'Lucida Console', 'Tahoma', 'Times New Roman', 'Verdana'];
    }
    //#region Private
    _onValueChanged(e) 
    {
        this.value = e.value;
        if(typeof this.props.onValueChanged != 'undefined')
        {
            this.props.onValueChanged(e);
        }
    } 
    //#endregion
    get value()
    {
        return this.state.value
    }
    set value(e)
    {
        this.setState({value:e})
    }
    async componentDidMount()
    {
        if(typeof this.state.data != 'undefined')
        {
            await this.dataRefresh(this.state.data)                 
        }
    }
    componentWillReceiveProps(pProps) 
    {
        this.setState(
            {
                value : pProps.value
            }
        )
    } 
    render()
    {
        return(
            <HtmlEditor
            value={this.state.value}
            dataSource={typeof this.state.data == 'undefined' ? undefined : this.state.data.store} 
            onValueChanged={this._onValueChanged} 
            placeholder={this.state.placeholder}
            id={this.props.id}
            height={this.props.height}
            >
                <MediaResizing enabled={true} />
                <Toolbar>
                    <Item name="undo" />
                    <Item name="redo" />
                    <Item name="separator" />
                    <Item
                    name="header"
                    />
                    <Item
                    name="size"
                    acceptedValues={this.sizeValues}
                    />
                    <Item
                    name="font"
                    acceptedValues={this.fontValues}
                    />
                    <Item name="color" />
                    <Item name="separator" />
                    <Item name="bold" />
                    <Item name="italic" />
                    <Item name="strike" />
                    <Item name="underline" />
                    <Item name="separator" />
                    <Item name="alignLeft" />
                    <Item name="alignCenter" />
                    <Item name="alignRight" />
                    <Item name="alignJustify" />
                    <Item name="separator" />
                    <Item name="image" />

                </Toolbar>
            </HtmlEditor>
        )
    }
}