import React from 'react';
import {Button} from 'devextreme-react/button';
import Base from './base.js';

export default class NdButton extends Base
{
    constructor(props)
    {
        super(props)

        this.state.text = props.text;
        this.state.icon = props.icon;
        this.state.width = props.width;
        this.state.height = props.height;
        this.state.type = props.type;
        this.state.stylingMode = props.stylingMode;
        this.state.disabled = props.disabled;
        this.state.elementAttr = props.elementAttr;

        this._onClick = this._onClick.bind(this);
    }
    //#region Private
    async _onClick(e)
    {
        if(typeof this.props.onClick != 'undefined')
        {
            if(typeof this.props.access != 'undefined' && typeof this.props.access.getValue().dialog != 'undefined' && this.props.access.getValue().dialog.type != -1)
            {   
                let tmpResult = await acsDialog({id:"AcsDialog",parent:this.props.parent,type:this.props.access.getValue().dialog.type})
                if(tmpResult)
                {
                    this.props.onClick(e);
                }
            }
            else
            {
                this.props.onClick(e);
            }            
        }
    }
    //#endregion
    render()
    {
        // YETKİLENDİRMEDEN GELEN GÖRÜNÜR GÖRÜNMEZ DURUMU. DEĞER BASE DEN GELİYOR.
        if(this.state.visible == false)
        {
            return <div></div>
        }

        return (
            <Button id={this.props.id} 
            style={this.props.style}
            location={this.props.location}
            text={this.state.text} 
            width={this.state.width} 
            height={this.state.height} 
            type={this.state.type} 
            stylingMode={this.state.stylingMode}
            icon={this.state.icon}
            onClick={this._onClick}
            validationGroup={this.props.validationGroup}
            disabled={this.state.disabled}
            elementAttr={this.state.elementAttr}
            />
        )
    }
}