import React from 'react';
import App from '../lib/app.js';
import NdGrid, { Column, Button } from '../core/react/devex/grid.js';
import NdButton from '../core/react/devex/button.js';
import ScrollView from 'devextreme-react/scroll-view.js';
import { datatable } from '../core/core.js';
import NdDialog, { dialog } from '../core/react/devex/dialog.js';
import NdPopUp from '../core/react/devex/popup.js';
import NdSelectBox from '../core/react/devex/selectbox.js';

export default class updateList extends React.Component
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

        this.versionObj = new datatable();
        this.versionObj.selectCmd = 
        {
            query: "SELECT VERSION FROM VERSION WHERE DELETED = 0 ORDER BY VERSION DESC"
        }

        this.state = 
        {
            updateStatus: {},
            popupData: null
        }

        this.btnDbUpdate = this.btnDbUpdate.bind(this);
        this.btnAppUpdate = this.btnAppUpdate.bind(this);
    }
    componentDidMount()
    {
        this.getList();

        this.core.socket.on('db-update-progress', (data) => 
        {
            if(data.macid)
            {
                if(data.status === 'completed' || data.message.includes('completed'))
                {
                    this.setState(prevState => 
                    {
                        const newState = {...prevState};
                        delete newState.updateStatus[data.macid];
                        return newState;
                    });
                }
                else
                {
                    this.setState(prevState => (
                    {
                        updateStatus: 
                        {
                            ...prevState.updateStatus,
                            [data.macid]: 
                            {
                                type: 'database',
                                status: data.status,
                                message: data.message,
                                progress: data.progress
                            }
                        }
                    }));
                }
            }
        });
        this.core.socket.on('app-update-progress', (data) => 
        {
            if(data.macid)
            {
                if(data.status === 'completed' || data.message.includes('completed'))
                {
                    this.setState(prevState => 
                    {
                        const newState = {...prevState};
                        delete newState.updateStatus[data.macid];
                        return newState;
                    });
                }
                else
                {
                    this.setState(prevState => (
                    {
                        updateStatus: 
                        {
                            ...prevState.updateStatus,
                            [data.macid]: 
                            {
                                type: 'application',
                                status: data.status,
                                message: data.message,
                                progress: data.progress
                            }
                        }
                    }));
                }
            }
        });
    }
    componentWillUnmount()
    {
        this.core.socket.off('db-update-progress');
        this.core.socket.off('app-update-progress');
    }
    async getList()
    {
        await this.dataObj.refresh();
        this.core.socket.emit('piqhub-get-users', undefined, (pResult) =>
        {
            console.log(pResult)
            if (typeof pResult != 'undefined')
            {
                for (let i = 0; i < this.dataObj.length; i++)
                {
                    let tmpUser = pResult.find(x => x.macid == this.dataObj[i].MACID);
                    this.dataObj[i].CONNECT_STATUS = tmpUser != undefined;
                    this.dataObj[i].users = tmpUser != undefined ? tmpUser.users : [];
                }
            }
        })
        await this.grdList.dataRefresh({ source: this.dataObj });
    }
    async btnDbUpdate(pData)
    {
        // Bağlantı kontrolü
        if(!pData.CONNECT_STATUS)
        {
            let tmpConfObj = 
            {
                id:'msgError',
                showTitle:true,
                title:"Hata",
                showCloseButton:true,
                width:'500px',
                height:'200px',
                button:[{id:"btn01",caption:"Tamam",location:'after'}],
                content:(<div style={{textAlign:"center",fontSize:"20px"}}>{"Müşteri bağlantısı aktif değil!"}</div>)
            }
            await dialog(tmpConfObj);
            return;
        }

        // İşlem devam ediyor mu kontrolü
        if(this.state.updateStatus[pData.MACID])
        {
            let tmpConfObj = 
            {
                id:'msgError',
                showTitle:true,
                title:"Hata",
                showCloseButton:true,
                width:'500px',
                height:'200px',
                button:[{id:"btn01",caption:"Tamam",location:'after'}],
                content:(<div style={{textAlign:"center",fontSize:"20px"}}>{"Güncelleme işlemi devam ediyor!"}</div>)
            }
            await dialog(tmpConfObj);
            return;
        }

        try 
        {
            await this.versionObj.refresh();

            this.setState({ popupData: { ...pData, updateType: 'db' } }, async () => 
            {
                await this.popVersionSelect.show();
                await this.cmbVersion.dataRefresh({source: this.versionObj});
            });
        }
        catch(error)
        {
            console.error('Database update error:', error);
            
            // Hata durumunda state'i temizle
            this.setState(prevState => 
            {
                const newState = {...prevState};
                delete newState.updateStatus[pData.MACID];
                return newState;
            });

            let tmpConfObj = 
            {
                id:'msgError',
                showTitle:true,
                title:"Hata",
                showCloseButton:true,
                width:'500px',
                height:'200px',
                button:[{id:"btn01",caption:"Tamam",location:'after'}],
                content:(<div style={{textAlign:"center",fontSize:"20px"}}>{"Veritabanı güncelleme hatası: " + error.message}</div>)
            }
            await dialog(tmpConfObj);
        }
    }
    async btnAppUpdate(pData)
    {
        // Bağlantı kontrolü
        if(!pData.CONNECT_STATUS)
        {
            let tmpConfObj = 
            {
                id:'msgError',
                showTitle:true,
                title:"Hata",
                showCloseButton:true,
                width:'500px',
                height:'200px',
                button:[{id:"btn01",caption:"Tamam",location:'after'}],
                content:(<div style={{textAlign:"center",fontSize:"20px"}}>{"Müşteri bağlantısı aktif değil!"}</div>)
            }
            await dialog(tmpConfObj);
            return;
        }

        // İşlem devam ediyor mu kontrolü
        if(this.state.updateStatus[pData.MACID])
        {
            let tmpConfObj = 
            {
                id:'msgError',
                showTitle:true,
                title:"Hata",
                showCloseButton:true,
                width:'500px',
                height:'200px',
                button:[{id:"btn01",caption:"Tamam",location:'after'}],
                content:(<div style={{textAlign:"center",fontSize:"20px"}}>{"Güncelleme işlemi devam ediyor!"}</div>)
            }
            await dialog(tmpConfObj);
            return;
        }

        try 
        {
            await this.versionObj.refresh();

            this.setState({ popupData: { ...pData, updateType: 'app' } }, async () => 
            {
                await this.popVersionSelect.show();
                await this.cmbVersion.dataRefresh({source: this.versionObj});
            });
        }
        catch(error)
        {
            console.error('Application update error:', error);
            
            // Hata durumunda state'i temizle
            this.setState(prevState => 
            {
                const newState = {...prevState};
                delete newState.updateStatus[pData.MACID];
                return newState;
            });

            // Hata mesajını göster
            let tmpConfObj = 
            {
                id:'msgError',
                showTitle:true,
                title:"Hata",
                showCloseButton:true,
                width:'500px',
                height:'200px',
                button:[{id:"btn01",caption:"Tamam",location:'after'}],
                content:(<div style={{textAlign:"center",fontSize:"20px"}}>{"Program güncelleme hatası: " + error.message}</div>)
            }
            await dialog(tmpConfObj);
        }
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
                        filterRow={{ visible: true }} 
                        headerFilter={{ visible: true }}
                        >
                            <Column dataField="MACID" caption={"MACID"} width={200} />
                            <Column dataField="CUSTOMER_TITLE" caption={"MÜŞTERİ"} width={300} />
                            <Column dataField="VERSION" caption={"VERSION"} width={120} />
                            <Column caption={"DURUM"} width={120}
                            cellRender={(e) => 
                            {
                                return (
                                    <div>
                                        <i className={e.data.CONNECT_STATUS ? "dx-icon-check" : "dx-icon-close"} style={{color: e.data.CONNECT_STATUS ? 'green' : 'red'}}/>
                                        <span style={{marginLeft: '5px'}}>
                                            {e.data.CONNECT_STATUS ? 'Bağlı' : 'Bağlı Değil'}
                                        </span>
                                    </div>
                                );
                            }}
                            />
                            <Column caption={""} width={300}
                            cellRender={(e) => 
                            {
                                const status = this.state.updateStatus[e.data.MACID];
                                if(status)
                                {
                                    return (
                                        <div>
                                            <i className="dx-icon-running" style={{color: 'blue'}} />
                                            <span style={{marginLeft: '5px'}}>
                                                {status.status} - {status.message} ({status.progress}%)
                                            </span>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                            />
                            <Column type="buttons" width={100}>
                                <Button 
                                hint="Veritabanı Güncelle" 
                                icon="share" 
                                onClick={(e) => this.btnDbUpdate(e.row.data)}
                                disabled={(data) => !data.CONNECT_STATUS || this.state.updateStatus[data.MACID]} 
                                />
                                <Button 
                                hint="Program Güncelle" 
                                icon="download" 
                                onClick={(e) => this.btnAppUpdate(e.row.data)}
                                disabled={(data) => !data.CONNECT_STATUS} 
                                />
                            </Column>
                        </NdGrid>
                    </div>
                </div>
                {/* Versiyon Seçim Popup'ı */}
                <div>
                    <NdPopUp parent={this} id={"popVersionSelect"} 
                    visible={false}                        
                    showCloseButton={true}
                    showTitle={true}
                    title={"Versiyon Seçimi"}
                    container={"#root"} 
                    width={"350"}
                    height={"210"}
                    position={{of:"#root"}}
                    >
                        <div className="row p-2">
                            <div className="col-12">
                                <div className="row pb-4">
                                    <div className="col-4 align-self-center">
                                        <label className="text-right">Versiyon :</label>
                                    </div>
                                    <div className="col-8">
                                        <NdSelectBox id="cmbVersion" parent={this} simple={true}
                                        displayExpr="VERSION"
                                        valueExpr="VERSION"
                                        searchEnabled={true}
                                        />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-12">
                                        <NdButton text="Güncelle" type="success" width="100%" 
                                        onClick={async () => 
                                        {
                                            if(typeof this.cmbVersion.value == 'undefined')
                                            {
                                                let tmpConfObj = 
                                                {
                                                    id:'msgWarning',
                                                    showTitle:true,
                                                    title:"Uyarı",
                                                    showCloseButton:true,
                                                    width:'500px',
                                                    height:'200px',
                                                    button:[{id:"btn01",caption:"Tamam",location:'after'}],
                                                    content:(<div style={{textAlign:"center",fontSize:"20px"}}>{"Lütfen versiyon seçiniz!"}</div>)
                                                }
                                                await dialog(tmpConfObj);
                                                return;
                                            }

                                            let tmpConfObj =
                                            {
                                                id:'msgConfirm',
                                                showTitle:true,
                                                title:"Dikkat",
                                                showCloseButton:true,
                                                width:'500px',
                                                height:'200px',
                                                button:[{id:"btn01",caption:"Evet",location:'before'},{id:"btn02",caption:"Hayır",location:'after'}],
                                                content:(
                                                <div style={{textAlign:"center",fontSize:"20px"}}>
                                                    {this.state.popupData.updateType === 'app' ? 
                                                    "Programı güncellemek istediğinize emin misiniz?" : 
                                                    "Veritabanını güncellemek istediğinize emin misiniz?"}
                                                </div>)
                                            }
                                            
                                            let pResult = await dialog(tmpConfObj);
                                            if(pResult == 'btn01')
                                            {
                                                this.popVersionSelect.hide();
                                                this.core.socket.emit(this.state.popupData.updateType === 'app' ? 'piqhub-app-update' : 'piqhub-db-update', 
                                                {
                                                    macid: this.state.popupData.MACID,
                                                    version: this.cmbVersion.value
                                                }, 
                                                (response) => 
                                                {
                                                    if(!response.success)
                                                    {
                                                        throw new Error(response.error);
                                                    }
                                                });
                                            }
                                        }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </NdPopUp>
                </div>
            </ScrollView>
        )
    }
} 