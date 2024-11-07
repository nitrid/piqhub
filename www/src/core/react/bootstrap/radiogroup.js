import React from 'react';
import NbBase from './base.js';

export default class NbRadioButton extends NbBase
{
    constructor(props)
    {
        super(props)

        let tmpBtnClass = []
        if(typeof this.props.button != 'undefined')
        {
            for (let i = 0; i < this.props.button.length; i++) 
            {
                tmpBtnClass.push('-outline')
            }
        }
        
        this.state = 
        {
            btnClass : tmpBtnClass,
            value : 0,
            vertical : typeof this.props.vertical == 'undefined' ? true : this.props.vertical
        }
        this._onClick = this._onClick.bind(this)
    }
    get value()
    {
        return this.state.value
    }
    set value(e)
    {
        for (let x = 0; x < this.state.btnClass.length; x++) 
        {
            this.state.btnClass[x] = "-outline"
        }
        this.state.btnClass[e] = ""

        this.setState({btnClass:this.state.btnClass,value:e})
    }
    _onClick(e)
    {
        if(typeof this.props.onClick != 'undefined')
        {
            this.props.onClick(e)
        }
    }
    _buttonView()
    {
        if(typeof this.props.button != 'undefined')
        {
            let tmp = []
            
            let tmpIconFn = (pIcon) =>
            {
                if(typeof pIcon != 'undefined')
                {
                    pIcon = "fa-solid " + pIcon
                    return (
                        <div className='row'>
                            <div className='col-12'>
                                <i className={pIcon} style={{fontSize: "20px"}} />
                            </div>
                        </div>
                    )
                }
                return
            }
            let tmpTextFn = (pText) =>
            {
                if(typeof pText != 'undefined')
                {
                    return (
                        <div className='row'>
                            <div className='col-12'>
                                <span>{pText}</span>
                            </div>
                        </div>
                    )
                }
                return
            }

            for (let i = 0; i < this.props.button.length; i++) 
            {
                let tmpClass = "btn btn-block btn" + this.state.btnClass[i] + "-primary"
                tmp.push (
                    <button className={tmpClass} key={this.props.button[i].id} id={this.props.button[i].id} style={this.props.button[i].style}
                    onClick={()=>
                    {
                        for (let x = 0; x < this.state.btnClass.length; x++) 
                        {
                            this.state.btnClass[x] = "-outline"
                        }
                        this.state.btnClass[i] = ""
                        
                        let tmpIndex = typeof this.props.button[i].index != 'undefined' ? this.props.button[i].index : i

                        this.setState({btnClass:this.state.btnClass,value:tmpIndex})
                        this._onClick(i)
                    }}>
                        {tmpIconFn(this.props.button[i].icon)}
                        {tmpTextFn(this.props.button[i].text)}
                    </button>
                )
            }
            return tmp
        }
    }
    render()
    {
        return (
            <div className="row" style={{height : (typeof this.props.height == 'undefined' ? '100%' : this.props.height)}}>
                <div className='col-12 pe-1'>
                    <div className={"btn-group" + (this.state.vertical == true ? "-vertical" : "")} 
                    style={{width: (typeof this.props.width == 'undefined' ? '100%' : this.props.width), height : (typeof this.props.height == 'undefined' ? '100%' : this.props.height)}}>
                        {this._buttonView()}
                    </div>
                </div>            
            </div>
        )
    }
}