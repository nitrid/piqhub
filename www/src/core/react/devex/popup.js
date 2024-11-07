import React from 'react';
import { Popup, Position, ToolbarItem } from 'devextreme-react/popup';
import ScrollView from 'devextreme-react/scroll-view';
import Base from './base.js';

export {Position,ToolbarItem}

export default class NdPopUp extends Base
{
    constructor(props)
    {
        super(props);
        
        this.state.show = typeof props.visible == 'undefined' ? false : props.visible
        this.state.type = typeof props.type == 'undefined' ? '' : props.type
        this.state.dragEnabled = typeof props.dragEnabled == 'undefined' ? false : props.dragEnabled
        this.state.closeOnOutsideClick = typeof props.closeOnOutsideClick == 'undefined' ? false : props.closeOnOutsideClick
        this.state.showCloseButton = typeof props.showCloseButton == 'undefined' ? false : props.showCloseButton
        this.state.showTitle = typeof props.showTitle == 'undefined' ? false : props.showTitle
        this.state.title = typeof props.title == 'undefined' ? '' : props.title
        this.state.container = typeof props.container == 'undefined' ? undefined : props.container
        this.state.width = typeof props.width == 'undefined' ? 'auto' : props.width
        this.state.height = typeof props.height == 'undefined' ? 'auto' : props.height
        this.state.position = typeof props.position == 'undefined' ? undefined : props.position
        
        this.onHiding = this.onHiding.bind(this);

        this.devPop = null
    }
    _contentView()
    {
        if(typeof this.props.scroll == 'undefined' || this.props.scroll == true)
        {            
            return(
                <ScrollView width='100%' height='100%'>
                    {this.props.children}
                </ScrollView>
            )            
        }
        else if(typeof this.props.scroll != 'undefined' || this.props.scroll == false)
        {
            return(this.props.children)
        }
    }
    _toolbarView()
    {
        return(this.props.toolbarItem)
    }
    async show()
    {  
        await this.setState(
        {
            show: true
        });
        return new Promise(async resolve => 
        {
            this.devPop.on('shown',()=>
            {
                resolve()
            })
        })
    } 
    hide()
    {      
        this.setState(
        {
            show: false
        });
    }    
    setTitle(pVal)
    {
        this.setState(
        {
            showTitle: true,
            title: pVal
        });
    }
    onShowing()
    {
        if(typeof this.props.onShowing != 'undefined')
        {
            this.props.onShowing();
        }
    }
    onShowed()
    {
        if(typeof this.props.onShowed != 'undefined')
        {
            this.props.onShowed();
        }
    }
    onHiding() 
    {
        if(typeof this.props.onHiding != 'undefined')
        {
            this.props.onHiding();
        }
        this.hide();
    }
    render()
    {   
        if(typeof this.props.deferRendering == 'undefined' || this.props.deferRendering == false)
        {
            return (
                <React.Fragment>
                    <Popup
                        visible={this.state.show}
                        onHiding={this.onHiding}
                        dragEnabled={this.state.dragEnabled}
                        closeOnOutsideClick={this.state.closeOnOutsideClick}
                        showCloseButton={this.state.showCloseButton}
                        showTitle={this.state.showTitle}
                        title={this.state.title}
                        container={this.state.container}
                        width={this.state.width}
                        height={this.state.height}
                        position={this.state.position}
                        onInitialized={(e)=>
                        {
                            this.devPop = e.component
                        }}
                        onShown={this.onShowed.bind(this)}
                        onShowing={this.onShowing.bind(this)}
                        >
                        {this._contentView()}
                    </Popup>
                </React.Fragment>
            )
        }
        
        if(!this.state.show)
        {
            return null
        }

        return (
            <React.Fragment>
                <Popup
                    visible={this.state.show}
                    onHiding={this.onHiding}
                    dragEnabled={this.state.dragEnabled}
                    closeOnOutsideClick={this.state.closeOnOutsideClick}
                    showCloseButton={this.state.showCloseButton}
                    showTitle={this.state.showTitle}
                    title={this.state.title}
                    container={this.state.container}
                    width={this.state.width}
                    height={this.state.height}
                    position={this.state.position}
                    deferRendering={false}
                    onShown={this.onShowed.bind(this)}
                    onShowing={this.onShowing.bind(this)}
                    onInitialized={(e)=>
                    {
                        this.devPop = e.component
                    }}
                    contentRender={()=>
                    {
                        return this._contentView()
                    }}
                    >
                    {this.props.toolbarItem}
                </Popup>
            </React.Fragment>
        )
    }
}