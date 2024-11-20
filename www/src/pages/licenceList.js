import React from 'react';
import App from '../lib/app.js';
import NdGrid,{Column,Editing,Popup,Paging,Scrolling,KeyboardNavigation,Lookup} from  '../core/react/devex/grid.js';
import NdButton from '../core/react/devex/button.js';
import ScrollView from 'devextreme-react/scroll-view.js';
import { datatable } from '../core/core.js';
import NdDialog, { dialog } from '../core/react/devex/dialog.js';

export default class licenceList extends React.Component
{
    constructor(props)
    {
        super(props)
        this.core = App.instance.core;
        this.dataObj = new datatable();
        this.dataObj.selectCmd = 
        {
            query: "SELECT *,ISNULL((SELECT TITLE FROM CUSTOMERS WHERE GUID = CUSTOMER),'') AS CUSTOMER_TITLE FROM LICENCE WHERE DELETED = 0"
        }
        this.dataObj.deleteCmd = 
        {
            query: 'UPDATE LICENCE SET DELETED = 1 WHERE MACID = @MACID',
            param: ['MACID:string|50']
        }
    }
    componentDidMount()
    {
        this.getList()
    }
    async getList()
    {
        await this.dataObj.refresh();
        await this.grdList.dataRefresh({source:this.dataObj});
    }
    render()
    {
        return(
            <ScrollView>
                <div className="row p-2">
                    <div className="col-12">
                        <div className="row mb-2">
                            <div className="col d-flex justify-content-end">
                                <NdButton type="default" icon="refresh" style={{marginRight:5}}
                                onClick={async()=>
                                {
                                    this.getList();
                                }}
                                />
                                <NdButton type="default" icon="plus" style={{marginRight:5}}
                                onClick={()=>
                                {
                                    let tmpData = 
                                    {
                                        id: 'licenceCard',
                                        text: 'Yeni Lisans',
                                        path: 'licenceCard.js',
                                        pagePrm: {MACID:''}
                                    }

                                    App.instance.menuClick(tmpData);
                                }}
                                />
                                <NdButton type="danger" icon="trash"
                                onClick={async()=>
                                {
                                    if(this.grdList.devGrid.getSelectedRowsData().length > 0)
                                    {
                                        let tmpConfObj =
                                        {
                                            id:'msgDelete',showTitle:true,title:"Dikkat",showCloseButton:true,width:'500px',height:'200px',
                                            button:[{id:"btn01",caption:"Evet",location:'before'},{id:"btn02",caption:"Hayır",location:'after'}],
                                            content:(<div style={{textAlign:"center",fontSize:"20px"}}>{"Seçili kayıt ı silmek istediğinize emin misiniz?"}</div>)
                                        }
                                        let pResult = await dialog(tmpConfObj);
                                        if(pResult == 'btn01')
                                        {
                                            this.dataObj.removeAt(this.grdList.devGrid.getSelectedRowsData()[0])
                                            await this.dataObj.delete()
                                            this.getList()
                                        }
                                    }
                                }}
                                />
                            </div>
                        </div>
                        <NdGrid id="grdList" parent={this} 
                        showBorders={true}
                        allowColumnResizing={true}
                        selection={{mode:"single"}} 
                        width={'100%'}
                        height={'100%'}
                        data={this.data}
                        dbApply={false}
                        filterRow={{visible:true}} headerFilter={{visible:true}}
                        onRowDblClick={(e)=>
                        {
                            let tmpData = 
                            {
                                id: 'licenceCard',
                                text: 'Yeni Lisans',
                                path: 'licenceCard.js',
                                pagePrm: {MACID:e.key.MACID}
                            }

                            App.instance.menuClick(tmpData);
                        }}
                        >
                            <Column dataField="MACID" caption={"MACID"} width={200}/>
                            <Column dataField="CUSTOMER_TITLE" caption={"MUSTERI"} width={500}/>
                            <Column dataField="START_DATE" caption={"BAS.TARIH"} dataType="date" width={200}/>
                            <Column dataField="FINISH_DATE" caption={"BIT.TARIH"} dataType="date" width={200}/>
                            <Column dataField="RENT" caption={"KIRALIK"} dataType="boolean" width={150}/>
                            <Column dataField="CLOUD" caption={"CLOUD"} dataType="boolean" width={150}/>
                            <Column dataField="STATUS" caption={"DURUM"} dataType="boolean" width={150}/>
                        </NdGrid>
                    </div>
                </div>
            </ScrollView>
        )
    }
}