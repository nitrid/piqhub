import React from 'react';
import moment from 'moment';
import App from '../lib/app.js';
import NdGrid, { Column, Button } from '../core/react/devex/grid.js';
import NdButton from '../core/react/devex/button.js';
import ScrollView from 'devextreme-react/scroll-view.js';
import { datatable } from '../core/core.js';
import NdDialog, { dialog } from '../core/react/devex/dialog.js';
import NdPopUp from '../core/react/devex/popup.js';
import NdTextBox from '../core/react/devex/textbox.js';
import NdTextArea from '../core/react/devex/textarea.js';
import JSZip from 'jszip';

export default class versionList extends React.Component
{
    constructor(props)
    {
        super(props)
        this.core = App.instance.core;
        this.dataObj = new datatable();
        this.dataObj.selectCmd = 
        {
            query: "SELECT * FROM VERSION WHERE DELETED = 0"
        }
        this.dataObj.insertCmd = 
        {
            query: `INSERT INTO VERSION (CUSER, CDATE, LUSER, LDATE, VERSION, DELETED) 
                    VALUES (@CUSER, @CDATE, @LUSER, @LDATE, @VERSION, 0)`,
            param: ['CUSER:string|25', 'CDATE:datetime', 'LUSER:string|25', 'LDATE:datetime', 'VERSION:string|10']
        }
        this.dataObj.updateCmd = 
        {
            query: `UPDATE VERSION SET LUSER = @LUSER, LDATE = @LDATE, VERSION = @VERSION WHERE GUID = @GUID`,
            param: ['LUSER:string|25', 'LDATE:datetime', 'VERSION:string|10', 'GUID:string|50']
        }
        this.dataObj.deleteCmd = 
        {
            query: 'DELETE FROM VERSION WHERE GUID = @GUID',
            param: ['GUID:string|50']
        }

        this.btnSqlGenerate = this.btnSqlGenerate.bind(this);
        this.btnUpload = this.btnUpload.bind(this);

        this.state = 
        {
            processStatus: {},
            uploadStatus: {}
        }
    }
    componentDidMount()
    {
        this.getList();

        this.core.socket.on('script-progress', async (data) => 
        {
            let newStatus = {...this.state.processStatus};
            
            if(data.eventType === 'complete')
            {
                if(typeof this.popSqlGenerate != 'undefined' && this.popSqlGenerate.state.show) 
                {
                    this.txtPopSqlGenerate.value += "\n" + data.message + "\nİşlem tamamlandı.";
                }

                delete newStatus[data.version];

                this.setState({processStatus: newStatus}, async () => 
                {
                    await this.getList();
                });
            }
            else
            {
                newStatus[data.version] = 
                {
                    message: data.message,
                    process: data.process,
                    eventType: data.eventType
                };

                if(typeof this.popSqlGenerate != 'undefined' && this.popSqlGenerate.state.show) 
                {
                    this.txtPopSqlGenerate.value += data.message + "\n";
                }

                this.setState({processStatus: newStatus});
            }
        });
    }
    componentWillUnmount()
    {
        this.core.socket.off('script-progress');
    }
    async checkScriptFiles(version)
    {
        try
        {
            let response = await fetch(`/api/version/${version}/db/T.sql`);
            let tExists = response.ok;
            
            response = await fetch(`/api/version/${version}/db/VFP.sql`);
            let vfpiExists = response.ok;
            
            return tExists && vfpiExists;
        }
        catch(error)
        {
            return false;
        }
    }
    async checkFiles(version)
    {
        try
        {
            let response = await fetch(`/api/version/${version}/public.zip`);
            let tExists = response.ok;
            
            return tExists;
        }
        catch(error)
        {
            return false;
        }
    }
    async getList()
    {
        await this.dataObj.refresh();
        
        for(let i = 0; i < this.dataObj.length; i++)
        {
            this.dataObj[i].SQL_SCRIPT = await this.checkScriptFiles(this.dataObj[i].VERSION);
            this.dataObj[i].FILE = await this.checkFiles(this.dataObj[i].VERSION);
        }
        
        await this.grdList.dataRefresh({ source: this.dataObj });
    }
    async btnSqlGenerate(pData)
    {
        this.popSqlGenerate.version = pData.VERSION;        
        await this.popSqlGenerate.show();
        
        if(this.state.processStatus[pData.VERSION]) 
        {
            this.txtPopSqlGenerate.value = this.state.processStatus[pData.VERSION].message;
        }
        else 
        {
            this.txtPopSqlGenerate.value = '';
        }
    }
    async btnUpload(pData)
    {
        const dirInput = document.createElement('input');
        dirInput.type = 'file';
        dirInput.webkitdirectory = true;
        dirInput.directory = true;
        dirInput.style.display = 'none';
        
        dirInput.onchange = async (e) => 
        {
            const files = Array.from(e.target.files);
            if(files.length === 0) return;

            try 
            {
                this.setState(prevState => (
                {
                    uploadStatus: 
                    {
                        ...prevState.uploadStatus,
                        [pData.VERSION]: 
                        {
                            status: 'processing',
                            message: 'Dosyalar hazırlanıyor...',
                            progress: 0
                        }
                    }
                }));

                const includePaths = 
                [
                    'www/public', 
                    'www/package.json',
                    'node_modules',
                    'doc',
                    'plugins',
                    'setup',
                    '.gitattributes',
                    '.gitignore',
                    'doc.md',
                    'package.json',
                    'pem.js',
                    'piqhub.js',
                    'server.js',
                    'terminal.js'
                ];
                const zip = new JSZip();
                const basePath = files[0].webkitRelativePath.split('/')[0];

                const totalFiles = files.filter(file => 
                {
                    const relativePath = file.webkitRelativePath.substring(basePath.length + 1);
                    return includePaths.some(includePath => 
                    {
                        if(includePath === 'package.json' || includePath === 'www/package.json')
                        {
                            return relativePath === 'package.json' || relativePath === 'www/package.json';
                        }

                        if(relativePath.startsWith('plugins/devprint/repx'))
                        {
                            return false;
                        }

                        return relativePath.startsWith(includePath);
                    });
                }).length;

                let processedFiles = 0;

                for(const file of files)
                {
                    const relativePath = file.webkitRelativePath.substring(basePath.length + 1);
                    const shouldInclude = includePaths.some(includePath => 
                    {
                        if(includePath === 'package.json' || includePath === 'www/package.json')
                        {
                            return relativePath === 'package.json' || relativePath === 'www/package.json';
                        }
                        if(relativePath.startsWith('plugins/devprint/repx'))
                        {
                            return false;
                        }
                        return relativePath.startsWith(includePath);
                    });

                    if(shouldInclude)
                    {
                        let zipPath = relativePath;
                        
                        if(relativePath.startsWith('www/'))
                        {
                            zipPath = relativePath;
                        }
                        else if(relativePath === 'package.json')
                        {
                            zipPath = relativePath;
                        }
                        else if(relativePath.startsWith('public/'))
                        {
                            zipPath = 'www/' + relativePath;
                        }
                        
                        const content = await file.arrayBuffer();
                        zip.file(zipPath, content);
                        
                        processedFiles++;
                        const progress = Math.round((processedFiles / totalFiles) * 100);
                        
                        this.setState(prevState => (
                        {
                            uploadStatus: 
                            {
                                ...prevState.uploadStatus,
                                [pData.VERSION]: 
                                {
                                    status: 'processing',
                                    message: `Dosyalar zipleniyor... (${processedFiles}/${totalFiles})`,
                                    progress: progress
                                }
                            }
                        }));
                    }
                }

                this.setState(prevState => (
                {
                    uploadStatus: 
                    {
                        ...prevState.uploadStatus,
                        [pData.VERSION]: 
                        {
                            status: 'processing',
                            message: 'Zip dosyası oluşturuluyor...',
                            progress: 100
                        }
                    }
                }));

                const zipContent = await zip.generateAsync({type: 'blob'});
                const formData = new FormData();
                formData.append('file', zipContent, 'public.zip');

                const xhr = new XMLHttpRequest();

                xhr.upload.onprogress = (event) => 
                {
                    if (event.lengthComputable) 
                    {
                        const uploadProgress = Math.round((event.loaded / event.total) * 100);
                        this.setState(prevState => (
                        {
                            uploadStatus: 
                            {
                                ...prevState.uploadStatus,
                                [pData.VERSION]: 
                                {
                                    status: 'processing',
                                    message: `Dosya yükleniyor...`,
                                    progress: uploadProgress
                                }
                            }
                        }));
                    }
                };

                const uploadResult = await new Promise((resolve, reject) => 
                {
                    xhr.onload = () => 
                    {
                        if (xhr.status === 200) 
                        {
                            try 
                            {
                                const response = JSON.parse(xhr.responseText);
                                resolve(response);
                            } 
                            catch (error) 
                            {
                                reject(new Error('Invalid response format'));
                            }
                        } 
                        else 
                        {
                            reject(new Error(`Upload failed with status: ${xhr.status}`));
                        }
                    };

                    xhr.onerror = () => 
                    {
                        reject(new Error('Network error occurred'));
                    };

                    xhr.open('POST', `/api/version/${pData.VERSION}/upload`);
                    xhr.send(formData);
                });

                if(uploadResult.success) 
                {
                    this.setState(prevState => (
                    {
                        uploadStatus: 
                        {
                            ...prevState.uploadStatus,
                            [pData.VERSION]: 
                            {
                                status: 'completed',
                                message: 'Yükleme tamamlandı',
                                progress: 100
                            }
                        }
                    }));

                    let tmpConfObj = 
                    {
                        id:'msgSuccess',
                        showTitle:true,
                        title:"Başarılı",
                        showCloseButton:true,
                        width:'500px',
                        height:'200px',
                        button:[{id:"btn01",caption:"Tamam",location:'after'}],
                        content:(<div style={{textAlign:"center",fontSize:"20px"}}>{"Dosyalar başarıyla yüklendi."}</div>)
                    }
                    await dialog(tmpConfObj);
                    
                    await this.getList();
                }
                else 
                {
                    throw new Error(uploadResult.error);
                }
            }
            catch(error) 
            {
                this.setState(prevState => (
                {
                    uploadStatus: 
                    {
                        ...prevState.uploadStatus,
                        [pData.VERSION]: 
                        {
                            status: 'error',
                            message: `Hata: ${error.message}`,
                            progress: 0
                        }
                    }
                }));

                console.error('Error uploading file:', error);
                let tmpConfObj = 
                {
                    id:'msgError',
                    showTitle:true,
                    title:"Hata",
                    showCloseButton:true,
                    width:'500px',
                    height:'200px',
                    button:[{id:"btn01",caption:"Tamam",location:'after'}],
                    content:(<div style={{textAlign:"center",fontSize:"20px"}}>{"Dosya yükleme hatası: " + error.message}</div>)
                }
                await dialog(tmpConfObj);
            }
            finally 
            {
                document.body.removeChild(dirInput);
            }
        };

        document.body.appendChild(dirInput);
        dirInput.click();
    }
    render()
    {
        return(
            <ScrollView>
                <div className="row p-2">
                    <div className="col-12">
                        <div className="row mb-2">
                            <div className="col d-flex justify-content-end">
                                <NdButton type="default" icon="plus" style={{marginRight:5}}
                                onClick={async()=>
                                {
                                    this.popVersionDetail.show();
                                }}
                                />
                                <NdButton type="default" icon="refresh" style={{marginRight:5}}
                                onClick={async()=>
                                {
                                    this.getList();
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

                                            this.core.socket.emit('piqhub-delete-folder', 
                                            { 
                                                path: `/${this.grdList.devGrid.getSelectedRowsData()[0].VERSION}` 
                                            },
                                            (response) => 
                                            {
                                                if (!response.success) 
                                                {
                                                    console.error('Error deleting folder:', response.error);
                                                }
                                            });
                                        }
                                    }
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
                            <Column dataField="VERSION" caption={"VERSION"} width={120} />
                            <Column caption={"SQL SCRIPT"} width={500}
                            cellRender={(e) => 
                            {
                                if(this.state.processStatus[e.data.VERSION])
                                {
                                    let status = this.state.processStatus[e.data.VERSION];

                                    if(status.message != 'Database connection closed')
                                    {
                                        return (
                                            <div>
                                                <i className="dx-icon-running" style={{color: 'blue'}} />
                                                <span style={{marginLeft: '5px'}}>
                                                    {status.message}
                                                </span>
                                            </div>
                                        );
                                    }
                                }

                                return (
                                    <div>
                                        <i className={e.data.SQL_SCRIPT ? "dx-icon-check" : "dx-icon-close"} 
                                           style={{color: e.data.SQL_SCRIPT ? 'green' : 'red'}}
                                        />
                                    </div>
                                );
                            }}
                            />
                            <Column caption={"ZIP FILE"} width={500}
                            cellRender={(e) => 
                            {
                                // Upload durumunu kontrol et
                                const uploadStatus = this.state.uploadStatus[e.data.VERSION];
                                if(uploadStatus)
                                {
                                    if(uploadStatus.status === 'processing')
                                    {
                                        return (
                                            <div>
                                                <i className="dx-icon-running" style={{color: 'blue'}} />
                                                <span style={{marginLeft: '5px'}}>
                                                    {uploadStatus.message} ({uploadStatus.progress}%)
                                                </span>
                                            </div>
                                        );
                                    }
                                }

                                return (
                                    <div>
                                        <i className={e.data.FILE ? "dx-icon-check" : "dx-icon-close"} 
                                           style={{color: e.data.FILE ? 'green' : 'red'}}
                                        />
                                    </div>
                                );
                            }}
                            />
                            <Column type="buttons" width={70}>
                                <Button hint="Sql Generate" icon="variable" onClick={(e) => this.btnSqlGenerate(e.row.data)} />
                                <Button hint="Upload" icon="parentfolder" onClick={(e) => this.btnUpload(e.row.data)} />
                            </Column>
                        </NdGrid>
                    </div>
                </div>
                {/* VERSION DETAYI POPUP */}
                <div>
                    <NdPopUp parent={this} id={"popVersionDetail"} 
                    visible={false}                        
                    showCloseButton={true}
                    showTitle={true}
                    title={"Version Detayı"}
                    container={"#root"} 
                    width={"400"}
                    height={"210"}
                    position={{of:"#root"}}
                    deferRendering={true}
                    >
                        <div className="row p-2">
                            <div className="col-12">
                                <div className="row pb-2">
                                    <div className="col-3 align-content-center">
                                        <label className="d-flex justify-content-end">Version :</label>
                                    </div>
                                    <div className="col-9">
                                        <NdTextBox id="txtVersion" parent={this} simple={true} maxLength={10}/>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-12">
                                        <NdButton id={"btnVersionSave"} parent={this} icon={"floppy"} type="success" stylingMode="contained" width={"100%"} height={"50px"}
                                        onClick={async ()=>
                                        {
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

                                                this.dataObj.push(
                                                {
                                                    GUID: datatable.uuidv4(),
                                                    CUSER: this.core.auth.data.CODE,
                                                    CDATE: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
                                                    LUSER: this.core.auth.data.CODE,
                                                    LDATE: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
                                                    VERSION: this.txtVersion.value,
                                                });
                                                
                                                let tmpResult = await this.dataObj.update();
                                                this.getList();
                                                this.popVersionDetail.hide();

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
                                        }}>
                                        </NdButton>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </NdPopUp>
                </div>
                {/* SQL GENERATE POPUP */}
                <div>
                    <NdPopUp parent={this} id={"popSqlGenerate"} 
                    visible={false}                        
                    showCloseButton={true}
                    showTitle={true}
                    title={"Sql Generate"}
                    container={"#root"} 
                    width={"700"}
                    height={"600"}
                    position={{of:"#root"}}
                    deferRendering={true}
                    >
                        <div className="row p-2">
                            <div className="col-12">
                                <div className="row pb-2">
                                    <div className="col-12">
                                        <NdTextArea id={"txtPopSqlGenerate"} parent={this} height={"435"} readOnly={true}/>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-12">
                                        <NdButton id={"btnGenerateExecute"} parent={this} 
                                        icon={"floppy"} 
                                        type="success" 
                                        stylingMode="contained" 
                                        width={"100%"} 
                                        height={"50px"}
                                        onClick={async ()=>
                                        {
                                            if(this.state.processStatus[this.popSqlGenerate.version]) 
                                            {
                                                let tmpConfObj =
                                                {
                                                    id:'msgActiveProcess',showTitle:true,title:"Dikkat",showCloseButton:true,width:'500px',height:'200px',
                                                    button:[{id:"btn01",caption:"Tamam",location:'after'}],
                                                    content:(<div style={{textAlign:"center",fontSize:"20px"}}>{"Devam eden işlem var. İşlemi bitirmeden yeni işlem başlatamazsınız."}</div>)
                                                }
                                                await dialog(tmpConfObj);
                                                return;
                                            }

                                            // TextArea'yı temizle
                                            this.txtPopSqlGenerate.value = '';
                                            
                                            this.core.socket.emit('piqhub-gensc', 
                                            {
                                                version: this.popSqlGenerate.version
                                            },
                                            (response) => 
                                            {
                                                if(!response.success)
                                                {
                                                    this.txtPopSqlGenerate.value = response.error;
                                                }
                                            });
                                        }}>
                                        </NdButton>
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