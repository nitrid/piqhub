import React from "react";
import NbBase from "../core/react/bootstrap/base.js";
import App from '../lib/app.js';
import {TreeView,SearchEditorOptions} from 'devextreme-react/tree-view';

export default class NdTreeView extends NbBase
{
    constructor(props)
    {
        super(props)

        this._onInitialized = this._onInitialized.bind(this);
        this._onSelectionChanged = this._onSelectionChanged.bind(this);


    }
    _onSelectionChanged(e) 
    {
        if(typeof this.props.onSelectionChanged != 'undefined')
        {
            this.props.onSelectionChanged(e);
        }
    }
    _onInitialized(e) 
    {
        this.dev = e.component;  
        if(typeof this.props.value != 'undefined')
        {
            this.dev.option('value',this.props.value)
        }
    }
    render()
    {
        return(
            <TreeView id="Menu1" 
            items = {this.props.items}
            width = {this.props.width}
            height = {this.props.height}
            selectNodesRecursive={true}
            showCheckBoxesMode={"normal"}
            selectionMode={"multiple"}
            onInitialized={this._onInitialized}
            onSelectionChanged={this._onSelectionChanged}
            >
            </TreeView>  
        )
    }
}