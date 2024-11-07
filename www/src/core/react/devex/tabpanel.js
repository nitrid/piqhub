import React from 'react';
import Base from './base.js';
import Form, { Label,Item, EmptyItem } from 'devextreme-react/form';
import TabPanel from 'devextreme-react/tab-panel';

export default class NdTabPanel extends Base
{
    constructor(props)
    {
        super(props)
        this.state.accessValue = {}
        
        this.itemData = []
        this.devTab = undefined
        
        this._onItemRendered = this._onItemRendered.bind(this)
        this._onRenderTitle = this._onRenderTitle.bind(this)
        
        this.onEditMode = async(pStatus)=>
        {
            if(pStatus)
            {
                for (let i = 0; i < this.itemData.length; i++) 
                {
                    this.itemData[i].visible = true
                }
                this.devTab.repaint()
            }
            else
            {
                if(typeof this.props.access != 'undefined' && typeof this.props.access.getValue() != 'undefined')
                {
                    for (let i = 0; i < Object.keys(this.state.accessValue).length; i++) 
                    {
                        let tmpItem = this.itemData.find(x => x.text == Object.keys(this.state.accessValue)[i])
                        if(typeof tmpItem != 'undefined')
                        {
                            tmpItem.visible = this.state.accessValue[tmpItem.text]
                        }
                    }
                    this.devTab.repaint()
                }
            }
        }
    }    
    _onItemRendered(e)
    {
        if(typeof this.props.onItemRendered != 'undefined')
        {
            this.props.onItemRendered(e);
        }
    }
    _onRenderTitle(e) 
    {
        if(!this.editMode)
        {
            return (
                <React.Fragment>
                    <div>
                        <span>
                            {e.title}
                        </span>
                    </div>
                </React.Fragment>
                );
        }
        else
        {
            return (
                <React.Fragment>
                    <div>
                        {
                            <div onClick={()=>
                            {
                                if(this.state.accessValue[e.text])
                                {
                                    this.state.accessValue[e.text] = false
                                }
                                else
                                {
                                    this.state.accessValue[e.text] = true
                                }
                                
                                this.setState({accessValue:this.state.accessValue})
                                this.devTab.repaint()
                            }}>
                                {(()=>
                                {
                                    if(this.state.accessValue[e.text])
                                    {
                                        return (<i className={"pe-1 fa-solid fa-eye"} />)
                                    }
                                    else
                                    {
                                        return(<i className={"pe-1 fa-solid fa-eye-slash"} />)
                                    }
                                })()}
                                
                            </div>
                        }
                        <span>
                            {e.title}
                        </span>
                    </div>
                </React.Fragment>
                );
        }
    }
    setItemVisible(pIndex,pStatus)
    {
        this.itemData[pIndex].visible = pStatus        
        this.devTab.repaint()
    }
    render()
    {
        return (
            <TabPanel height={this.props.height} onItemRendered={this._onItemRendered} itemTitleRender={this._onRenderTitle}
            onInitialized={(e)=>
            {
                this.devTab = e.component
                this.itemData = this.devTab.option('items')
        
                if(typeof this.props.access != 'undefined' && typeof this.props.access.getValue() != 'undefined')
                {
                        this.setState({accessValue:this.props.access.getValue()},()=>
                    {
                        for (let i = 0; i < Object.keys(this.state.accessValue).length; i++) 
                        {
                            let tmpItem = this.itemData.find(x => x.text == Object.keys(this.state.accessValue)[i])
                            if(typeof tmpItem != 'undefined')
                            {
                                tmpItem.visible = this.state.accessValue[tmpItem.text]
                            }
                        }
                        this.devTab.repaint()
                    })
                }
            }}>
                {this.props.children}
            </TabPanel>
        )
    }
}