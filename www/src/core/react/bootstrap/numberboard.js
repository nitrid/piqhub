import React from 'react';
import NbBase from './base.js';
import NbButton from './button.js';

export default class NbNumberboard extends NbBase
{
    constructor(props)
    {
        super(props);
        this.state =
        {
            span: typeof this.props.span == 'undefined' ? '0' : this.props.span,
            buttonHeight : typeof this.props.buttonHeight == 'undefined' ? '60px' : this.props.buttonHeight,
            textobj : this.props.textobj
        }
        if(typeof this.props.textobj != 'undefined')
        {
            this[this.props.textobj] = this.props.parent[this.props.textobj]
        }
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
    render()
    {
        return(
            <div>
                <div className='row'>
                    <div className={'col-4 pb-' + this.state.span + ' pe-' + this.state.span}>
                        <NbButton id={"btn" + this.props.id + "7"} parent={this} keyBtn={{textbox:this.state.textobj,key:"7"}} 
                        className="form-group btn btn-primary btn-block" style={{height:this.state.buttonHeight,width:'100%'}}>
                            <i className="text-white fa-solid fa-7" style={{fontSize: '24px'}} />
                        </NbButton>
                    </div>
                    <div className={'col-4 pb-' + this.state.span + ' px-' + this.state.span}>
                        <NbButton id={"btn" + this.props.id + "8"} parent={this} keyBtn={{textbox:this.state.textobj,key:"8"}} 
                        className="form-group btn btn-primary btn-block" style={{height:this.state.buttonHeight,width:'100%'}}>
                            <i className="text-white fa-solid fa-8" style={{fontSize: '24px'}} />
                        </NbButton>    
                    </div>
                    <div className={'col-4 pb-' + this.state.span + ' ps-' + this.state.span}>
                        <NbButton id={"btn" + this.props.id + "9"} parent={this} keyBtn={{textbox:this.state.textobj,key:"9"}} 
                        className="form-group btn btn-primary btn-block" style={{height:this.state.buttonHeight,width:'100%'}}>
                            <i className="text-white fa-solid fa-9" style={{fontSize: '24px'}} />
                        </NbButton>    
                    </div>
                </div>
                <div className='row'>
                    <div className={'col-4 py-' + this.state.span + ' pe-' + this.state.span}>
                        <NbButton id={"btn" + this.props.id + "4"} parent={this} keyBtn={{textbox:this.state.textobj,key:"4"}} 
                        className="form-group btn btn-primary btn-block" style={{height:this.state.buttonHeight,width:'100%'}}>
                            <i className="text-white fa-solid fa-4" style={{fontSize: '24px'}} />
                        </NbButton>    
                    </div>
                    <div className={'col-4 py-' + this.state.span + ' px-' + this.state.span}>
                        <NbButton id={"btn" + this.props.id + "5"} parent={this} keyBtn={{textbox:this.state.textobj,key:"5"}} 
                        className="form-group btn btn-primary btn-block" style={{height:this.state.buttonHeight,width:'100%'}}>
                            <i className="text-white fa-solid fa-5" style={{fontSize: '24px'}} />
                        </NbButton>    
                    </div>
                    <div className={'col-4 py-' + this.state.span + ' ps-' + this.state.span}>
                        <NbButton id={"btn" + this.props.id + "6"} parent={this} keyBtn={{textbox:this.state.textobj,key:"6"}} 
                        className="form-group btn btn-primary btn-block" style={{height:this.state.buttonHeight,width:'100%'}}>
                            <i className="text-white fa-solid fa-6" style={{fontSize: '24px'}} />
                        </NbButton>    
                    </div>
                </div>
                <div className='row'>
                    <div className={'col-4 py-' + this.state.span + ' pe-' + this.state.span}>
                        <NbButton id={"btn" + this.props.id + "1"} parent={this} keyBtn={{textbox:this.state.textobj,key:"1"}} 
                        className="form-group btn btn-primary btn-block" style={{height:this.state.buttonHeight,width:'100%'}}>
                            <i className="text-white fa-solid fa-1" style={{fontSize: '24px'}} />
                        </NbButton>    
                    </div>
                    <div className={'col-4 py-' + this.state.span + ' px-' + this.state.span}>
                        <NbButton id={"btn" + this.props.id + "2"} parent={this} keyBtn={{textbox:this.state.textobj,key:"2"}} 
                        className="form-group btn btn-primary btn-block" style={{height:this.state.buttonHeight,width:'100%'}}>
                            <i className="text-white fa-solid fa-2" style={{fontSize: '24px'}} />
                        </NbButton>    
                    </div>
                    <div className={'col-4 py-' + this.state.span + ' ps-' + this.state.span}>
                        <NbButton id={"btn" + this.props.id + "3"} parent={this} keyBtn={{textbox:this.state.textobj,key:"3"}} 
                        className="form-group btn btn-primary btn-block" style={{height:this.state.buttonHeight,width:'100%'}}>
                            <i className="text-white fa-solid fa-3" style={{fontSize: '24px'}} />
                        </NbButton>    
                    </div>
                </div>
                <div className='row'>
                    <div className={'col-4 pt-' + this.state.span + ' pe-' + this.state.span}>
                        <NbButton id={"btn" + this.props.id + "Dot"} parent={this} keyBtn={{textbox:this.state.textobj,key:"."}} 
                        className="form-group btn btn-primary btn-block" style={{height:'60px',width:'100%',fontSize:'26pt'}}>
                        .
                        </NbButton>    
                    </div>
                    <div className={'col-4 pt-' + this.state.span + ' px-' + this.state.span}>
                        <NbButton id={"btn" + this.props.id + "0"} parent={this} keyBtn={{textbox:this.state.textobj,key:"0"}} 
                        className="form-group btn btn-primary btn-block" style={{height:'60px',width:'100%'}}>
                            <i className="text-white fa-solid fa-0" style={{fontSize: '24px'}} />
                        </NbButton>    
                    </div>
                    <div className={'col-4 pt-' + this.state.span + ' ps-' + this.state.span}>
                        <NbButton id={"btn" + this.props.id + "Backspace"} parent={this} keyBtn={{textbox:this.state.textobj,key:"Backspace"}} 
                        className="form-group btn btn-primary btn-block" style={{height:'60px',width:'100%'}}>
                            <i className="text-white fa-solid fa-delete-left" style={{fontSize: '24px'}} />
                        </NbButton>    
                    </div>
                </div>
            </div>
        )
    }
}