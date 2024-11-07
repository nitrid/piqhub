import React from 'react';
import Base from './base.js';

import Toolbar,{Item} from 'devextreme-react/toolbar';
import TabPanel from 'devextreme-react/tab-panel';

export {Item}

export default class NdPagerTab extends Base
{
    constructor(props)
    {
        super(props)
        this.devGrid = null

        this._onInitialized = this._onInitialized.bind(this)
        this._onItemRendered = this._onItemRendered.bind(this)
        this._onSelectionChanged = this._onSelectionChanged.bind(this)
    }
    _onInitialized(e) 
    {
        this.devGrid = e.component;
    } 
    _onItemRendered(e)
    {
        if(typeof this.props.onItemRendered != 'undefined')
        {
            this.props.onItemRendered(e);
        }
    }
    _onSelectionChanged(e)
    {
        if(typeof this.props.onSelectionChanged != 'undefined')
        {
            this.props.onSelectionChanged(e);
        }
    }
    pageSelect(e)
    {
        if(typeof e != 'number')
        {
            let tmpItem = this.devGrid.option('items')
            if(typeof tmpItem != 'undefined' && Array.isArray(tmpItem))
            {
                e = tmpItem.findIndex(x => x.name == e)
            }
        }
        
        this.devGrid.option('selectedIndex',e)
    }
    componentDidMount()
    {
        document.getElementsByClassName("dx-tabpanel-tabs")[0].style.visibility = 'hidden'
        document.getElementsByClassName("dx-tabpanel-tabs")[0].style.height = '0'
    }
    render()
    {
        return (
            <TabPanel height="100%" animationEnabled={false} deferRendering={false}
            onItemRendered={this._onItemRendered} onInitialized={this._onInitialized}
            onSelectionChanged={this._onSelectionChanged}>
                {this.props.children}
            </TabPanel>
        )
    }
}