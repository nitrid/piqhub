import React from "react";
import NbBase from "./base.js";

export class NbCheckBox extends NbBase
{
    constructor(props)
    {
        super(props)
        this.state.value = typeof props.value == 'undefined' ? false  : props.value;
        this.state.text = typeof props.text == 'undefined' ? ''  : props.text;
        this.state.style = this.props.style

        this._onChange = this._onChange.bind(this)
    }
    _onChange() 
    {
        const newValue = !this.state.value;
        this.setState({ value: newValue },()=>
        {
            if (typeof this.props.onChange !== 'undefined') 
            {
                this.props.onChange(this.state.text, newValue);
            }
        });
    }
    render()
    {
        return(
            <div className="form-check form-switch" style={this.state.style}>
                <input className="form-check-input" type="checkbox" id={this.props.id} checked={this.state.value} onChange={this._onChange}/>
                <label className="form-check-label">{this.state.text}</label>
            </div>
        )
    }
}
export class NbCheckBoxGroup extends NbBase 
{
    constructor(props) 
    {
        super(props);
        this.state = 
        {
            items: this.props.items
        };

        this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
    }
    handleCheckboxChange(title, value) 
    {
        this.setState((prevState) => 
        {
            const { maxSelectable } = this.props;
            let selectedCount = prevState.items.filter(item => item.VALUE).length;

            const updatedItems = prevState.items.map(item => 
            {
                if (item.TITLE === title) 
                {
                    if (value) 
                    {
                        if (selectedCount < maxSelectable) 
                        {
                            return { ...item, VALUE: true };
                        }
                    } 
                    else 
                    {
                        return { ...item, VALUE: false };
                    }
                }
                return item;
            });
        
            return { items: updatedItems };
        },()=>
        {
            if(typeof this.props.onChange != 'undefined')
            {
                this.props.onChange(this.state.items);
            }
        });
    }
    render() 
    {
        const { renderCheckbox } = this.props;
        const { items } = this.state;

        return (
            <div>
                {items.map((item, index) => 
                (
                    <React.Fragment key={index}>
                        {renderCheckbox(item, item.VALUE, this.handleCheckboxChange)}
                    </React.Fragment>
                ))}
            </div>
        );
    }
}