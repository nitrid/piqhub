import React from 'react';
import App from '../lib/app.js';
import NdGrid, { Column } from '../core/react/devex/grid.js';
import NdButton from '../core/react/devex/button.js';
import ScrollView from 'devextreme-react/scroll-view.js';
import { datatable } from '../core/core.js';
import NdDialog, { dialog } from '../core/react/devex/dialog.js';

export default class watchList extends React.Component
{
    constructor(props)
    {
        super(props)
        this.core = App.instance.core;
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
        this.core.socket.emit('piqhub-get-users', undefined, (pResult) =>
        {
            if (typeof pResult != 'undefined')
            {
                for (let i = 0; i < this.dataObj.length; i++)
                {
                    let tmpUser = pResult.find(x => x.macid == this.dataObj[i].MACID);
                    this.dataObj[i].CONNECT_USERS = tmpUser != undefined ? tmpUser.users.length : -1;
                    this.dataObj[i].users = tmpUser != undefined ? tmpUser.users : [];
                }
            }
        })
        await this.grdList.dataRefresh({ source: this.dataObj });
    }

    handleUserLinkClick = (e, data) => {
        e.preventDefault(); // Linkin varsayılan davranışını engelle
        dialog({
            id: 'userListPopup',
            showTitle: true,
            title: 'Connected Users',
            showCloseButton: true,
            width: '400px',
            height: '300px',
            content: (
                <div>
                    <h4>Users connected to {data.MACID}</h4>
                    <ul>
                        {data.CONNECT_USERS > 0 ? (
                            data.users.map((user, index) => (
                                <li key={index}>{user}</li>
                            ))
                        ) : (
                            <li>No users connected</li>
                        )}
                    </ul>
                </div>
            )
        });
    }

    render()
    {
        return (
            <ScrollView>
                <div className="row p-2">
                    <div className="col-12">
                        <div className="row mb-2">
                            <div className="col d-flex justify-content-end">
                                <NdButton type="default" icon="refresh" style={{ marginRight: 5 }}
                                    onClick={async () => {
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
                            <Column dataField="MACID" caption={"MACID"} width={200} />
                            <Column dataField="CUSTOMER_TITLE" caption={"MUSTERI"} width={500} />
                            <Column dataField="CLOUD" caption={"CLOUD"} dataType="boolean" width={150} />
                            <Column dataField="VERSION" caption={"VERSION"} width={150} />
                            <Column dataField="CONNECT_USERS" caption={"KULLANICI"} width={150}
                                cellRender={(cellData) => (
                                    <a href="#" onClick={(e) => this.handleUserLinkClick(e, cellData.data)}>
                                        {cellData.value}
                                    </a>
                                )}
                            />
                        </NdGrid>
                    </div>
                </div>
            </ScrollView>
        )
    }
}