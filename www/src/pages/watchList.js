import React from 'react';
import App from '../lib/app.js';
import NdGrid, { Column } from '../core/react/devex/grid.js';
import NdButton from '../core/react/devex/button.js';
import ScrollView from 'devextreme-react/scroll-view.js';
import { datatable } from '../core/core.js';
import NdDialog, { dialog } from '../core/react/devex/dialog.js';
import NdPopUp from '../core/react/devex/popup.js';

export default class watchList extends React.Component
{
    constructor(props)
    {
        super(props)
        this.core = App.instance.core;
        this.userList = [];
        this.dataObj = new datatable();
        this.dataObj.selectCmd = 
        {
            query: "SELECT *,ISNULL((SELECT TITLE FROM CUSTOMERS WHERE GUID = CUSTOMER),'') AS CUSTOMER_TITLE FROM LICENCE WHERE DELETED = 0 AND STATUS = 1"
        }
    }
    componentDidMount()
    {
        this.getList()
    }
    async getList()
    {
        await this.dataObj.refresh();
        this.core.socket.emit('piqhub-get-users',undefined,(pResult)=>
        {
            if(typeof pResult != 'undefined')
            {
                for(let i = 0; i < this.dataObj.length; i++)
                {
                    this.userList = pResult;
                    let tmpUser = pResult.find(x => x.macid == this.dataObj[i].MACID);
                    this.dataObj[i].CONNECT_USERS = tmpUser != undefined ? tmpUser.users.length : -1;
                }
            }
        })
        await this.grdList.dataRefresh({ source: this.dataObj });
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
                            </div>
                        </div>
                        <NdGrid id="grdList" parent={this}
                            showBorders={true}
                            allowColumnResizing={true}
                            selection={{ mode: "single" }}
                            width={'100%'}
                            height={'100%'}
                            data={this.data}
                            dbApply={false}
                            filterRow={{ visible: true }} headerFilter={{ visible: true }}
                        >
                            <Column dataField="MACID" caption={"MACID"} width={160} />
                            <Column dataField="CUSTOMER_TITLE" caption={"MUSTERI"} width={1000} />
                            <Column dataField="CLOUD" caption={"CLOUD"} dataType="boolean" width={120} />
                            <Column dataField="VERSION" caption={"VERSION"} width={120} />
                            <Column dataField="CONNECT_USERS" caption={"KULLANICI"} width={120}
                            cellRender={(cellData) => 
                            (
                                cellData.value > 0 ? 
                                (
                                    <a href="#" onClick=
                                    {
                                        async (e) => 
                                        {
                                            e.preventDefault();
                                            let filteredUsers = this.userList.filter(x => x.macid == cellData.data.MACID);
                                            if (filteredUsers && filteredUsers.length > 0) 
                                            {
                                                await this.popUserDetail.show();
                                                await this.grdUserDetail.dataRefresh({source: filteredUsers[0].users});
                                            }
                                        }
                                    }>
                                        {cellData.value}
                                    </a>
                                ) : (cellData.value === -1 ? <span></span> : <span>{cellData.value}</span>)
                            )}
                            />
                        </NdGrid>
                    </div>
                </div>
                {/* KULLANICI DETAYI POPUP */}
                <div>
                    <NdPopUp parent={this} id={"popUserDetail"} 
                    visible={false}                        
                    showCloseButton={true}
                    showTitle={true}
                    title={"Kullanıcı Detayı"}
                    container={"#root"} 
                    width={"500"}
                    height={"500"}
                    position={{of:"#root"}}
                    deferRendering={true}
                    >
                        <div className="row">
                            <div className="col-12">
                                <NdGrid parent={this} id={"grdUserDetail"} 
                                showBorders={true} 
                                columnsAutoWidth={true} 
                                height={"400px"} 
                                width={"100%"}
                                dbApply={false}
                                selection={{mode:"single"}}
                                >
                                    <Column dataField="username" caption={"ADI"} width={'70%'}/>
                                    <Column dataField="app" caption={"APP"} width={'30%'} />
                                </NdGrid>
                            </div>
                        </div>
                    </NdPopUp>
                </div>
            </ScrollView>
        )
    }
}