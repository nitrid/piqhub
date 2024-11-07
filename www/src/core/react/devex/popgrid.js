import React from 'react';
import NdPopUp from './popup.js';
import NdGrid,{Column,ColumnChooser,ColumnFixing,Pager,Paging,Scrolling,Selection,Editing,FilterRow,SearchPanel,HeaderFilter,Popup,Toolbar,Item} from './grid.js';
import NdButton from './button.js';
import NdTextBox, { Validator, NumericRule, RequiredRule, CompareRule, EmailRule, PatternRule, StringLengthRule, RangeRule, AsyncRule } from './textbox.js'
import Base from './base.js';
import { access,param } from '../../core.js';

export default class NdPopGrid extends Base
{
    constructor(props)
    {
        super(props);
        
        this.listeners = Object(); 

        this.state.show = typeof props.visible == 'undefined' ? false : props.visible
        this.state.closeOnOutsideClick = typeof props.closeOnOutsideClick == 'undefined' ? false : props.closeOnOutsideClick
        this.state.showCloseButton = typeof props.showCloseButton == 'undefined' ? true : props.showCloseButton
        this.state.showTitle = typeof props.showTitle == 'undefined' ? false : props.showTitle
        this.state.title = typeof props.title == 'undefined' ? '' : props.title
        this.state.container = typeof props.container == 'undefined' ? undefined : props.container
        this.state.width = typeof props.width == 'undefined' ? 'auto' : props.width
        this.state.height = typeof props.height == 'undefined' ? 'auto' : props.height
        this.state.position = typeof props.position == 'undefined' ? undefined : props.position
        
        
        this.state.columns = typeof props.columns == 'undefined' ? undefined : props.columns
        this.state.filterRow = typeof props.filterRow == 'undefined' ? {visible:true} : props.filterRow
        this.state.headerFilter = typeof props.headerFilter == 'undefined' ? {visible:true} : props.headerFilter
        this.state.selection = typeof props.selection == 'undefined' ? {mode:"multiple"} : props.selection
        this.state.paging = typeof props.paging == 'undefined' ? {} : props.paging
        this.state.pager = typeof props.pager == 'undefined' ? {} : props.pager
        this.state.editing = typeof props.editing == 'undefined' ? {} : props.editing

        this._onHiding = this._onHiding.bind(this);
        this._onSelectionChanged = this._onSelectionChanged.bind(this);
        this._onClick = this._onClick.bind(this);
        this._onRowDblClick = this._onRowDblClick.bind(this);
        this._onRowPrepared = this._onRowPrepared.bind(this);
        this._onRowRemoving = this._onRowRemoving.bind(this);
        this._onRowRemoved = this._onRowRemoved.bind(this);
        this._onRowUpdated = this._onRowUpdated.bind(this);
        this._onRowUpdating = this._onRowUpdating.bind(this);
        this._onEditorPrepared = this._onEditorPrepared.bind(this);
        this._onEditorPreparing = this._onEditorPreparing.bind(this);
        this._onCellPrepared = this._onCellPrepared.bind(this);
        this._onCellPreparing = this._onCellPreparing.bind(this);
        this.setSource = this.setSource.bind(this);
        this.setData = this.setData.bind(this);
        this.setVal = this.setVal.bind(this);

        this.access = {}
        this.param = {}
        //POPGRID İÇİN YETKİ DEĞERLERİ HAZIRLANIYOR.
        if(typeof this.props.access != 'undefined')
        {
            if(typeof this.props.access.getValue().btn != 'undefined')
            {
                let tmp = new access()
                tmp.add({VALUE:this.props.access.getValue().btn})
                this.access.btn = tmp
            }
            if(typeof this.props.access.getValue().grid != 'undefined')
            {
                let tmp = new access()
                tmp.add({VALUE:this.props.access.getValue().grid})
                this.access.grid = tmp
            }
        }
        //*************************************** */
        //POPGRID İÇİN PARAMETRE DEĞERLERİ HAZIRLANIYOR.
        if(typeof this.props.param != 'undefined')
        {
            if(typeof this.props.param.getValue().btn != 'undefined')
            {
                let tmp = new param()
                tmp.add({VALUE:this.props.param.getValue().btn})
                this.param.btn = tmp
            }
            if(typeof this.props.param.getValue().grid != 'undefined')
            {
                let tmp = new param()
                tmp.add({VALUE:this.props.param.getValue().grid})
                this.param.grid = tmp
            }
        }
        //******************************************* */
    }
    //#region Private
    _isGrid()
    {
        return new Promise(async resolve => 
        {
            if(typeof this["grid_" + this.props.id] == 'undefined')
            {
                setTimeout(() => 
                {
                    resolve(this["grid_" + this.props.id])    
                }, 100);
            }
            else
            {
                resolve(this["grid_" + this.props.id]) 
            }
        });
    }
    _buttonView()
    {
        if(typeof this.props.button != 'undefined')
        {
            let tmp = []
            for (let i = 0; i < this.props.button.length; i++) 
            {
                tmp.push (
                    <Item key={i} location="after" locateInMenu="auto">
                        <NdButton  id={"btn_" + this.props.button[i].id} location="after" 
                        type="normal"
                        icon={this.props.button[i].icon}
                        stylingMode={"contained"}
                        onClick={this.props.button[i].onClick}
                        >
                        </NdButton>
                    </Item>
                )
            }   
            return (
            <div className="row">
                <div className="col-12 py-1">
                    <Toolbar>
                        {tmp}
                    </Toolbar>
                </div>
            </div> 
            )
        }
    }
    _formView()
    {
        if(typeof this.props.search == 'undefined' || this.props.search == false)
        {
            return (
                <div className="row p-2">
                    <div className="col-12 py-2">
                        <NdButton parent={this} id={"btn2_" + this.props.id} text={this.lang.t('popGrid.btnSelection')} width={'100%'} type={"default"}
                            onClick={this._onClick}
                            param={this.param.btn} 
                            access={this.access.btn} 
                        />
                    </div>
                </div>
            )
        }
        else
        {
            return (
                <div className="row p-2">
                    <div className='col-12'>
                        <div className="row pb-1">
                            <div className="col-12">
                                <NdTextBox id={"txt" + this.props.id} parent={this} simple={true} 
                                onChange={(async()=>{this.getData()}).bind(this)}
                                />     
                            </div>                            
                        </div>           
                        <div className="row">
                            <div className="col-6 py-2">
                                <NdButton parent={this} id={"btn1_" + this.props.id} text={this.lang.t('popGrid.btnSearch')} width={'100%'} type={"default"}
                                    onClick={()=> {this.getData()}}
                                    param={this.param.btn} 
                                    access={this.access.btn} 
                                />
                            </div>
                            <div className="col-6 py-2">
                                <NdButton parent={this} id={"btn2_" + this.props.id} text={this.lang.t('popGrid.btnSelection')} width={'100%'} type={"default"}
                                    onClick={this._onClick}
                                    param={this.param.btn} 
                                    access={this.access.btn} 
                                />
                            </div>
                        </div>
                    </div>
                </div>   
            )
        }
    }
    _onSelectionChanged(e) 
    {
        if(typeof this.props.onSelectionChanged != 'undefined')
        {
            this.props.onSelectionChanged(e);
        }
    }
    _onHiding() 
    {
        if(typeof this.props.onHiding != 'undefined')
        {
            this.props.onHiding();
        }
        if(typeof this.onHiding != 'undefined')
        {
            this.onHiding()
        }
        
        this.hide();
    }
    _onClick()
    {
        if(this.grid.getSelectedData().length > 0)
        {
            this.hide()
            this.onClick(this.grid.getSelectedData())
        }
    }
    _onRowDblClick(e)
    {
        this._onClick();
        
        if(typeof this.props.onRowDblClick != 'undefined')
        {
            this.props.onRowDblClick(e);
        }
    }
    _onRowPrepared(e)
    {
        if(typeof this.props.onRowPrepared != 'undefined')
        {
            this.props.onRowPrepared(e);
        }
    }
    _onRowRemoving(e)
    {
        if(typeof this.props.onRowRemoving != 'undefined')
        {
            this.props.onRowRemoving(e);
        }
    }
    _onRowRemoved(e)
    {
        if(typeof this.props.onRowRemoved != 'undefined')
        {
            this.props.onRowRemoved(e);
        }
    }
    _onRowUpdated(e)
    {
        if(typeof this.props.onRowUpdated != 'undefined')
        {
            this.props.onRowUpdated(e);
        }
    }
    _onRowUpdating(e)
    {
        if(typeof this.props.onRowUpdating != 'undefined')
        {
            this.props.onRowUpdating(e);
        }
    }
    _onEditorPrepared(e)
    {
        if(typeof this.props.onEditorPrepared != 'undefined')
        {
            this.props.onEditorPrepared(e);
        }
    }
    _onEditorPreparing(e)
    {
        if(typeof this.props.onEditorPreparing != 'undefined')
        {
            this.props.onEditorPreparing(e);
        }
    }
    _onCellPrepared(e)
    {
        if(typeof this.props.onCellPrepared != 'undefined')
        {
            this.props.onCellPrepared(e);
        }
    }
    _onCellPreparing(e)
    {
        if(typeof this.props.onCellPreparing != 'undefined')
        {
            this.props.onCellPreparing(e);
        }
    }
    on(pEvt, pCallback) 
    {
        if (!this.listeners.hasOwnProperty(pEvt))
        this.listeners[pEvt] = Array();

        this.listeners[pEvt].push(pCallback); 
    }
    emit(pEvt, pParams)
    {
        if (pEvt in this.listeners) 
        {
            let callbacks = this.listeners[pEvt];
            for (var x in callbacks)
            {
                callbacks[x](pParams);
            }
        } 
    }
    //#endregion
    async componentDidMount()
    {
        this.popup = this["pop_" + this.props.id];
        this.grid = await this._isGrid();
    }
    componentWillReceiveProps(pProps) 
    {
        // this.setState(
        //     {
        //         show : pProps.visible,
        //     }
        // )       
    } 
    setTitle(pVal)
    {
        this.popup.setTitle(pVal)
    }    
    async show()
    {
        return new Promise(async resolve => 
        {
            this.emit('showing')
            await this["pop_" + this.props.id].show();
            this.emit('showed')
            resolve();
        })
    }
    hide()
    {
        this["pop_" + this.props.id].hide();
    }
    async setVal(pValue)
    {
        if(typeof pValue != 'undefined')
        {
            await this.show();
            //await this["pop_" + this.props.id].show();
            await this["txt" + this.props.id].setState({value:pValue})
            await this.getData()
        }
    }
    async setSource(pSource)
    {
        this.SourceData = pSource  
    } 
    async getData()
    {
        let tmpQuery
        if(typeof this.data == 'undefined' )
        {
            tmpQuery = this.SourceData
        }
        else
        {
            tmpQuery =  {...this.data}
        }
        
        tmpQuery.source.select.value = []
        if(tmpQuery.source.select.param[0] == "VAL:string|50")
        {
            tmpQuery.source.select.value.push(this["txt" + this.props.id].value.replaceAll('*','%')+'%')
        }
        else
        {
            tmpQuery.source.select.value.push(this["txt" + this.props.id].value.replaceAll('*','%'))
        }
        await this.grid.dataRefresh(tmpQuery)
    }
    async setData(pData)
    {
        await this.grid.dataRefresh({source:pData})
    }
    render()
    {
        return (
            <React.Fragment>
                <NdPopUp parent={this} id={"pop_" + this.props.id} 
                    //visible={this.state.show}
                    onHiding={this._onHiding}                   
                    closeOnOutsideClick={this.state.closeOnOutsideClick}
                    showCloseButton={this.state.showCloseButton}
                    showTitle={this.state.showTitle}
                    title={this.state.title}
                    container={this.state.container}
                    width={this.state.width}
                    height={this.state.height}
                    position={this.state.position}
                    deferRendering={typeof this.props.deferRendering == 'undefined' ? false : this.props.deferRendering}
                    onShowed={async()=>
                    {
                        this.grid = await this._isGrid();
                        this.grid.devGrid.clearSelection()

                        if(typeof this.props.search == 'undefined' || this.props.search == false)
                        {
                            await this.grid.dataRefresh(this.state.data)
                        }
                        else
                        {                    
                            if(this["txt" + this.props.id].value == '')
                            {
                                this.grid.devGrid.clearFilter()
                                await this.grid.dataRefresh({source:[]})
                                this["txt" + this.props.id].setState({value:''})
                            }
                        
                            setTimeout(() => 
                            {
                                this["txt" + this.props.id].focus()
                            }, 700);
                        }
                    }}
                >
                    {this._buttonView()}
                    {this._formView()}      
                    <div className="row p-2" style={{height:"85%"}}>
                        <div className="col-12">
                            <NdGrid parent={this} id={"grid_" + this.props.id} 
                            dataSource={typeof this.state.data == 'undefined' ? undefined : this.state.data.store} 
                            columnWidth={this.props.columnWidth}
                            showBorders={this.props.showBorders} 
                            columnsAutoWidth={this.props.columnsAutoWidth} 
                            allowColumnReordering={this.props.allowColumnReordering} 
                            allowColumnResizing={this.props.allowColumnResizing} 
                            height={'100%'} 
                            width={'100%'}
                            onSelectionChanged={this._onSelectionChanged} 
                            onRowDblClick={this._onRowDblClick}
                            onRowPrepared={this._onRowPrepared}
                            onRowRemoving={this._onRowRemoving}
                            onRowRemoved={this._onRowRemoved}
                            onRowUpdated={this._onRowUpdated}
                            onRowUpdating={this._onRowUpdating}
                            onEditorPrepared={this._onEditorPrepared}
                            onEditorPreparing={this._onEditorPreparing}
                            onCellPrepared={this._onCellPrepared}
                            onCellPreparing={this._onCellPreparing}
                            columns={this.state.columns}
                            filterRow={this.state.filterRow}
                            headerFilter={this.state.headerFilter}
                            selection={this.state.selection}
                            paging={this.state.paging}
                            pager={this.state.pager}
                            editing={this.state.editing}  
                            param={this.param.grid} 
                            access={this.access.grid}
                            notRefresh={this.props.notRefresh}
                            loadPanel={{enabled:true}}
                            dbApply={typeof this.props.dbApply == 'undefined' ? false : this.props.dbApply}
                            >                            
                            {this.props.children}
                            </NdGrid>
                        </div>
                    </div>
                </NdPopUp>
            </React.Fragment>
        )
    }
}