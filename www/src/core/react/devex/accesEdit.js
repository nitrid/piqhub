import React from "react";
import Base from './base.js';
import NdPopGrid from './popgrid';
import NdGrid,{Column,Editing,Popup,Paging,Scrolling,KeyboardNavigation,Lookup} from './grid';
import NdDialog, { dialog } from './dialog.js';

export default class NdAccessEdit extends Base
{
    constructor(props)
    {
        super(props)
        this.core = this.props.parent.core
    }
    parentObj(pCallback)
    {
        if(typeof pCallback != 'undefined')
        {
            if(typeof this.props.parent != 'undefined')
            {
                let tmpObjArr = Object.keys(this.props.parent)
                for (let i = 0; i < tmpObjArr.length; i++) 
                {
                    if(this.props.parent[tmpObjArr[i]] != null && typeof this.props.parent[tmpObjArr[i]].editMode != 'undefined' )
                    {
                        pCallback(this.props.parent[tmpObjArr[i]])
                    }
                }
            }
        }
    }
    openEdit()
    {
        this.parentObj((item)=>
        {
            item.editMode = true
        })
    }
    async closeEdit()
    {
        if(typeof this.props.parent != 'undefined')
        {
            this.parentObj((item)=>
            {
                item.editMode = false
            })
            
            let tmpConfObj =
            {
                id:'msgCloseAlert',showTitle:true,title:this.lang.t("acsEdit.msgCloseAlert.title"),showCloseButton:true,width:'500px',height:'200px',
                button:[{id:"btn01",caption:this.lang.t("acsEdit.msgCloseAlert.btn01"),location:'before'},{id:"btn02",caption:this.lang.t("acsEdit.msgCloseAlert.btn02"),location:'after'}],
                content:(<div style={{textAlign:"center",fontSize:"20px"}}>{this.lang.t("acsEdit.msgCloseAlert.msg")}</div>)
            }
            
            let tmpDialogResult = await dialog(tmpConfObj);
            
            if(tmpDialogResult == "btn01")
            {
                if((typeof this.props.saveUser == 'undefined' || this.props.saveUser == false) && this.core.auth.data.ROLE == 'Administrator')
                {
                    this.popAcsUserList.show()
                    this.popAcsUserList.onClick = (data) =>
                    {
                        for(let i = 0;i < data.length;i++)
                        {
                            this.parentObj(async(item)=>
                            {
                                if(typeof item.props.access != 'undefined' && typeof item.state.accessValue != 'undefined')
                                {
                                    let tmpData = {...item.props.access.meta[0]}
                                    tmpData.USERS = data[i].CODE
                                    tmpData.VALUE = JSON.stringify(item.state.accessValue)

                                    let tmpQuery = {}
                                    let tmpCtrlQuery = 
                                    {
                                        query : "SELECT TOP 1 GUID FROM ACCESS WHERE ID = @ID AND USERS = @USERS AND PAGE = @PAGE AND APP = @APP",
                                        param : ['ID:string|100','USERS:string|25','PAGE:string|25','APP:string|50'],
                                        value : [tmpData.ID,tmpData.USERS,tmpData.PAGE,tmpData.APP]
                                    }
                                    let tmpCtrlResult = await this.core.sql.execute(tmpCtrlQuery)
                                    if(tmpCtrlResult.result.recordset.length == 0)
                                    {
                                        tmpQuery = 
                                        {
                                            query : "EXEC [dbo].[PRD_ACCESS_INSERT] " + 
                                                    "@ID = @PID, " + 
                                                    "@VALUE = @PVALUE, " + 
                                                    "@SPECIAL = @PSPECIAL, " + 
                                                    "@USERS = @PUSERS, " + 
                                                    "@PAGE = @PPAGE, " + 
                                                    "@ELEMENT = @PELEMENT, " + 
                                                    "@APP = @PAPP ", 
                                            param : ['PID:string|100','PVALUE:string|max','PSPECIAL:string|150','PUSERS:string|25','PPAGE:string|25','PELEMENT:string|250','PAPP:string|50'],
                                            value : [tmpData.ID,tmpData.VALUE,tmpData.SPECIAL,tmpData.USERS,tmpData.PAGE,tmpData.ELEMENT,tmpData.APP]
                                        }
                                    }
                                    else
                                    {
                                        tmpQuery = 
                                        {
                                            query : "EXEC [dbo].[PRD_ACCESS_UPDATE] " + 
                                                    "@GUID = @PGUID, " + 
                                                    "@ID = @PID, " + 
                                                    "@VALUE = @PVALUE, " + 
                                                    "@SPECIAL = @PSPECIAL, " + 
                                                    "@USERS = @PUSERS, " + 
                                                    "@PAGE = @PPAGE, " + 
                                                    "@ELEMENT = @PELEMENT, " + 
                                                    "@APP = @PAPP ", 
                                            param : ['PGUID:string|50','PID:string|100','PVALUE:string|max','PSPECIAL:string|150','PUSERS:string|25','PPAGE:string|25','PELEMENT:string|250','PAPP:string|50'],
                                            value : [tmpCtrlResult.result.recordset[0].GUID,tmpData.ID,tmpData.VALUE,tmpData.SPECIAL,tmpData.USERS,tmpData.PAGE,tmpData.ELEMENT,tmpData.APP]
                                        }
                                    }
                                    await this.core.sql.execute(tmpQuery)
                                }
                            })
                        }
                    }
                }
                else
                {
                    this.parentObj(async(item)=>
                    {
                        if(typeof item.state.accessValue != 'undefined' && typeof item.props.access != 'undefined')
                        {
                            for (let x = 0; x < item.props.access.meta.length; x++) 
                            {
                                item.props.access.add
                                (
                                    {
                                        TYPE:item.props.access.meta[x].TYPE,
                                        ID:item.props.access.meta[x].ID,
                                        VALUE:item.state.accessValue,
                                        SPECIAL:item.props.access.meta[x].SPECIAL,
                                        USERS:this.core.auth.data.CODE,
                                        PAGE:item.props.access.meta[x].PAGE,
                                        ELEMENT:item.props.access.meta[x].ELEMENT,
                                        APP:item.props.access.meta[x].APP,
                                    }
                                )
                            }
                            await item.props.access.save()
                        }
                    })
                }
            }
        }
    }
    render()
    {
        return(
        <div>
            {/* Kullanıcı Listesi */}
            <div>
                <NdPopGrid id={"popAcsUserList"} parent={this} container={"#root"}
                visible={false}
                position={{of:'#root'}}
                showTitle={true}
                showBorders={true}
                width={'90%'}
                height={'90%'}
                title={this.lang.t("popUserList.title")}
                data =
                {{
                    source:
                    {
                        select:
                        {
                            query : "SELECT CODE,NAME FROM USERS ORDER BY CODE ASC"
                        },
                        sql:this.core.sql
                    }
                }}
                >
                    <Column dataField="CODE" caption={this.lang.t("popUserList.clmCode")} width={300} />
                    <Column dataField="NAME" caption={this.lang.t("popUserList.clmName")} width={300} defaultSortOrder="asc" />
                </NdPopGrid>
            </div>
        </div>)
    }
}