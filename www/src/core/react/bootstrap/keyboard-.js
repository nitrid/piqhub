import React from 'react';
import NbBase from './base.js';
import NbButton from './button.js';

export default class NbKeyboard extends NbBase
{
    constructor(props)
    {
        super(props);
        this.state =
        {
            span: typeof this.props.span == 'undefined' ? '0' : this.props.span,
            buttonHeight : typeof this.props.buttonHeight == 'undefined' ? '60px' : this.props.buttonHeight,
            textobj : this.props.textobj,
            shift : typeof this.props.shift == 'undefined' ? false : this.props.shift
        }
        if(typeof this.state.textobj != 'undefined')
        {
            this[this.state.textobj] = this.props.parent[this.state.textobj]
        }

        this.keyUpDown = this.keyUpDown.bind(this)
        this.shiftPress = this.shiftPress.bind(this)
    }
    get textobj()
    {
        return this.state.textobj
    }
    set textobj(e)
    {
        this.setState({textobj:e})
        this[e] = this.props.parent[e]
    }
    keyUpDown(pKey)
    {
     
        if(this.state.shift == true)
        {
            return(pKey.toUpperCase())
        }
        else if(this.state.shift == false)
        {
            return(pKey.toLowerCase())
        }

    }
    shiftPress()
    {
        if(this.state.shift == true)
        {
            this.state.shift = false
            this.forceUpdate();
        }
        else if(this.state.shift == false)
        {
            this.state.shift = true
            this.forceUpdate();
        }
    }
    render()
    {
        return(
            <div>
                <div className='row'>
                    <div className={'col-1 pb-' + this.state.span + ' pe-' + this.state.span}>
                        <NbButton id={"btn" + this.props.id + "01"} parent={this} keyBtn={{textbox:this.state.textobj,key:"1"}} 
                        className="form-group btn btn-primary btn-block" style={{height:this.state.buttonHeight,width:'100%',fontSize:'16px'}}>1</NbButton> 
                    </div>
                    <div className={'col-1 pb-' + this.state.span + ' px-' + this.state.span}>
                        <NbButton id={"btn" + this.props.id + "02"} parent={this} keyBtn={{textbox:this.state.textobj,key:"2"}} 
                        className="form-group btn btn-primary btn-block" style={{height:this.state.buttonHeight,width:'100%',fontSize:'16px'}}>2</NbButton> 
                    </div>
                    <div className={'col-1 pb-' + this.state.span + ' px-' + this.state.span}>
                        <NbButton id={"btn" + this.props.id + "03"} parent={this} keyBtn={{textbox:this.state.textobj,key:"3"}} 
                        className="form-group btn btn-primary btn-block" style={{height:this.state.buttonHeight,width:'100%',fontSize:'16px'}}>3</NbButton> 
                    </div>
                    <div className={'col-1 pb-' + this.state.span + ' px-' + this.state.span}>
                        <NbButton id={"btn" + this.props.id + "04"} parent={this} keyBtn={{textbox:this.state.textobj,key:"4"}} 
                        className="form-group btn btn-primary btn-block" style={{height:this.state.buttonHeight,width:'100%',fontSize:'16px'}}>4</NbButton> 
                    </div>
                    <div className={'col-1 pb-' + this.state.span + ' px-' + this.state.span}>
                        <NbButton id={"btn" + this.props.id + "05"} parent={this} keyBtn={{textbox:this.state.textobj,key:"5"}} 
                        className="form-group btn btn-primary btn-block" style={{height:this.state.buttonHeight,width:'100%',fontSize:'16px'}}>5</NbButton> 
                    </div>
                    <div className={'col-1 pb-' + this.state.span + ' px-' + this.state.span}>
                        <NbButton id={"btn" + this.props.id + "06"} parent={this} keyBtn={{textbox:this.state.textobj,key:"6"}} 
                        className="form-group btn btn-primary btn-block" style={{height:this.state.buttonHeight,width:'100%',fontSize:'16px'}}>6</NbButton> 
                    </div>
                    <div className={'col-1 pb-' + this.state.span + ' px-' + this.state.span}>
                        <NbButton id={"btn" + this.props.id + "07"} parent={this} keyBtn={{textbox:this.state.textobj,key:"7"}} 
                        className="form-group btn btn-primary btn-block" style={{height:this.state.buttonHeight,width:'100%',fontSize:'16px'}}>7</NbButton> 
                    </div>
                    <div className={'col-1 pb-' + this.state.span + ' px-' + this.state.span}>
                        <NbButton id={"btn" + this.props.id + "08"} parent={this} keyBtn={{textbox:this.state.textobj,key:"8"}} 
                        className="form-group btn btn-primary btn-block" style={{height:this.state.buttonHeight,width:'100%',fontSize:'16px'}}>8</NbButton> 
                    </div>
                    <div className={'col-1 pb-' + this.state.span + ' px-' + this.state.span}>
                        <NbButton id={"btn" + this.props.id + "09"} parent={this} keyBtn={{textbox:this.state.textobj,key:"9"}} 
                        className="form-group btn btn-primary btn-block" style={{height:this.state.buttonHeight,width:'100%',fontSize:'16px'}}>9</NbButton> 
                    </div>
                    <div className={'col-1 pb-' + this.state.span + ' px-' + this.state.span}>
                        <NbButton id={"btn" + this.props.id + "10"} parent={this} keyBtn={{textbox:this.state.textobj,key:"0"}} 
                        className="form-group btn btn-primary btn-block" style={{height:this.state.buttonHeight,width:'100%',fontSize:'16px'}}>0</NbButton> 
                    </div>
                    <div className={'col-2 pb-' + this.state.span + ' ps-' + this.state.span}>
                        <NbButton id={"btn" + this.props.id + "11"} parent={this} keyBtn={{textbox:this.state.textobj,key:"Backspace"}} 
                        className="form-group btn btn-primary btn-block" style={{height:this.state.buttonHeight,width:'100%'}}>
                            <i className="text-white fa-solid fa-delete-left" style={{fontSize: '16px'}} />
                        </NbButton> 
                    </div>
                </div>
                <div className='row'>
                    <div className={'col-1 py-' + this.state.span + ' pe-' + this.state.span}>
                        <NbButton id={"btn" + this.props.id + "12"} parent={this} keyBtn={{textbox:this.state.textobj,key:this.keyUpDown('Q')}} 
                        className="form-group btn btn-primary btn-block" style={{height:this.state.buttonHeight,width:'100%',fontSize:'16px'}}>{this.keyUpDown('Q')}</NbButton> 
                    </div>
                    <div className={'col-1 py-' + this.state.span + ' px-' + this.state.span}>
                        <NbButton id={"btn" + this.props.id + "13"} parent={this} keyBtn={{textbox:this.state.textobj,key:this.keyUpDown("W")}} 
                        className="form-group btn btn-primary btn-block" style={{height:this.state.buttonHeight,width:'100%',fontSize:'16px'}}>{this.keyUpDown('W')}</NbButton> 
                    </div>
                    <div className={'col-1 py-' + this.state.span + ' px-' + this.state.span}>
                        <NbButton id={"btn" + this.props.id + "14"} parent={this} keyBtn={{textbox:this.state.textobj,key:this.keyUpDown("E")}} 
                        className="form-group btn btn-primary btn-block" style={{height:this.state.buttonHeight,width:'100%',fontSize:'16px'}}>{this.keyUpDown('E')}</NbButton> 
                    </div>
                    <div className={'col-1 py-' + this.state.span + ' px-' + this.state.span}>
                        <NbButton id={"btn" + this.props.id + "15"} parent={this} keyBtn={{textbox:this.state.textobj,key:this.keyUpDown("R")}} 
                        className="form-group btn btn-primary btn-block" style={{height:this.state.buttonHeight,width:'100%',fontSize:'16px'}}>{this.keyUpDown('R')}</NbButton> 
                    </div>
                    <div className={'col-1 py-' + this.state.span + ' px-' + this.state.span}>
                        <NbButton id={"btn" + this.props.id + "16"} parent={this} keyBtn={{textbox:this.state.textobj,key:this.keyUpDown("T")}} 
                        className="form-group btn btn-primary btn-block" style={{height:this.state.buttonHeight,width:'100%',fontSize:'16px'}}>{this.keyUpDown('T')}</NbButton> 
                    </div>
                    <div className={'col-1 py-' + this.state.span + ' px-' + this.state.span}>
                        <NbButton id={"btn" + this.props.id + "17"} parent={this} keyBtn={{textbox:this.state.textobj,key:this.keyUpDown("Y")}} 
                        className="form-group btn btn-primary btn-block" style={{height:this.state.buttonHeight,width:'100%',fontSize:'16px'}}>{this.keyUpDown('Y')}</NbButton> 
                    </div>
                    <div className={'col-1 py-' + this.state.span + ' px-' + this.state.span}>
                        <NbButton id={"btn" + this.props.id + "18"} parent={this} keyBtn={{textbox:this.state.textobj,key:this.keyUpDown("U")}} 
                        className="form-group btn btn-primary btn-block" style={{height:this.state.buttonHeight,width:'100%',fontSize:'16px'}}>{this.keyUpDown('U')}</NbButton> 
                    </div>
                    <div className={'col-1 py-' + this.state.span + ' px-' + this.state.span}>
                        <NbButton id={"btn" + this.props.id + "19"} parent={this} keyBtn={{textbox:this.state.textobj,key:this.keyUpDown("I")}} 
                        className="form-group btn btn-primary btn-block" style={{height:this.state.buttonHeight,width:'100%',fontSize:'16px'}}>{this.keyUpDown('I')}</NbButton> 
                    </div>
                    <div className={'col-1 py-' + this.state.span + ' px-' + this.state.span}>
                        <NbButton id={"btn" + this.props.id + "20"} parent={this} keyBtn={{textbox:this.state.textobj,key:this.keyUpDown("O")}} 
                        className="form-group btn btn-primary btn-block" style={{height:this.state.buttonHeight,width:'100%',fontSize:'16px'}}>{this.keyUpDown('O')}</NbButton> 
                    </div>
                    <div className={'col-1 py-' + this.state.span + ' px-' + this.state.span}>
                        <NbButton id={"btn" + this.props.id + "21"} parent={this} keyBtn={{textbox:this.state.textobj,key:this.keyUpDown("P")}} 
                        className="form-group btn btn-primary btn-block" style={{height:this.state.buttonHeight,width:'100%',fontSize:'16px'}}>{this.keyUpDown('P')}</NbButton> 
                    </div>
                    <div className={'col-1 py-' + this.state.span + ' px-' + this.state.span}>
                        <NbButton id={"btn" + this.props.id + "22"} parent={this} keyBtn={{textbox:this.state.textobj,key:this.keyUpDown("Ğ")}} 
                        className="form-group btn btn-primary btn-block" style={{height:this.state.buttonHeight,width:'100%',fontSize:'16px'}}>{this.keyUpDown('Ğ')}</NbButton> 
                    </div>
                    <div className={'col-1 py-' + this.state.span + ' ps-' + this.state.span}>
                    <NbButton id={"btn" + this.props.id + "23"} parent={this} keyBtn={{textbox:this.state.textobj,key:this.keyUpDown("Ü")}} 
                        className="form-group btn btn-primary btn-block" style={{height:this.state.buttonHeight,width:'100%',fontSize:'16px'}}>{this.keyUpDown('Ü')}</NbButton> 
                    </div>
                </div>
                <div className='row'>
                    <div className={'col-1 py-' + this.state.span + ' pe-' + this.state.span}>
                        <NbButton id={"btn" + this.props.id + "24"} parent={this} keyBtn={{textbox:this.state.textobj,key:this.keyUpDown("A")}} 
                        className="form-group btn btn-primary btn-block" style={{height:this.state.buttonHeight,width:'100%',fontSize:'16px'}}>{this.keyUpDown('A')}</NbButton> 
                    </div>
                    <div className={'col-1 py-' + this.state.span + ' px-' + this.state.span}>
                        <NbButton id={"btn" + this.props.id + "25"} parent={this} keyBtn={{textbox:this.state.textobj,key:this.keyUpDown("S")}} 
                        className="form-group btn btn-primary btn-block" style={{height:this.state.buttonHeight,width:'100%',fontSize:'16px'}}>{this.keyUpDown('S')}</NbButton> 
                    </div>
                    <div className={'col-1 py-' + this.state.span + ' px-' + this.state.span}>
                        <NbButton id={"btn" + this.props.id + "26"} parent={this} keyBtn={{textbox:this.state.textobj,key:this.keyUpDown("D")}} 
                        className="form-group btn btn-primary btn-block" style={{height:this.state.buttonHeight,width:'100%',fontSize:'16px'}}>{this.keyUpDown('D')}</NbButton> 
                    </div>
                    <div className={'col-1 py-' + this.state.span + ' px-' + this.state.span}>
                        <NbButton id={"btn" + this.props.id + "27"} parent={this} keyBtn={{textbox:this.state.textobj,key:this.keyUpDown("F")}} 
                        className="form-group btn btn-primary btn-block" style={{height:this.state.buttonHeight,width:'100%',fontSize:'16px'}}>{this.keyUpDown('F')}</NbButton> 
                    </div>
                    <div className={'col-1 py-' + this.state.span + ' px-' + this.state.span}>
                        <NbButton id={"btn" + this.props.id + "28"} parent={this} keyBtn={{textbox:this.state.textobj,key:this.keyUpDown("G")}} 
                        className="form-group btn btn-primary btn-block" style={{height:this.state.buttonHeight,width:'100%',fontSize:'16px'}}>{this.keyUpDown('G')}</NbButton> 
                    </div>
                    <div className={'col-1 py-' + this.state.span + ' px-' + this.state.span}>
                        <NbButton id={"btn" + this.props.id + "29"} parent={this} keyBtn={{textbox:this.state.textobj,key:this.keyUpDown("H")}} 
                        className="form-group btn btn-primary btn-block" style={{height:this.state.buttonHeight,width:'100%',fontSize:'16px'}}>{this.keyUpDown('H')}</NbButton> 
                    </div>
                    <div className={'col-1 py-' + this.state.span + ' px-' + this.state.span}>
                        <NbButton id={"btn" + this.props.id + "30"} parent={this} keyBtn={{textbox:this.state.textobj,key:this.keyUpDown("J")}} 
                        className="form-group btn btn-primary btn-block" style={{height:this.state.buttonHeight,width:'100%',fontSize:'16px'}}>{this.keyUpDown('J')}</NbButton> 
                    </div>
                    <div className={'col-1 py-' + this.state.span + ' px-' + this.state.span}>
                        <NbButton id={"btn" + this.props.id + "31"} parent={this} keyBtn={{textbox:this.state.textobj,key:this.keyUpDown("K")}} 
                        className="form-group btn btn-primary btn-block" style={{height:this.state.buttonHeight,width:'100%',fontSize:'16px'}}>{this.keyUpDown('K')}</NbButton> 
                    </div>
                    <div className={'col-1 py-' + this.state.span + ' px-' + this.state.span}>
                        <NbButton id={"btn" + this.props.id + "32"} parent={this} keyBtn={{textbox:this.state.textobj,key:this.keyUpDown("L")}} 
                        className="form-group btn btn-primary btn-block" style={{height:this.state.buttonHeight,width:'100%',fontSize:'16px'}}>{this.keyUpDown('L')}</NbButton> 
                    </div>
                    <div className={'col-1 py-' + this.state.span + ' px-' + this.state.span}>
                        <NbButton id={"btn" + this.props.id + "33"} parent={this} keyBtn={{textbox:this.state.textobj,key:this.keyUpDown("Ş")}} 
                        className="form-group btn btn-primary btn-block" style={{height:this.state.buttonHeight,width:'100%',fontSize:'16px'}}>{this.keyUpDown('Ş')}</NbButton> 
                    </div>
                    <div className={'col-1 py-' + this.state.span + ' px-' + this.state.span}>
                        <NbButton id={"btn" + this.props.id + "34"} parent={this} keyBtn={{textbox:this.state.textobj,key:this.keyUpDown("İ")}} 
                        className="form-group btn btn-primary btn-block" style={{height:this.state.buttonHeight,width:'100%',fontSize:'16px'}}>{this.keyUpDown('İ')}</NbButton> 
                    </div>
                    <div className={'col-1 py-' + this.state.span + ' ps-' + this.state.span}>
                    <NbButton id={"btn" + this.props.id + "35"} parent={this} keyBtn={{textbox:this.state.textobj,key:","}} 
                        className="form-group btn btn-primary btn-block" style={{height:this.state.buttonHeight,width:'100%',fontSize:'16px'}}>,</NbButton> 
                    </div>
                </div>
                <div className='row'>
                    <div className={'col-1 py-' + this.state.span + ' pe-' + this.state.span}>
                        <NbButton id={"btn" + this.props.id + "36"} parent={this} keyBtn={{textbox:this.state.textobj,key:this.keyUpDown("Z")}} 
                        className="form-group btn btn-primary btn-block" style={{height:this.state.buttonHeight,width:'100%',fontSize:'16px'}}>{this.keyUpDown('Z')}</NbButton> 
                    </div>
                    <div className={'col-1 py-' + this.state.span + ' px-' + this.state.span}>
                        <NbButton id={"btn" + this.props.id + "37"} parent={this} keyBtn={{textbox:this.state.textobj,key:this.keyUpDown("X")}} 
                        className="form-group btn btn-primary btn-block" style={{height:this.state.buttonHeight,width:'100%',fontSize:'16px'}}>{this.keyUpDown('X')}</NbButton> 
                    </div>
                    <div className={'col-1 py-' + this.state.span + ' px-' + this.state.span}>
                        <NbButton id={"btn" + this.props.id + "38"} parent={this} keyBtn={{textbox:this.state.textobj,key:this.keyUpDown("C")}} 
                        className="form-group btn btn-primary btn-block" style={{height:this.state.buttonHeight,width:'100%',fontSize:'16px'}}>{this.keyUpDown('C')}</NbButton> 
                    </div>
                    <div className={'col-1 py-' + this.state.span + ' px-' + this.state.span}>
                        <NbButton id={"btn" + this.props.id + "39"} parent={this} keyBtn={{textbox:this.state.textobj,key:this.keyUpDown("V")}} 
                        className="form-group btn btn-primary btn-block" style={{height:this.state.buttonHeight,width:'100%',fontSize:'16px'}}>{this.keyUpDown('V')}</NbButton> 
                    </div>
                    <div className={'col-1 py-' + this.state.span + ' px-' + this.state.span}>
                        <NbButton id={"btn" + this.props.id + "40"} parent={this} keyBtn={{textbox:this.state.textobj,key:this.keyUpDown("B")}} 
                        className="form-group btn btn-primary btn-block" style={{height:this.state.buttonHeight,width:'100%',fontSize:'16px'}}>{this.keyUpDown('B')}</NbButton> 
                    </div>
                    <div className={'col-1 py-' + this.state.span + ' px-' + this.state.span}>
                        <NbButton id={"btn" + this.props.id + "41"} parent={this} keyBtn={{textbox:this.state.textobj,key:this.keyUpDown("N")}} 
                        className="form-group btn btn-primary btn-block" style={{height:this.state.buttonHeight,width:'100%',fontSize:'16px'}}>{this.keyUpDown('N')}</NbButton> 
                    </div>
                    <div className={'col-1 py-' + this.state.span + ' px-' + this.state.span}>
                        <NbButton id={"btn" + this.props.id + "42"} parent={this} keyBtn={{textbox:this.state.textobj,key:this.keyUpDown("M")}} 
                        className="form-group btn btn-primary btn-block" style={{height:this.state.buttonHeight,width:'100%',fontSize:'16px'}}>{this.keyUpDown('M')}</NbButton> 
                    </div>
                    <div className={'col-1 py-' + this.state.span + ' px-' + this.state.span}>
                        <NbButton id={"btn" + this.props.id + "43"} parent={this} keyBtn={{textbox:this.state.textobj,key:this.keyUpDown("Ö")}} 
                        className="form-group btn btn-primary btn-block" style={{height:this.state.buttonHeight,width:'100%',fontSize:'16px'}}>{this.keyUpDown('Ö')}</NbButton> 
                    </div>
                    <div className={'col-1 py-' + this.state.span + ' px-' + this.state.span}>
                        <NbButton id={"btn" + this.props.id + "44"} parent={this} keyBtn={{textbox:this.state.textobj,key:this.keyUpDown("Ç")}} 
                        className="form-group btn btn-primary btn-block" style={{height:this.state.buttonHeight,width:'100%',fontSize:'16px'}}>{this.keyUpDown('Ç')}</NbButton> 
                    </div>
                    <div className={'col-1 py-' + this.state.span + ' px-' + this.state.span}>
                        <NbButton id={"btn" + this.props.id + "45"} parent={this} keyBtn={{textbox:this.state.textobj,key:"."}} 
                        className="form-group btn btn-primary btn-block" style={{height:this.state.buttonHeight,width:'100%',fontSize:'16px'}}>.</NbButton> 
                    </div>
                    <div className={'col-1 py-' + this.state.span + ' px-' + this.state.span}>
                        <NbButton id={"btn" + this.props.id + "46"} parent={this} keyBtn={{textbox:this.state.textobj,key:"-"}} 
                        className="form-group btn btn-primary btn-block" style={{height:this.state.buttonHeight,width:'100%',fontSize:'16px'}}>-</NbButton> 
                    </div>
                    <div className={'col-1 py-' + this.state.span + ' ps-' + this.state.span}>
                        <NbButton id={"btn" + this.props.id + "47"} parent={this} keyBtn={{textbox:this.state.textobj,key:"*"}} 
                        className="form-group btn btn-primary btn-block" style={{height:this.state.buttonHeight,width:'100%',fontSize:'16px'}}>*</NbButton> 
                    </div>
                </div>
                <div className='row'>
                    <div className={'col-1 pt-' + this.state.span + ' pe-' + this.state.span}>
                    <NbButton id={"btn" + this.props.id + "16"} parent={this} onClick={()=>{this.shiftPress()}}
                        className="form-group btn btn-primary btn-block" style={{height:this.state.buttonHeight,width:'100%',fontSize:'16px'}}>Shift</NbButton> 
                    </div>
                    <div className={'col-1 pt-' + this.state.span + ' px-' + this.state.span}>
                        
                    </div>
                    <div className={'col-1 pt-' + this.state.span + ' px-' + this.state.span}>
                        
                    </div>
                    <div className={'col-1 pt-' + this.state.span + ' px-' + this.state.span}>
                        
                    </div>
                    <div className={'col-1 pt-' + this.state.span + ' px-' + this.state.span}>
                        
                    </div>
                    <div className={'col-2 pt-' + this.state.span + ' px-' + this.state.span}>
                        <NbButton id={"btn" + this.props.id + "53"} parent={this} keyBtn={{textbox:this.state.textobj,key:" "}} 
                        className="form-group btn btn-primary btn-block" style={{height:this.state.buttonHeight,width:'100%',fontSize:'16px'}}>Space</NbButton> 
                    </div>
                    <div className={'col-1 pt-' + this.state.span + ' px-' + this.state.span}>
                        
                    </div>
                    <div className={'col-1 pt-' + this.state.span + ' px-' + this.state.span}>
                        
                    </div>
                    <div className={'col-1 pt-' + this.state.span + ' px-' + this.state.span}>
                        
                    </div>
                    <div className={'col-1 pt-' + this.state.span + ' px-' + this.state.span}>
                        
                    </div>
                    <div className={'col-1 pt-' + this.state.span + ' ps-' + this.state.span}>
                    
                    </div>
                </div>
            </div>
        )
    }
}