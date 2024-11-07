import React from 'react';
import Base from './base.js';

import DropDownBox from 'devextreme-react/drop-down-box';

export default class NdDropDownBox extends Base
{
    constructor(props)
    {
        super(props)
        
        this.state.value = typeof props.value == 'undefined' ? [] : props.value;

        this._onValueChanged = this._onValueChanged.bind(this);
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
    _dropDownView()
    {
        return(
            <DropDownBox
            value={this.state.value}
            valueExpr={this.props.valueExpr}
            displayExpr={this.props.displayExpr} 
            placeholder={this.props.placeholder}
            showClearButton={this.props.showClearButton}
            dataSource={typeof this.state.data == 'undefined' ? undefined : this.state.data.store} 
            onValueChanged={this._onValueChanged}
            contentRender={this.props.contentRender}
            >
            </DropDownBox>
        )
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
        if(typeof this.props.simple != 'undefined' && this.props.simple)
        {
            return this._dropDownView()
        }
        else
        {
            return (
                <div className="dx-field">
                    <div className="dx-field-label">{typeof this.props.title == 'undefined' ? '' : this.props.title}</div>
                    <div className="dx-field-value">
                        {this._dropDownView()}
                    </div>
                </div>
            )            
        }
    }
}