import React from 'react';
import NbBase from './base.js';

export default class NbPanel
{
    constructor(props)
    {
        this.state.visibility = typeof props.visibility == 'undefined' ? 'visible' : props.visibility
    }
}
export class NbPanelPage
{
    constructor(props)
    {

    }
    render()
    {
        return(
            <React.Fragment>
              <div id={this.props.id} style={visibility =this.state.visibility}>

              </div>
            </React.Fragment>
        
        )
            
    }
}