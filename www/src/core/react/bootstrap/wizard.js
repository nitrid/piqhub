import React from 'react';
import NbBase from './base.js';

export default class NbWizard extends NbBase
{
    constructor(props)
    {
        super(props)
        this.state =
        {
            currentStep : "",
        }
    }
    componentDidMount()
    {
        if(typeof this.props.onInit != 'undefined')
        {
            this.props.onInit()
        }
    }
    setStep(step)
    {
        this.setState({currentStep:step},()=>
        {
            if(typeof this.props.onStep != 'undefined')
            {
                this.props.onStep()
            }
        })
    }
    render()
    {
        return (
            <React.Fragment>
                {this.props.children.map((item) => 
                {
                    return (
                        <div key={item.props.id} style={{display: this.state.currentStep === item.props.id ? 'block' : 'none'}}>
                            {item}
                        </div>
                    );
                })}
            </React.Fragment>
        )
    }
}