import React from 'react';
import App from '../lib/app.js';
import Form, { Label, Item, GroupItem, EmptyItem } from 'devextreme-react/form';
import NdTextBox, { Validator, NumericRule, RequiredRule, CompareRule, EmailRule, PatternRule, StringLengthRule, RangeRule, AsyncRule } from '../core/react/devex/textbox.js';
import NdSelectBox from '../core/react/devex/selectbox.js';
import NdNumberBox from '../core/react/devex/numberbox.js';
import NdButton from '../core/react/devex/button.js';
import NdCheckBox from '../core/react/devex/checkbox.js';
import ScrollView from 'devextreme-react/scroll-view';
import { datatable } from '../core/core.js';
import moment from 'moment';
import NdDialog, { dialog } from '../core/react/devex/dialog.js';
import NdDatePicker from '../core/react/devex/datepicker.js';
import NdPopGrid from '../core/react/devex/popgrid.js';
import { Column } from 'devextreme-react/data-grid';
import NdTreeView from '../tools/NdTreeView.js';

export default class licenceCard extends React.Component
{
    constructor(props)
    {
        super(props)

        this.state = {menuOff: []}

        this.core = App.instance.core;
        this.tabIndex = props.data.tabkey
        this.licObj = {}

        this.dataObj = new datatable();
        this.dataObj.selectCmd = 
        {
            query: "SELECT *,ISNULL((SELECT TITLE FROM CUSTOMERS WHERE GUID = CUSTOMER),'') AS CUSTOMER_TITLE FROM LICENCE WHERE MACID = @MACID",
            param: ['MACID:string|50']
        }
        this.dataObj.insertCmd = 
        {
            query: `INSERT INTO LICENCE (CUSER, CDATE, LUSER, LDATE, CUSTOMER, MACID, LICENCE, SETUP_DATE, START_DATE, FINISH_DATE, RENT, CLOUD, STATUS, DELETED) 
                    VALUES (@CUSER, @CDATE, @LUSER, @LDATE, @CUSTOMER, @MACID, @LICENCE, @SETUP_DATE, @START_DATE, @FINISH_DATE, @RENT, @CLOUD, @STATUS, 0)`,
            param: ['CUSER:string|25', 'CDATE:datetime', 'LUSER:string|25', 'LDATE:datetime', 'CUSTOMER:string|50', 'MACID:string|50', 'LICENCE:string|max', 
                    'SETUP_DATE:date', 'START_DATE:date','FINISH_DATE:date', 'RENT:bit', 'CLOUD:bit', 'STATUS:bit']
        }
        this.dataObj.updateCmd = 
        {
            query: `UPDATE LICENCE SET LUSER = @LUSER, LDATE = @LDATE, CUSTOMER = @CUSTOMER, LICENCE = @LICENCE, SETUP_DATE = @SETUP_DATE, 
                    START_DATE = @START_DATE, FINISH_DATE = @FINISH_DATE, RENT = @RENT, CLOUD = @CLOUD, STATUS = @STATUS WHERE MACID = @MACID`,
            param: ['LUSER:string|25', 'LDATE:datetime', 'CUSTOMER:string|50', 'LICENCE:string|max', 'SETUP_DATE:date', 'START_DATE:date', 
                    'FINISH_DATE:date', 'RENT:bit', 'CLOUD:bit', 'STATUS:bit','MACID:string|50']
        }
    }
    async componentDidMount()
    {
        await this.core.util.waitUntil(0)
        
        try 
        {
            let response = await fetch('/api/menuOff');
            if(response.ok)
            {
                let menuData = await response.json();
                this.setState({menuOff: menuData}, () => 
                {
                    this.init(this.pagePrm.MACID);
                });
            }
            else
            {
                throw new Error('Menü verisi alınamadı');
            }
        } 
        catch (error) 
        {
            console.error('MenuOff yüklenirken hata:', error);
            this.init(this.pagePrm.MACID);
        }
    }
    async init(pMacId)
    {
        pMacId = typeof pMacId == 'undefined' ? '' : pMacId
        this.dataObj.selectCmd.value = [pMacId];
        this.licObj = {}

        if(pMacId == '')
        {
            this.dataObj.push(
            {
                GUID: datatable.uuidv4(),
                CUSER: this.core.auth.data.CODE,
                CDATE: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
                LUSER: this.core.auth.data.CODE,
                LDATE: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
                CUSTOMER: '',
                CUSTOMER_TITLE: '',
                MACID: '',
                LICENCE: '',
                SETUP_DATE: moment(new Date()).format("YYYY-MM-DD"),
                START_DATE: moment(new Date()).format("YYYY-MM-DD"),
                FINISH_DATE: moment(new Date()).format("YYYY-MM-DD"),
                RENT: false,
                CLOUD: false,
                STATUS: true
            });

            this.txtOffUserCount.value = 0
            this.txtPosUserCount.value = 0
            this.txtMobUserCount.value = 0
            this.txtTabUserCount.value = 0
            this.txtRestUserCount.value = 0
            this.txtBossUserCount.value = 0 
        }
        else
        {   
            await this.dataObj.refresh();

            if(this.dataObj.length > 0)
            {
                this.licObj = JSON.parse(this.dataObj[0].LICENCE)
                if(typeof this.licObj?.OFF?.MENU != 'undefined')
                {
                    this.txtOffUserCount.value = this.licObj.OFF.USER_COUNT
                    await this.mergeMenu(this.state.menuOff,this.licObj.OFF.MENU);
                    this.setState({menuOff: [...this.state.menuOff]});
                }
                if(typeof this.licObj?.POS?.USER_COUNT != 'undefined')
                {
                    this.txtPosUserCount.value = this.licObj.POS.USER_COUNT
                }
                if(typeof this.licObj?.MOB?.USER_COUNT != 'undefined')
                {
                    this.txtMobUserCount.value = this.licObj.MOB.USER_COUNT
                }
                if(typeof this.licObj?.TAB?.USER_COUNT != 'undefined')
                {
                    this.txtTabUserCount.value = this.licObj.TAB.USER_COUNT
                }
                if(typeof this.licObj?.REST?.USER_COUNT != 'undefined')
                {
                    this.txtRestUserCount.value = this.licObj.REST.USER_COUNT
                }
                if(typeof this.licObj?.BOSS?.USER_COUNT != 'undefined')
                {
                    this.txtBossUserCount.value = this.licObj.BOSS.USER_COUNT
                }
            }
        }
    }
    async mergeMenu(tmpMenu,tmpMenuData)
    {
        const processMenu = async (menu) => 
        {
            const promises = menu.map(async (element, index, object) => 
            {
                if(typeof element.items != 'undefined')
                {
                    await processMenu(element.items);
                }
                else
                {
                    let tmpMerge = await tmpMenuData.findSub({id:element.id},'items');
                    if(typeof tmpMerge != 'undefined' && typeof tmpMerge.selected != 'undefined')
                    {
                        object[index].selected = tmpMerge.selected;
                    }
                }
            });

            await Promise.all(promises);
        };

        await processMenu(tmpMenu);
    }
    buildMenuStructure(nodes)
    {
        let result = [];
        let menuMap = new Map();

        // Önce tüm node'ları ID'lerine göre map'e ekle
        nodes.forEach(node => 
        {
            let path = [];
            let current = node;
            
            // Node'un path'ini oluştur (root'dan leaf'e)
            while(current) 
            {
                path.unshift(current);
                current = current.parent;
            }

            // Path'deki her node için menü yapısını oluştur
            let currentMenu = null;
            path.forEach((pathNode, index) => 
            {
                const nodeId = pathNode.itemData.id;
                
                if (!menuMap.has(nodeId)) 
                {
                    const menuItem = 
                    {
                        id: nodeId,
                        text: pathNode.itemData.text
                    };

                    if (pathNode.selected) 
                    {
                        menuItem.selected = true;
                    }

                    menuMap.set(nodeId, menuItem);

                    if (index === 0) 
                    {
                        // Root seviyesi
                        if (!result.find(item => item.id === nodeId)) 
                        {
                            result.push(menuItem);
                        }
                    } 
                    else
                    {
                        // Alt seviyeler
                        const parentNode = path[index - 1];
                        const parentMenu = menuMap.get(parentNode.itemData.id);
                        if (!parentMenu.items) 
                        {
                            parentMenu.items = [];
                        }
                        if (!parentMenu.items.find(item => item.id === nodeId)) 
                        {
                            parentMenu.items.push(menuItem);
                        }
                    }
                }
                currentMenu = menuMap.get(nodeId);
            });
        });

        return result;
    }
    render()
    {
        return(
            <div>
                <ScrollView>
                    <div className="row pt-2 pe-2">
                        <div className="col d-flex justify-content-end">
                            <NdButton type="default" icon="file" style={{marginRight:5}}
                            onClick={async()=>
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
                                    
                                    
                                    this.licObj.OFF = 
                                    {
                                        USER_COUNT:this.txtOffUserCount.value,
                                        MENU:this.buildMenuStructure(this.tvMenuOff.dev.getSelectedNodes())
                                    }
                                    this.licObj.POS = 
                                    {
                                        USER_COUNT:this.txtPosUserCount.value
                                    }   
                                    this.licObj.MOB = 
                                    {
                                        USER_COUNT:this.txtMobUserCount.value
                                    }   
                                    this.licObj.TAB = 
                                    {
                                        USER_COUNT:this.txtTabUserCount.value
                                    }   
                                    this.licObj.REST = 
                                    {
                                        USER_COUNT:this.txtRestUserCount.value
                                    }   
                                    this.licObj.BOSS = 
                                    {
                                        USER_COUNT:this.txtBossUserCount.value
                                    }
                                    
                                    this.dataObj[0].LICENCE = JSON.stringify(this.licObj)
                                    
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
                            <Form colCount={1} id="frmCustomer">
                                <GroupItem colCount={2} caption={"Genel Bilgiler"}>
                                    <Item>
                                        <Label text="Mac Id" alignment="right" />
                                        <NdTextBox id="txtMacId" parent={this} simple={true} dt={{data:this.dataObj,field:"MACID"}}
                                        onFocusOut={async()=>
                                        {
                                            let tmpDt = new datatable()
                                            tmpDt.selectCmd = 
                                            {
                                                query: `SELECT MACID FROM LICENCE WHERE MACID = '${this.txtMacId.value}'`,
                                            }
                                            await tmpDt.refresh()
                                            if(tmpDt.length > 0)
                                            {
                                                this.init(this.txtMacId.value)
                                            }
                                        }}>
                                            <Validator validationGroup={"frmGrp"  + this.tabIndex}>
                                                <RequiredRule message={"Boş geçemezsiniz !"} />
                                            </Validator>
                                        </NdTextBox>
                                    </Item>
                                    <Item>
                                        <Label text="Müşteri" alignment="right" />
                                        <NdTextBox id="txtCustomer" parent={this} simple={true} dt={{data:this.dataObj,field:"CUSTOMER_TITLE"}}
                                        button=
                                        {
                                            [
                                                {
                                                    id:'01',
                                                    icon:'more',
                                                    onClick:()=>
                                                    {
                                                        this.pg_txtCustomer.show()
                                                        this.pg_txtCustomer.onClick = (data) =>
                                                        {
                                                            if(data.length > 0)
                                                            {
                                                                this.dataObj[0].CUSTOMER = data[0].GUID
                                                                this.dataObj[0].CUSTOMER_TITLE = data[0].TITLE
                                                            }
                                                        }
                                                    }
                                                }
                                            ]
                                        }>
                                            <Validator validationGroup={"frmGrp"  + this.tabIndex}>
                                                <RequiredRule message={"Boş geçemezsiniz !"} />
                                            </Validator>
                                        </NdTextBox>
                                        {/* MÜŞTERİ SEÇİM POPUP */}
                                        <NdPopGrid id={"pg_txtCustomer"} parent={this} container={"#root"} 
                                        visible={false}
                                        position={{of:'#root'}} 
                                        showTitle={true} 
                                        showBorders={true}
                                        width={'90%'}
                                        height={'90%'}
                                        title={"Müşteri Seçimi"} 
                                        search={true}
                                        data = 
                                        {{
                                            source:
                                            {
                                                select:
                                                {
                                                    query : "SELECT GUID,TAX_NO,TITLE FROM CUSTOMERS WHERE UPPER(TAX_NO) LIKE UPPER(@VAL) OR UPPER(TITLE) LIKE UPPER(@VAL)",
                                                    param : ['VAL:string|50']
                                                },
                                                sql:this.core.sql
                                            }
                                        }}
                                        deferRendering={true}
                                        >
                                            <Column dataField="TAX_NO" caption={"VKN"} width={'30%'} />
                                            <Column dataField="TITLE" caption={"UNVAN"} width={'70%'} defaultSortOrder="asc" />
                                        </NdPopGrid>
                                    </Item>
                                    <Item>
                                        <Label text="Başlangıç Tarihi" alignment="right" />
                                        <NdDatePicker simple={true}  parent={this} id={"dtStartDate"} dt={{data:this.dataObj,field:"START_DATE"}}/>
                                    </Item>
                                    <Item>
                                        <Label text="Bitiş Tarihi" alignment="right" />
                                        <NdDatePicker simple={true}  parent={this} id={"dtFinishDate"} dt={{data:this.dataObj,field:"FINISH_DATE"}}/>
                                    </Item>
                                    <Item>
                                        <Label text="Kurulum Tarihi" alignment="right" />
                                        <NdDatePicker simple={true}  parent={this} id={"dtSetupDate"} dt={{data:this.dataObj,field:"SETUP_DATE"}}/>
                                    </Item>
                                    <Item>
                                        <Label text="Kiralık" alignment="right" />
                                        <NdCheckBox id="chkRent" parent={this} dt={{data:this.dataObj,field:"RENT"}}/>
                                    </Item>
                                    <Item>
                                        <Label text="Cloud" alignment="right" />
                                        <NdCheckBox id="chkCloud" parent={this} dt={{data:this.dataObj,field:"CLOUD"}}/>
                                    </Item>
                                    <Item>
                                        <Label text="Durum" alignment="right" />
                                        <NdCheckBox id="chkStatus" parent={this} dt={{data:this.dataObj,field:"STATUS"}}/>
                                    </Item>
                                </GroupItem>
                                <GroupItem colCount={2} caption={"PIQOFF"}>
                                    <GroupItem colCount={1}>  
                                        <Item>
                                            <Label text="Kullanıcı Sayısı" alignment="right" />
                                            <NdTextBox id="txtOffUserCount" parent={this} simple={true}/>
                                        </Item>
                                    </GroupItem>
                                    <GroupItem colCount={1}>
                                        <Item>
                                            <NdTreeView id="tvMenuOff" parent={this}
                                            items = {this.state.menuOff}
                                            width = {300}
                                            height = {'100%'}
                                            selectNodesRecursive={true}
                                            showCheckBoxesMode={"normal"}
                                            selectionMode={"multiple"}
                                            >
                                            </NdTreeView>
                                        </Item>
                                    </GroupItem>
                                </GroupItem>
                                <GroupItem colCount={2} caption={"PIQPOS"}>
                                    <Item>
                                        <Label text="Kullanıcı Sayısı" alignment="right" />
                                        <NdTextBox id="txtPosUserCount" parent={this} simple={true}/>
                                    </Item>
                                </GroupItem>
                                <GroupItem colCount={2} caption={"PIQMOB"}>
                                    <Item>
                                        <Label text="Kullanıcı Sayısı" alignment="right" />
                                        <NdTextBox id="txtMobUserCount" parent={this} simple={true}/>
                                    </Item>
                                </GroupItem>
                                <GroupItem colCount={2} caption={"PIQTAB"}>
                                    <Item>
                                        <Label text="Kullanıcı Sayısı" alignment="right" />
                                        <NdTextBox id="txtTabUserCount" parent={this} simple={true}/>
                                    </Item>
                                </GroupItem>
                                <GroupItem colCount={2} caption={"PIQREST"}>
                                    <Item>
                                        <Label text="Kullanıcı Sayısı" alignment="right" />
                                        <NdTextBox id="txtRestUserCount" parent={this} simple={true}/>
                                    </Item>
                                </GroupItem>
                                <GroupItem colCount={2} caption={"PIQBOSS"}>
                                    <Item>
                                        <Label text="Kullanıcı Sayısı" alignment="right" />
                                        <NdTextBox id="txtBossUserCount" parent={this} simple={true}/>
                                    </Item>
                                </GroupItem>
                            </Form>
                        </div>
                    </div>
                </ScrollView>
            </div>
        )
    }
} 