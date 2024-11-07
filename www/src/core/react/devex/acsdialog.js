import React from 'react';
import ReactDOM from 'react-dom';
import Form, { Item } from 'devextreme-react/form';
import NdBase from './base.js';
import NbButton from '../bootstrap/button.js';
import NdPopUp from './popup.js';
import NdTextBox from './textbox.js';
import NbNumberboard from '../bootstrap/numberboard.js';
import { dialog } from './dialog.js';

export default class NdAcsDialog extends NdBase
{
    constructor(props)
    {
        super(props);
        this.state.title = this.props.title;
        this.core = this.props.parent.core;
        this.user = this.props.parent.user;
    }
    show(pType)
    {
        let tmpQuery = ""
        this[this.props.id].show();        
        this[this.props.id].setTitle(pType == 0 ? this.lang.t("acsDialog.title1") : this.lang.t("acsDialog.title2"))
        
        return new Promise(async resolve => 
        {
            this._onClick = async (pCode,pPwd) =>
            {
                //IPTAL BUTONUNA BASILDIĞINDA BURASI ÇALIŞIYOR.
                if(typeof pCode != 'undefined' && pCode == 0 && typeof pPwd == 'undefined')
                {
                    this[this.props.id].hide()
                    resolve(false)
                    return
                }            

                let tmpCode = this.user.CODE
                let tmpPass = btoa(this["txt" + this.props.id].value);
                
                if(typeof pCode != 'undefined' && typeof pPwd != 'undefined')
                {
                    if(pCode == '')
                    {
                        let tmpConfObj =
                        {
                            id:'msgAlert',showTitle:true,title:this.lang.t("acsDialog.msgAlert.title"),showCloseButton:true,width:'500px',height:'200px',
                            button:[{id:"btn01",caption:this.lang.t("acsDialog.msgAlert.btn01"),location:'before'}],
                            content:(<div style={{textAlign:"center",fontSize:"20px"}}>{this.lang.t("acsDialog.msgAlert.msg")}</div>)
                        }
                        await dialog(tmpConfObj);
                        this[this.props.id].hide()
                        resolve(false)
                        return
                    }

                    tmpCode = pCode
                    tmpPass = pPwd
                }

                if(pType == 0)
                {
                    tmpQuery = 
                    {
                        query : "SELECT TOP 1 * FROM USERS WHERE PWD = @PWD AND ROLE = 'Administrator' AND STATUS = 1", 
                        param : ['PWD:string|50'],
                        value : [tmpPass],
                        local : 
                        {
                            type : "select",
                            query : "SELECT * FROM USERS WHERE PWD = ? AND ROLE = 'Administrator' AND STATUS = 1",
                            values : [tmpPass]
                        }
                    }
                }
                else
                {
                    tmpQuery = 
                    {
                        query : "SELECT TOP 1 * FROM USERS WHERE CODE = @CODE AND PWD = @PWD AND STATUS = 1", 
                        param : ['CODE:string|25','PWD:string|50'],
                        value : [tmpCode,tmpPass],
                        local : 
                        {
                            type : "select",
                            query : "SELECT * FROM USERS WHERE CODE = ? AND PWD = ? AND STATUS = 1",
                            values : [tmpCode,tmpPass]
                        }
                    }
                }
                
                let tmpData = await this.core.sql.execute(tmpQuery)
                
                if(tmpData.result.recordset.length > 0)
                {
                    this[this.props.id].hide()
                    resolve(true)
                }
                else
                {
                    let tmpConfObj =
                    {
                        id:'msgAlert',showTitle:true,title:this.lang.t("acsDialog.msgAlert.title"),showCloseButton:true,width:'500px',height:'200px',
                        button:[{id:"btn01",caption:this.lang.t("acsDialog.msgAlert.btn01"),location:'before'}],
                        content:(<div style={{textAlign:"center",fontSize:"20px"}}>{this.lang.t("acsDialog.msgAlert.msg")}</div>)
                    }
                    await dialog(tmpConfObj);
                    this[this.props.id].hide()
                    resolve(false)
                }
            }
        });
    }
    render()
    {
        return(
            <div>
                <NdPopUp parent={this} id={this.props.id} 
                visible={false}                        
                showCloseButton={false}
                showTitle={true}
                title={this.state.title}
                container={"#root"} 
                width={"300"}
                height={"550"}
                position={{of:"#root"}}
                >
                    <div className="row pt-1">
                        <div className="col-12">
                            <NdTextBox id={"txt" + this.props.id} parent={this} simple={true} mode={"password"}/>                                  
                        </div>
                    </div> 
                    <div className="row pt-2">
                        {/* Number Board */}
                        <div className="col-12">
                            <NbNumberboard id={"num" + this.props.id} parent={this} textobj={"txt" + this.props.id} span={1} buttonHeight={"60px"}/>
                        </div>
                    </div>
                    <div className="row pt-2">
                        <div className="col-6">
                            <NbButton id={"btn" + this.props.id} parent={this} className="form-group btn btn-danger btn-block" style={{height:"60px",width:"100%"}}
                            onClick={()=>{this._onClick(0)}}>
                                <i className="text-white fa-solid fa-xmark" style={{fontSize: "24px"}} />
                            </NbButton>
                        </div>
                        <div className="col-6">
                            <NbButton id={"btn" + this.props.id} parent={this} className="form-group btn btn-success btn-block" style={{height:"60px",width:"100%"}}
                            onClick={()=>{this._onClick()}}>
                                <i className="text-white fa-solid fa-check" style={{fontSize: "24px"}} />
                            </NbButton>
                        </div>
                    </div>
                    <div className="row pt-2">
                            <div className="col-12">
                                <NbButton id={"btnCard" + this.props.id} parent={this} className="form-group btn btn-primary btn-block" style={{height:"60px",width:"100%"}}
                                onClick={()=>
                                {
                                    this["popCardId" + this.props.id].show()
                                    setTimeout(() => 
                                    {
                                        this["txt" + this.props.id + "cardRead"].focus()    
                                    }, 500);
                                }}>
                                    <i className="text-white fa-solid fa-id-card" style={{fontSize: "24px"}} />
                                </NbButton>
                            </div>
                        </div>
                </NdPopUp>
                {/* popCardId */}
                <NdPopUp parent={this} id={"popCardId" + this.props.id} 
                visible={false}
                showCloseButton={false}
                showTitle={true}
                container={"#root"} 
                width={'500'}
                height={'500'}
                position={{of:'#root'}}
                >
                    <Form colCount={1} height={'fit-content'}>
                    <Item>
                        <img src="./css/img/cardicon3.png" height="300px"/>
                    </Item>
                    <Item>
                    <NdTextBox id={"txt" + this.props.id + "cardRead"} parent={this} simple={true}  mode="password" showClearButton={true} height='fit-content'
                    placeholder={this.lang.t("txtCardRead")}
                    onKeyUp={async(k)=>
                    {
                        if(k.event.key != 'Enter')
                        {
                            setTimeout(() => {
                                this["txt" + this.props.id + "cardRead"].value = ''
                            }, 500);
                        }
                        else
                        {
                            this["btn" + this.props.id + "CardId"].disabled = true
                            let tmpQuery = 
                            {
                                query : "SELECT TOP 1 * FROM USERS WHERE CARDID = @CARDID", 
                                param : ['CARDID:string|50'],
                                value : [this["txt" + this.props.id + "cardRead"].value],
                                local : 
                                {
                                    type : "select",
                                    query : "SELECT * FROM USERS WHERE CARDID = ?;",
                                    values : [this["txt" + this.props.id + "cardRead"].value]
                                }
                            }
                            let tmpData = await this.core.sql.execute(tmpQuery)
                            if(tmpData.result.recordset.length > 0)
                            {
                                this._onClick(tmpData.result.recordset[0].CODE,tmpData.result.recordset[0].PWD)
                            }
                            else
                            {
                                this._onClick('','')
                            }
                            this["popCardId" + this.props.id].hide()
                        }
                    }}
                    />
                    </Item>
                    <Item>
                        <NbButton id={"btn" + this.props.id + "CardId"} parent={this} className="form-group btn btn-primary btn-block" style={{width:"100%"}}
                        onClick={()=>{this["popCardId" + this.props.id].hide()}}
                        >
                            {this.lang.t("btnCancel")}
                        </NbButton>
                    </Item>
                    </Form>
                </NdPopUp>
            </div>
        )
    }
}
export const acsDialog = function()
{            
    return new Promise(async resolve => 
    {
        if(arguments.length == 0)
        {
            resolve();
        }

        let tmpObj = React.createRef();
        let tmpJsx = 
        (
            <NdAcsDialog ref={tmpObj} id={arguments[0].id} parent={arguments[0].parent} />
        )
        
        ReactDOM.render(tmpJsx,document.body.appendChild(document.createElement('div',{id:'acsdialog'})));
        resolve(await tmpObj.current.show(arguments[0].type))
    });
}