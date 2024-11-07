import React from 'react';
import { datatable } from '../../core.js';

export default class NbBase extends React.PureComponent
{
    constructor(props)
    {
        super(props)
        this.state = 
        {
            data : typeof props.data == 'undefined' ? undefined : props.data,
        }
        // GÖRÜNÜR DURUMU. YETKİLENDİRME.
        if(typeof this.props.access != 'undefined' && typeof this.props.access.getValue().visible != 'undefined')
        {   
            this.state.visible = this.props.access.getValue().visible
        }
        else
        {
            this.state.visible = true;
        }
        // EDİT EDİLEBİLİRLİK DURUMU. YETKİLENDİRME.
        if(typeof this.props.access != 'undefined' && typeof this.props.access.getValue().editable != 'undefined')
        {            
            this.state.editable = this.props.access.getValue().editable ? false : true
        }
        else
        {
            this.state.editable = typeof this.props.editable != 'undefined' ? this.props.editable : false;
        }

        if(typeof this.props.parent != 'undefined' && typeof this.props.id != 'undefined')
        {
            this.props.parent[this.props.id] = this
            //DİL YAPISI ELEMENTLERE ATANIYOR.
            this.lang = this.props.parent.lang
            this.t = this.props.parent.t
        }
    }
}