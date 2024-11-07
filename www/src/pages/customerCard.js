import React from 'react';
import App from '../lib/app.js';
import Form, { Label, Item, EmptyItem } from 'devextreme-react/form';
import NdTextBox, { Validator, NumericRule, RequiredRule, CompareRule, EmailRule, PatternRule, StringLengthRule, RangeRule, AsyncRule } from '../core/react/devex/textbox.js';
import NdSelectBox from '../core/react/devex/selectbox.js';
import NdNumberBox from '../core/react/devex/numberbox.js';
import NdButton from '../core/react/devex/button.js';
import NdCheckBox from '../core/react/devex/checkbox.js';
import ScrollView from 'devextreme-react/scroll-view';
import { datatable } from '../core/core.js';
import moment from 'moment';
import NdDialog, { dialog } from '../core/react/devex/dialog.js';

export default class customerCard extends React.Component
{
    constructor(props)
    {
        super(props)
        this.core = App.instance.core;
        this.tabIndex = props.data.tabkey

        this.dataObj = new datatable();
        this.dataObj.selectCmd = 
        {
            query: 'SELECT * FROM CUSTOMERS WHERE TAX_NO = @TAX_NO',
            param: ['TAX_NO:string|25']
        }
        this.dataObj.insertCmd = 
        {
            query: `INSERT INTO CUSTOMERS (CUSER, CDATE, LUSER, LDATE, TAX_NO, TITLE, NAME, LAST_NAME, EMAIL, PHONE1, WEB, SIRET_ID, SIREN_ID, 
                    TAX_OFFICE, RSC, APE_CODE, STATUS, DELETED) VALUES (@CUSER, @CDATE, @LUSER, @LDATE, @TAX_NO, @TITLE, @NAME, @LAST_NAME, @EMAIL, @PHONE1, 
                    @WEB, @SIRET_ID, @SIREN_ID, @TAX_OFFICE, @RSC, @APE_CODE, @STATUS, 0)`,
            param: ['CUSER:string|25', 'CDATE:datetime', 'LUSER:string|25', 'LDATE:datetime', 'TAX_NO:string|25', 'TITLE:string|100', 'NAME:string|50', 'LAST_NAME:string|50', 'EMAIL:string|100', 
                    'PHONE1:string|20', 'WEB:string|100', 'SIRET_ID:string|100', 'SIREN_ID:string|100', 'TAX_OFFICE:string|100', 
                    'RSC:string|100', 'APE_CODE:string|100', 'STATUS:bit']
        }
        this.dataObj.updateCmd = 
        {
            query: `UPDATE CUSTOMERS SET LUSER = @LUSER, LDATE = @LDATE, TITLE = @TITLE, NAME = @NAME, LAST_NAME = @LAST_NAME, 
                    EMAIL = @EMAIL, PHONE1 = @PHONE1, WEB = @WEB, SIRET_ID = @SIRET_ID, SIREN_ID = @SIREN_ID, TAX_OFFICE = @TAX_OFFICE, 
                    RSC = @RSC, APE_CODE = @APE_CODE, STATUS = @STATUS WHERE TAX_NO = @TAX_NO`,
            param: ['LUSER:string|25', 'LDATE:datetime', 'TAX_NO:string|25', 'TITLE:string|100', 'NAME:string|50', 'LAST_NAME:string|50', 
                    'EMAIL:string|100', 'PHONE1:string|20', 'WEB:string|100', 'SIRET_ID:string|100', 'SIREN_ID:string|100', 'TAX_OFFICE:string|100', 
                    'RSC:string|100', 'APE_CODE:string|100', 'STATUS:bit']
        }
    }
    componentDidMount()
    {
        this.init(this.pagePrm.TAX_NO);
    }
    async init(pTaxNo)
    {
        pTaxNo = typeof pTaxNo == 'undefined' ? '' : pTaxNo
        this.dataObj.selectCmd.value = [pTaxNo];

        if(pTaxNo == '')
        {
            this.dataObj.push(
            {
                GUID: datatable.uuidv4(),
                CUSER: this.core.auth.data.CODE,
                CDATE: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
                LUSER: this.core.auth.data.CODE,
                LDATE: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
                TAX_NO: '',
                TITLE: '',
                NAME: '',
                LAST_NAME: '',
                EMAIL: '',
                PHONE1: '',
                WEB: '',
                SIRET_ID: '',
                SIREN_ID: '',
                TAX_OFFICE: '',
                RSC: '',
                APE_CODE: '',
                STATUS: true
            });
        }
        else
        {   
            await this.dataObj.refresh();
        }
    }
    render()
    {
        return(
            <div>
                <ScrollView>
                    <div className="row pt-2 pe-2">
                        <div className="col d-flex justify-content-end">
                            <NdButton type="default" icon="file" style={{marginRight:5}}
                            onClick={()=>
                            {
                                this.init();
                            }}
                            />
                            <NdButton type="success" icon="save" validationGroup={"frmGrp" + this.tabIndex}
                            onClick={async (e)=>
                            {
                                if(e.validationGroup.validate().status != "valid")
                                {
                                    return
                                }

                                let tmpConfObj =
                                {
                                    id:'msgSave',showTitle:true,title:"Uyarı",showCloseButton:true,width:'500px',height:'200px',
                                    button:[{id:"btn01",caption:"Evet",location:'before'},{id:"btn02",caption:"Hayır",location:'after'}],
                                    content:(<div style={{textAlign:"center",fontSize:"20px"}}>{"Kayıt etmek istediğinize emin misiniz?"}</div>)
                                }
                                
                                let pResult = await dialog(tmpConfObj);

                                if(pResult == "btn01")
                                {
                                    let tmpConfObj1 =
                                    {
                                        id:'msgSaveResult',showTitle:true,title:"Uyarı",showCloseButton:true,width:'500px',height:'200px',
                                        button:[{id:"btn01",caption:"Tamam",location:'after'}]
                                    }
                                    
                                    let tmpResult = await this.dataObj.update();

                                    if(tmpResult == 0)
                                    {
                                        tmpConfObj1.content = (<div style={{textAlign:"center",fontSize:"20px",color:"green"}}>{"Kayıt işlemi başarılı."}</div>)
                                        await dialog(tmpConfObj1);
                                    }
                                    else
                                    {
                                        tmpConfObj1.content = (<div style={{textAlign:"center",fontSize:"20px",color:"red"}}>{"Kayıt işlemi başarısız."}</div>)
                                        await dialog(tmpConfObj1);
                                    }
                                }
                            }}
                            />
                        </div>
                    </div>
                    <div className="row px-2 pt-2">
                        <div className="col-12">
                            <Form colCount={2} id="frmCustomer">
                                <Item>
                                    <Label text="VKN" alignment="right" />
                                    <NdTextBox id="txtTaxNo" parent={this} simple={true} dt={{data:this.dataObj,field:"TAX_NO"}}
                                    onFocusOut={async()=>
                                    {
                                        let tmpDt = new datatable()
                                        tmpDt.selectCmd = 
                                        {
                                            query: `SELECT TAX_NO FROM CUSTOMERS WHERE TAX_NO = '${this.txtTaxNo.value}'`,
                                        }
                                        await tmpDt.refresh()
                                        if(tmpDt.length > 0)
                                        {
                                            this.init(this.txtTaxNo.value)
                                        }
                                    }}>
                                        <Validator validationGroup={"frmGrp"  + this.tabIndex}>
                                            <RequiredRule message={"Boş geçemezsiniz !"} />
                                        </Validator>
                                    </NdTextBox>
                                </Item>
                                <Item>
                                    <Label text="Unvan" alignment="right" />
                                    <NdTextBox id="txtTitle" parent={this} simple={true} dt={{data:this.dataObj,field:"TITLE"}}>
                                        <Validator validationGroup={"frmGrp"  + this.tabIndex}>
                                            <RequiredRule message={"Boş geçemezsiniz !"} />
                                        </Validator>
                                    </NdTextBox>
                                </Item>
                                <Item>
                                    <Label text="Yetkili Adı" alignment="right" />
                                    <NdTextBox id="txtName" parent={this} simple={true} dt={{data:this.dataObj,field:"NAME"}}/>
                                </Item>
                                <Item>
                                    <Label text="Yetkili Soyadı" alignment="right" />
                                    <NdTextBox id="txtLastName" parent={this} simple={true} dt={{data:this.dataObj,field:"LAST_NAME"}}/>
                                </Item>
                                <Item>
                                    <Label text="Email" alignment="right" />
                                    <NdTextBox id="txtEmail" parent={this} simple={true} dt={{data:this.dataObj,field:"EMAIL"}}>
                                        <Validator validationGroup={"frmGrp"  + this.tabIndex}>
                                            <RequiredRule message={"Boş geçemezsiniz !"} />
                                        </Validator>
                                    </NdTextBox>
                                </Item>
                                <Item>
                                    <Label text="Telefon" alignment="right" />
                                    <NdTextBox id="txtPhone" parent={this} simple={true} dt={{data:this.dataObj,field:"PHONE1"}}>
                                        <Validator validationGroup={"frmGrp"  + this.tabIndex}>
                                            <RequiredRule message={"Boş geçemezsiniz !"} />
                                        </Validator>
                                    </NdTextBox>
                                </Item>
                                <Item>
                                    <Label text="Web" alignment="right" />
                                    <NdTextBox id="txtWeb" parent={this} simple={true} dt={{data:this.dataObj,field:"WEB"}}/>
                                </Item>
                                <Item>
                                    <Label text="Siret" alignment="right" />
                                    <NdTextBox id="txtSiret" parent={this} simple={true} dt={{data:this.dataObj,field:"SIRET_ID"}}/>
                                </Item>
                                <Item>
                                    <Label text="Siren" alignment="right" />
                                    <NdTextBox id="txtSiren" parent={this} simple={true} dt={{data:this.dataObj,field:"SIREN_ID"}}/>
                                </Item>
                                <Item>
                                    <Label text="Vergi Dairesi" alignment="right" />
                                    <NdTextBox id="txtTaxOffice" parent={this} simple={true} dt={{data:this.dataObj,field:"TAX_OFFICE"}}/>
                                </Item>
                                <Item>
                                    <Label text="RCS" alignment="right" />
                                    <NdTextBox id="txtRcs" parent={this} simple={true} dt={{data:this.dataObj,field:"RCS"}}/>
                                </Item>
                                <Item>
                                    <Label text="Ape" alignment="right" />
                                    <NdTextBox id="txtApe" parent={this} simple={true} dt={{data:this.dataObj,field:"APE_CODE"}}/>
                                </Item>
                                <Item>
                                    <Label text="Durum" alignment="right" />
                                    <NdCheckBox id="chkStatus" parent={this} dt={{data:this.dataObj,field:"STATUS"}}/>
                                </Item>
                            </Form>
                        </div>
                    </div>
                </ScrollView>
            </div>
        )
    }
} 