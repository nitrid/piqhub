import React from "react";
import GridLayout from "react-grid-layout";
import Base from '../devex/base.js';
import 'react-grid-layout/css/styles.css'
export class NdLayout extends Base
{
    constructor(props)
    {
        super(props)
        this.state.width = typeof this.props.width == 'undefined' ? 1200 : this.props.width
        this.state.layout = []
        this.state.accessValue = {}
        this.style = typeof this.props.style == 'undefined' ? {} : this.props.style
        this.style.position = 'relative'

        this.handleLayoutChange = this.handleLayoutChange.bind(this)
    }
    componentWillUnmount() 
    {
        this.isUnmounted = true;
    }
    componentDidMount()
    {
        const myDiv = document.getElementById(this.props.id);

        const resizeObserver = new ResizeObserver(entries =>
        {
            for (const entry of entries)
            {
                const newWidth = entry.contentRect.width;
                if (!this.isUnmounted) 
                {
                    this.setState({width : newWidth})
                }
            }
        });

        resizeObserver.observe(myDiv);
    }
    handleLayoutChange (newLayout) 
    {
        newLayout.forEach(itemL => 
        {
            React.Children.map(this.props.children,child => 
            {
                if(itemL.i.replace(/\.\$/g, "") == child.props.id)
                {
                    if(typeof child.props?.access?.getValue() != 'undefined' && typeof child.props?.access?.getValue().position != 'undefined')
                    {
                        let tmpObj = child.props.access.getValue()
    
                        if(typeof tmpObj.position.x != 'undefined')
                        {
                            tmpObj.position.x = itemL.x
                        }
                        if(typeof tmpObj.position.y != 'undefined')
                        {
                            tmpObj.position.y = itemL.y
                        }
                        if(typeof tmpObj.position.h != 'undefined')
                        {
                            tmpObj.position.h = itemL.h
                        }
                        if(typeof tmpObj.position.w != 'undefined')
                        {
                            tmpObj.position.w = itemL.w
                        }
                        
                        let tmpMeta = {...child.props.access[0]}
                        tmpMeta.VALUE = tmpObj

                        child.props.access.add(tmpMeta)
                        
                        if(typeof this.props.parent != 'undefined' && typeof this.props.parent[child.props.id] != 'undefined')
                        {
                            this.props.parent[child.props.id].setState({accessValue:child.props.access.getValue()})
                        }
                    }
                }
            })
        });
    };
    render()
    {
        return(
            <div id={this.props.id}>
                <GridLayout className="layout"
                cols={typeof this.props.cols == 'undefined' ? 12 : this.props.cols} 
                rowHeight={typeof this.props.rowHeight == 'undefined' ? 36 : this.props.rowHeight} 
                width={this.state.width}
                layout={this.state.layout}
                margin={typeof this.props.margin == 'undefined' ? [10, 10] : this.props.margin}
                onLayoutChange={this.handleLayoutChange}
                isDraggable={this.editMode}
                draggableHandle=".react-grid-dragHandleExample"
                preventCollision={typeof this.props.preventCollision == 'undefined' ? false : this.props.preventCollision}
                compactType={typeof this.props.compactType == 'undefined' ? 'vertical' : this.props.compactType}
                style={this.style}
                >
                    {React.Children.map(this.props.children, child => 
                    {
                        let tmpX = typeof child.props['data-grid']?.x == 'undefined' ? 0 : child.props['data-grid']?.x;
                        let tmpY = typeof child.props['data-grid']?.y == 'undefined' ? 0 : child.props['data-grid']?.y;
                        let tmpH = typeof child.props['data-grid']?.h == 'undefined' ? 1 : child.props['data-grid']?.h;
                        let tmpW = typeof child.props['data-grid']?.w == 'undefined' ? 1 : child.props['data-grid']?.w;
                        let tmpMinH = typeof child.props['data-grid']?.minH == 'undefined' ? 1 : child.props['data-grid']?.minH;
                        let tmpMaxH = typeof child.props['data-grid']?.maxH == 'undefined' ? 1 : child.props['data-grid']?.maxH;
                        let tmpMinW = typeof child.props['data-grid']?.minW == 'undefined' ? 1 : child.props['data-grid']?.minW;
                        let tmpMaxW = typeof child.props['data-grid']?.maxW == 'undefined' ? 1 : child.props['data-grid']?.maxW;
                        let tmpStatic = typeof child.props['data-grid']?.static == 'undefined' ? false : child.props['data-grid']?.static;
                        let tmpDragable = typeof child.props['data-grid']?.isDraggable == 'undefined' ? true : child.props['data-grid']?.isDraggable;
                        let tmpResizable = typeof child.props['data-grid']?.isResizable == 'undefined' ? true : child.props['data-grid']?.isResizable;
                        let tmpBounded = typeof child.props['data-grid']?.isBounded == 'undefined' ? false : child.props['data-grid']?.isBounded;

                        if(typeof child.props?.access?.getValue() != 'undefined' && typeof child.props?.access?.getValue().position != 'undefined')
                        {
                            if(typeof child.props.access.getValue().position.x != 'undefined')
                            {
                                tmpX = child.props.access.getValue().position.x
                            }
                            if(typeof child.props.access.getValue().position.y != 'undefined')
                            {
                                tmpY = child.props.access.getValue().position.y
                            }
                            if(typeof child.props.access.getValue().position.h != 'undefined')
                            {
                                tmpH = child.props.access.getValue().position.h
                                tmpMinH = child.props.access.getValue().position.h
                                tmpMaxH = child.props.access.getValue().position.h
                            }
                            if(typeof child.props.access.getValue().position.w != 'undefined')
                            {
                                tmpW = child.props.access.getValue().position.w
                                tmpMinW = child.props.access.getValue().position.w
                                tmpMaxW = child.props.access.getValue().position.w
                            }
                            if(typeof child.props.access.getValue().position.minH != 'undefined')
                            {
                                tmpMinH = child.props.access.getValue().position.minH
                            }
                            if(typeof child.props.access.getValue().position.maxH != 'undefined')
                            {
                                tmpMaxH = child.props.access.getValue().position.maxH
                            }
                            if(typeof child.props.access.getValue().position.minW != 'undefined')
                            {
                                tmpMinW = child.props.access.getValue().position.minW
                            }
                            if(typeof child.props.access.getValue().position.maxW != 'undefined')
                            {
                                tmpMaxW = child.props.access.getValue().position.maxW
                            }
                            if(typeof child.props.access.getValue().position.static != 'undefined')
                            {
                                tmpStatic = child.props.access.getValue().position.static
                            }
                            if(typeof child.props.access.getValue().position.isDragable != 'undefined')
                            {
                                tmpDragable = child.props.access.getValue().position.isDragable
                            }
                            if(typeof child.props.access.getValue().position.isResizable != 'undefined')
                            {
                                tmpResizable = child.props.access.getValue().position.isResizable
                            }
                            if(typeof child.props.access.getValue().position.isBounded != 'undefined')
                            {
                                tmpBounded = child.props.access.getValue().position.isBounded
                            }
                        }
                        
                        return React.cloneElement(child, 
                        {
                            ['data-grid']: { x : tmpX, y : tmpY, w : tmpW, h : tmpH, minW : tmpMinW, maxW : tmpMaxW, minH : tmpMinH, maxH : tmpMaxH, static : tmpStatic, isDraggable : tmpDragable, isResizable : tmpResizable, isBounded : tmpBounded },
                        });
                    })}
                </GridLayout>
            </div>
        )
    }
}
class NdLayoutItemBase extends Base
{
    constructor(props)
    {
        super(props)
        this.state.accessValue = {}
    }
    render() 
    {
        let tmpVisible = false
        if(this.state.editMode)
        {
            tmpVisible = true
        }
        else
        {
            
            if(typeof this.props.access != 'undefined' && typeof this.props?.access?.getValue()?.visible != 'undefined')
            {
                if(this.state.accessValue.visible)
                {
                    tmpVisible = true
                }
                else
                {
                    tmpVisible = false
                }
            }
            else
            {
                tmpVisible = true
            }
        }

        return (
            <div style={{visibility : tmpVisible ? 'visible' : 'hidden'}}>
                <div ref={this.props.forwardedref} {...this.props}>
                    {(()=>
                    {
                        if(this.editMode)
                        {
                            return (
                                <React.Fragment>
                                    <div style={{border:'1px solid #0d6efd',padding:'2px',display:'flex',alignItems: 'center',width:'100%',height:'100%'}}>
                                        <div className={"react-grid-dragHandleExample"} style={{height:'-webkit-fill-available',width:'20px',background:'#0d6efd',position:'absolute',top:'0px',left:'0px',zIndex:900}}>
                                        </div>
                                        <div style={{zIndex:1000,position:'absolute',top:'0px',left:'0px'}}>
                                            <button style={{alignItems:'center',justifyContent:'center',width:'20px',height:'20px',padding:'0px',border:'none',outline:'none',boxShadow:'none',background:'#0d6efd',color:'white'}}
                                            onClick={()=>
                                            {
                                                if(typeof this.state.accessValue != 'undefined' && typeof this.state.accessValue.visible != 'undefined')
                                                {
                                                    this.state.accessValue.visible = this.state.accessValue.visible ? false : true
                                                    let tmpElm = document.getElementById(this.props.id + 'ico');
                                                    if (tmpElm) 
                                                    {
                                                        if(tmpElm.classList.contains('fa-eye'))
                                                        {
                                                            tmpElm.classList.add('fa-eye-slash')
                                                            tmpElm.classList.remove('fa-eye')
                                                        }
                                                        else if(tmpElm.classList.contains('fa-eye-slash'))
                                                        {
                                                            tmpElm.classList.add('fa-eye')
                                                            tmpElm.classList.remove('fa-eye-slash')
                                                        }
                                                    }
                                                }
                                            }}>
                                                <i id={this.props.id + "ico"} className={typeof this.state.accessValue != 'undefined' && typeof this.state.accessValue.visible != 'undefined' && this.state.accessValue.visible ? "fa-solid fa-eye" : "fa-solid fa-eye-slash"} style={{fontSize:'10px'}}></i>
                                            </button>
                                        </div>
                                        <div style={{flex:12,pointerEvents:'none'}}>
                                            {this.props.children.filter(item => item.key != 'resizableHandle-se')}
                                        </div>
                                    </div>
                                    {this.props.children.filter(item => item.key == 'resizableHandle-se')}
                                </React.Fragment>
                            )
                        }
                        else
                        {
                            return (
                                <React.Fragment>
                                    {this.props.children.filter(item => item.key != 'resizableHandle-se')}
                                </React.Fragment>
                            )
                        }
                    })()}
                </div>
            </div>
        );
    }
}
export const NdLayoutItem = React.forwardRef((props, ref) => <NdLayoutItemBase {...props} forwardedref={ref} />);
