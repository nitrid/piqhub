import React from 'react';
import Base from './base.js';

import List from 'devextreme-react/list';

export default class NdListBox extends Base
{
    constructor(props)
    {
        super(props)
        
        this.state.value = typeof props.value == 'undefined' ? [] : props.value;

        this._onOptionChanged = this._onOptionChanged.bind(this);
        this._onItemDeleting = this._onItemDeleting.bind(this);
        this._onItemDeleted = this._onItemDeleted.bind(this);
    }
    //#region Private
    _onOptionChanged(e) 
    {
        if (e.name == 'selectedItemKeys') 
        {
            this.value = e.value;
        }
        
        if(typeof this.props.onOptionChanged != 'undefined')
        {
            this.props.onOptionChanged(e);
        }
    } 
    _onItemDeleting(e)
    {
        if(typeof this.props.onItemDeleting != 'undefined')
        {
            this.props.onItemDeleting(e);
        }
    }
    _onItemDeleted(e)
    {
        if(typeof this.props.onItemDeleted != 'undefined')
        {
            this.props.onItemDeleted(e);
        }
    }
    //#endregion
    async componentDidMount()
    {
        if(typeof this.state.data != 'undefined')
        {
            await this.dataRefresh(this.state.data)                 
        }
    }
    get value()
    {
        return this.state.value
    }
    set value(e)
    {
        this.setState({value:e})
    }    
    render()
    {
        return(
            <List
            dataSource={typeof this.state.data == 'undefined' ? undefined : this.state.data.store} 
            allowItemDeleting={this.props.allowItemDeleting}
            itemDeleteMode={this.props.itemDeleteMode}
            itemRender={this.props.itemRender}
            itemComponent={this.props.itemComponent}
            collapsibleGroups={this.props.collapsibleGroups}
            grouped={this.props.grouped}
            groupRender={this.props.groupRender}
            groupTemplate={this.props.groupTemplate}
            width={this.props.width}
            height={this.props.height}
            displayExpr={this.props.displayExpr}
            keyExpr={this.props.keyExpr}
            showSelectionControls={this.props.showSelectionControls}
            selectionMode={this.props.selectionMode}
            selectAllMode={this.props.selectAllMode}
            selectedItemKeys={this.state.value}
            onOptionChanged={this._onOptionChanged}
            onItemDeleting={this._onItemDeleting}
            onItemDeleted={this._onItemDeleted}
            >
            </List>
        )
    }
}