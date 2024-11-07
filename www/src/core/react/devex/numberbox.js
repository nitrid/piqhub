import React from 'react';
import {NumberBox} from 'devextreme-react/number-box';
import Base,{ Validator, NumericRule, RequiredRule, CompareRule, EmailRule, PatternRule, StringLengthRule, RangeRule, AsyncRule } from './base.js';
import { core } from '../../core.js';

export { Validator, NumericRule, RequiredRule, CompareRule, EmailRule, PatternRule, StringLengthRule, RangeRule, AsyncRule }
export default class NdNumberBox extends Base
{
    constructor(props)
    {
        super(props)

        this.dev = null;
        
        this.state.value = typeof props.value != 'undefined' ? props.value : 0
        this.state.title = typeof props.title == 'undefined' ? '' : props.title
        this.state.titleAlign = typeof props.titleAlign == 'undefined' ? 'left' : props.titleAlign
        this.state.showClearButton = typeof props.showClearButton == 'undefined' ? false : props.showClearButton
        this.state.readOnly = typeof props.readOnly == 'undefined' ? false : props.readOnly        

        this._onInitialized = this._onInitialized.bind(this);
        this._onValueChanged = this._onValueChanged.bind(this)
        this._onEnterKey = this._onEnterKey.bind(this)
        this._onFocusIn = this._onFocusIn.bind(this)
        this._onFocusOut = this._onFocusOut.bind(this)
        this._onChange = this._onChange.bind(this)        
    }
    //#region Private
    _onInitialized(e) 
    {
        this.dev = e.component;    
    }
    _onValueChanged(e) 
    {         
        this.value = e.value;
        if(typeof this.props.onValueChanged != 'undefined')
        {
            this.props.onValueChanged(e);
        }
    }
    _onEnterKey()
    {
        if(typeof this.props.onEnterKey != 'undefined')
        {
            this.props.onEnterKey();
        }
    }
    _onFocusIn(e)
    {
        if(typeof this.props.selectAll == 'undefined' || this.props.selectAll == true)
        {
            this.dev.element().getElementsByTagName('input')[1].select()
        }
        if(typeof this.props.onFocusIn != 'undefined')
        {
            this.props.onFocusIn(e);
        }
    }
    _onFocusOut()
    {
        if(typeof this.props.onFocusOut != 'undefined')
        {
            this.props.onFocusOut();
        }
    }
    _onChange()
    {
        if(typeof this.props.onChange != 'undefined')
        {
            this.props.onChange();
        }
    }
    _txtView()
    {
        return (
            <NumberBox showClearButton={this.state.showClearButton} height='fit-content' 
                elementAttr={this.props.elementAttr}
                style={this.props.style}
                valueChangeEvent="keyup" onValueChanged={this._onValueChanged} 
                onEnterKey={this._onEnterKey} onFocusIn={this._onFocusIn} onFocusOut={this._onFocusOut}
                onChange={this._onChange}
                value={this.state.value} 
                readOnly={this.state.readOnly}
                onInitialized={this._onInitialized}
                disabled={typeof this.props.editable == 'undefined' ? this.state.editable : this.props.editable}
                showSpinButtons={this.props.showSpinButtons}
                step={this.props.step}
                format={this.props.format}>                    
                    {this.props.children}
                    {this.validationView()}
            </NumberBox>
        )
    }
    //#endregion
    get value()
    {
        return this.state.value
    }
    set value(e)
    {        
        if(typeof e == 'undefined')
        {
            return;
        }
        //VALUE DEĞİŞTİĞİNDE BU DEĞİŞİKLİK DATATABLE A YANSITMAK İÇİN YAPILDI.
        if(typeof this.props.dt != 'undefined' && typeof this.props.dt.data != 'undefined' && this.props.dt.data.length > 0 && typeof this.props.dt.field != 'undefined')
        {            
            if(typeof this.props.dt.filter == 'undefined')
            {
                if(typeof this.props.dt.row != 'undefined' && typeof this.props.dt.data.find(x => x === this.props.dt.row) != 'undefined')
                {
                    this.props.dt.data.find(x => x === this.props.dt.row)[this.props.dt.field] = e
                }
                else
                {
                    this.props.dt.data[this.props.dt.data.length-1][this.props.dt.field] = e
                }
            }   
            else
            {
                let tmpData = this.props.dt.data.where(this.props.dt.filter);
                if(tmpData.length > 0)
                {
                    if(typeof this.props.dt.row != 'undefined' && typeof tmpData.find(x => x === this.props.dt.row) != 'undefined')
                    {
                        tmpData.find(x => x === this.props.dt.row)[this.props.dt.field] = e
                    }
                    else
                    {
                        tmpData[tmpData.length-1][this.props.dt.field] = e
                    }
                }
            }
        }
        
        this.setState({value:e})        
    } 
    get readOnly()
    {
        return this.state.readOnly
    }
    set readOnly(e)
    {
        this.setState({readOnly:e})
    }
    focus()
    {
       this.dev.focus();
    }
    render()
    {               
        // YETKİLENDİRMEDEN GELEN GÖRÜNÜR GÖRÜNMEZ DURUMU. DEĞER BASE DEN GELİYOR.
        if(this.state.visible == false)
        {
            return <div></div>
        }

        if(typeof this.props.simple != 'undefined' && this.props.simple)
        {
            return this._txtView()
        }

        if(this.state.title == '')
        {
            return (
                <div className="dx-field">
                    {this._txtView()}
                </div>
            )
        }
        else
        {
            // TITLE POZISYONU LEFT,RIGHT,TOP,BOTTOM 
            if(typeof this.state.titleAlign == 'undefined')
            {
                return (
                    <div className="dx-field">
                        <div className="dx-field-label" style={{textAlign:'right'}}>{this.state.title}</div>
                        {this._txtView()}
                    </div>
                )
            }
            else if(this.state.titleAlign == 'top')
            {
                return (
                    <div className="dx-field">
                        <div>{this.state.title}</div>
                        {this._txtView()}
                    </div>
                )
            }
            else if(this.state.titleAlign == 'bottom')
            {
                return (
                    <div className="dx-field">                        
                        {this._txtView()}
                        <div>{this.state.option.title}</div>
                    </div>
                )
            }
            else if(this.state.titleAlign == 'left')
            {
                return (
                    <div className="dx-field">
                        <div className="dx-field-label" style={{textAlign:'right'}}>{this.state.title}</div>
                        {this._txtView()}
                    </div>
                )
            }
            else if(this.state.titleAlign == 'right')
            {
                return (
                    <div className="dx-field">                        
                        {this._txtView()}
                        <div className="dx-field-label" style={{float:'right',paddingLeft:'15px'}}>{this.state.title}</div>
                    </div>
                )
            }
        }
    }
}