import { isProxy } from 'is-proxy';
import moment from 'moment';

export class core
{        
    static instance = null;

    constructor(pIo)
    {   
        if(!core.instance)
        {
            core.instance = this;
        }
        
        try
        {
            this.socket = pIo;
        }
        catch (error) {}

        if(typeof this.socket == 'undefined')
        {
            console.log("socket not defined")
            return;
        }
        
        this.offline = false;
        this.listeners = Object();        
        this.sql = new sql();
        this.util = new util();
        this.local = new local();
        this.auth = new auth();                        

        this.ioEvents();
    }    
    ioEvents()
    {
        this.socket.on('connect',() => 
        {
            this.emit('connect',()=>{})
        });
        this.socket.on('connect_error',(error) => 
        {
            this.emit('connect_error',()=>{})
        });
        this.socket.on('error', (error) => 
        {
            this.emit('connect_error',()=>{})
        });
        this.socket.on('disconnect', () => 
        {
            this.emit('disconnect',()=>{})
        });
    }
    //#region  "EVENT"
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
}
export class sql 
{
    constructor()
    {
        this.query = "";
        this.selectedDb = "";
    }
    try()
    {
        return new Promise(resolve => 
        {
            core.instance.socket.emit('terminal','-try',(pResult) => 
            {
                resolve(pResult);
            });
        });
    }
    createDb()
    {
        return new Promise(resolve => 
        {
            core.instance.socket.emit('terminal','-createDb ' + arguments[0],(pResult) => 
            {
                resolve(pResult);
            });
        });        
    }
    buffer()
    {
        return new Promise(async resolve => 
        {
            if(typeof arguments[0] == 'undefined')
            {
                resolve({result : {state:false,err: 'Buffer param undefined'}})
                return
            }

            core.instance.socket.emit('sql_buffer',arguments[0],(data) =>
            {
                resolve(data)
            });
        });
    }
    bufferRemove()
    {
        core.instance.socket.emit('sql_buffer_remove',arguments[0])
    }
    execute()
    {    
        return new Promise(async resolve => 
        {
            core.instance.emit('onExecuting');
            
            let TmpQuery = ""
            if(typeof arguments[0] == 'undefined')
            {
                TmpQuery = this.query
            }
            else
            {
                TmpQuery = arguments[0];
            }
            //LOCALDB İÇİN YAPILDI. ALI KEMAL KARACA 28.02.2022
            if(core.instance.offline)
            {
                core.instance.emit('onExecuted');
                resolve(await core.instance.local.execute(TmpQuery));                
            }
            else
            {
                //PARAMETRE UNDEFINED CONTROL
                if(typeof(TmpQuery.value) != 'undefined')
                {
                    for (let i = 0; i < TmpQuery.value.length; i++) 
                    {
                        if(typeof TmpQuery.value[i] == 'undefined')
                        {
                            core.instance.emit('onExecuted');
                            resolve({result : {state:false,err: "There was a problem with the parameter values!"}})
                        }
                    }
                }
                //SQL SINIFINDAKI DATABASE DEĞİŞKENİ BOŞTAN FARKLI İSE GÖNDERİLEN SORGUNUN DATABASE ADI BU DEĞİŞKENDEN VERİLİYOR.BU ŞEKİLDE UYGULAMA İÇİNDE BİRDEN FAZLA DB İLE ÇALIŞMAK MÜMKÜN.
                if(this.selectedDb != '')
                {
                    if(Array.isArray(TmpQuery) && TmpQuery.length > 0)
                    {
                        TmpQuery[0].db = this.selectedDb
                    }
                    else
                    {
                        TmpQuery.db = this.selectedDb
                    }
                }

                core.instance.socket.emit('sql',TmpQuery,(data) =>
                {
                    core.instance.emit('onExecuted');
                    if(typeof data.auth_err == 'undefined')
                    {
                        data.state = typeof data.result.err == 'undefined' ? true : false;
                        resolve(data); 
                    }
                    else
                    {
                        //BURADA HATA SAYFASINA YÖNLENDİRME ÇALIŞACAK. /edit r.k İNŞALLAH :)
                        console.log(data.auth_err);
                        resolve({result : {state:false,err: data.auth_err}});
                    }
                });
            }
        });
    }
}
export class local
{
    constructor()
    {
        this.db = null;  
        this.sqllite = null
        this.platform = ''
        
        if(core.instance.util.isElectron())
        {
            this.sqllite = global.require('sqlite3').verbose()
            this.platform = 'electron'
        }
        else if(typeof window != 'undefined' && typeof window.sqlitePlugin != 'undefined')
        {
            this.sqllite = window.sqlitePlugin
            this.platform = 'cordova'
        }
    }
    async init(pDb)
    {
        return new Promise(async resolve => 
        {         
            if(this.sqllite == null)
            {
                resolve(false);
                return
            }
            
            if(this.platform == 'electron')
            {
                this.db = new this.sqllite.Database('./resources/' + pDb.name + '.db', async(err) => 
                {
                    if (err) 
                    {
                        console.error(err.message);
                        resolve(false)
                        return
                    }
    
                    console.log('Connected to the database.');
    
                    this.db.serialize(() => 
                    {
                        for (let i = 0; i < pDb.tables.length; i++) 
                        {
                            this.db.run(pDb.tables[i].query)
                        }
                        resolve(true)
                    })
                })
            }
            else if(this.platform == 'cordova')
            {
                this.db = this.sqllite.openDatabase({ name: pDb.name + '.db', location: 'default' });
                this.db.transaction((tx) =>
                {
                    for (var i = 0; i < pDb.tables.length; i++) 
                    {
                        tx.executeSql(pDb.tables[i].query);
                    }
                },(err)=>
                {
                    console.error(err);
                    resolve(false)
                    return
                },()=>
                {
                    resolve(true)
                });
            }
        });
    }
    async insert(pQuery)
    {
        return new Promise(async resolve => 
        {
            if(this.sqllite == null)
            {
                resolve({result:{state:false,err:'No Sqlite'}});
                return
            }
            
            //BURAYA ONLINE SORGUSU İLE QUERY GÖNDERİLEBİLİR ONUN İÇİN LOCAL KONTROL VAR. (pQuery.local != 'undefined' ? pQuery.local : pQuery)
            let tmpQuery = typeof pQuery.local != 'undefined' ? pQuery.local : pQuery
            
            if(this.platform == 'electron')
            {
                this.db.run(tmpQuery.query, typeof tmpQuery.values == 'undefined' ? [] : tmpQuery.values, (err) => 
                {
                    if (err) 
                    {
                        console.log(err.message + ' ' + tmpQuery.query)
                        resolve({result:{state:false,err:err.message + ' ' + tmpQuery.query}});
                    }
                    resolve({result:{state:true}})
                });
            }
            else if(this.platform == 'cordova')
            {
                this.db.transaction((tx) =>
                {
                    tx.executeSql(tmpQuery.query, typeof tmpQuery.values == 'undefined' ? [] : tmpQuery.values, (tx, result) =>
                    {
                        resolve({ result: { state: true } });
                    }, (tx, err) =>
                    {
                        console.log(err + ' ' + tmpQuery.query)
                        resolve({result:{state:false,err:err + ' ' + tmpQuery.query}});
                    });
                });
            }
        });
    }
    async select(pQuery)
    {
        return new Promise(async resolve => 
        {
            if(this.sqllite == null)
            {
                resolve({result:{state:false,err:'No Sqlite'}});
                return
            }

            //BURAYA ONLINE SORGUSU İLE QUERY GÖNDERİLEBİLİR ONUN İÇİN LOCAL KONTROL VAR. (pQuery.local != 'undefined' ? pQuery.local : pQuery)
            let tmpQuery = typeof pQuery.local != 'undefined' ? pQuery.local : pQuery
            if(typeof tmpQuery.query == 'undefined')
            {
                resolve({result:{state:false,err:'Query is undefined'}});
                return
            }

            if(this.platform == 'electron')
            {
                //BAZEN SİSTEM OFFLİNE A GEÇMİŞ İSE ELECTRON UYGULAMASI HEMEN SQLLITE DATABASE OLUŞTURULAMIYOR BUNUN İÇİN 1SN LİK BEKLETİYORUZ.
                if(this.db == null)
                {
                    await core.instance.util.waitUntil(1000)
                }

                this.db.all(tmpQuery.query, typeof tmpQuery.values == 'undefined' ? [] : tmpQuery.values, (err, rows) => 
                {
                    if (err) 
                    {
                        console.log(err.message + ' ' + tmpQuery.query)
                        resolve({result:{state:false,err:err.message}});
                    }
                    resolve({result:{state:true,recordset:rows}})
                });
            }
            else if(this.platform == 'cordova')
            {
                //CORDOVA SQLLITE İÇİN EKLENDİ. GELEN BOOLEAN DEĞER ÇİFT TIRNAKLI (") GELİYOR BU DÜZELTİLİYOR.(SİK SİK İŞLER...)
                const convertBooleans = (obj) => 
                {
                    for (const key in obj) 
                    {
                        if (obj.hasOwnProperty(key)) 
                        {
                            if (obj[key] === "true" || obj[key] === "false") 
                            {
                                obj[key] = obj[key] === "true"; // "true" ise true, "false" ise false
                            }
                        }
                    }
                    return obj;
                };
                this.db.transaction((tx) =>
                {
                    tx.executeSql(tmpQuery.query, typeof tmpQuery.values == 'undefined' ? [] : tmpQuery.values, (tx, result) =>
                    {
                        let tmpArr = []
                        for (let i = 0; i < result.rows.length; i++) 
                        {
                            tmpArr.push(convertBooleans(result.rows.item(i)))
                        }
                        resolve({result:{state:true,recordset:tmpArr}})
                    }, (tx, err) =>
                    {
                        console.log(err + ' ' + tmpQuery.query)
                        resolve({result:{state:false,err:err + ' ' + tmpQuery.query}});
                    });
                });
            }
        });
    }
    async update(pQuery)
    {
        return new Promise(async resolve => 
        {
            if(this.sqllite == null)
            {
                resolve({result:{state:false,err:'No Sqlite'}});
                return
            }
            //BURAYA ONLINE SORGUSU İLE QUERY GÖNDERİLEBİLİR ONUN İÇİN LOCAL KONTROL VAR. (pQuery.local != 'undefined' ? pQuery.local : pQuery)
            let tmpQuery = typeof pQuery.local != 'undefined' ? pQuery.local : pQuery
            if(typeof tmpQuery.query == 'undefined')
            {
                resolve({result:{state:false,err:'Query is undefined'}});
                return
            }

            if(this.platform == 'electron')
            {
                this.db.run(tmpQuery.query, typeof tmpQuery.values == 'undefined' ? [] : tmpQuery.values, (err) => 
                {
                    if (err) 
                    {
                        console.log(err.message + ' ' + tmpQuery.query)
                        resolve({result:{state:false,err:err.message}});
                    }
                    resolve({result:{state:true}})
                });
            }
            else if(this.platform == 'cordova')
            {
                this.db.transaction((tx) =>
                {
                    tx.executeSql(tmpQuery.query, typeof tmpQuery.values == 'undefined' ? [] : tmpQuery.values, (tx, result) =>
                    {
                        resolve({ result: { state: true } });
                    }, (tx, err) =>
                    {
                        console.log(err + ' ' + tmpQuery.query)
                        resolve({result:{state:false,err:err + ' ' + tmpQuery.query}});
                    });
                });
            }
        });
    }
    async remove(pQuery)
    {
        return new Promise(async resolve => 
        {
            if(this.sqllite == null)
            {
                resolve({result:{state:false,err:'No Sqlite'}});
                return
            }
            //BURAYA ONLINE SORGUSU İLE QUERY GÖNDERİLEBİLİR ONUN İÇİN LOCAL KONTROL VAR. (pQuery.local != 'undefined' ? pQuery.local : pQuery)
            let tmpQuery = typeof pQuery.local != 'undefined' ? pQuery.local : pQuery
            if(typeof tmpQuery.query == 'undefined')
            {
                resolve({result:{state:false,err:'Query is undefined'}});
                return
            }
            
            if(this.platform == 'electron')
            {
                this.db.run(tmpQuery.query, typeof tmpQuery.values == 'undefined' ? [] : tmpQuery.values, (err) => 
                {
                    if (err) 
                    {
                        console.log(err.message + ' ' + tmpQuery.query)
                        resolve({result:{state:false,err:err.message}});
                    }
                    resolve({result:{state:true}})
                });
            }
            else if(this.platform == 'cordova')
            {
                this.db.transaction((tx) =>
                {
                    tx.executeSql(tmpQuery.query, typeof tmpQuery.values == 'undefined' ? [] : tmpQuery.values, (tx, result) =>
                    {
                        resolve({ result: { state: true } });
                    }, (tx, err) =>
                    {
                        console.log(err + ' ' + tmpQuery.query)
                        resolve({result:{state:false,err:err + ' ' + tmpQuery.query}});
                    });
                });
            }
        });
    }
    async execute(pQuery)
    {
        //DÜZENLEME - ALI KEMAL KARACA 23.08.2022
        return new Promise(async resolve => 
        {
            if(this.sqllite == null)
            {
                resolve({result:{state:false,err:'No Sqlite'}});
                return
            }
            
            if(typeof pQuery == 'undefined')
            {
                resolve({result:{state:false,err:'No Query'}});
                return
            }

            if(Array.isArray(pQuery))
            {
                let tmpQuery = pQuery
                for (let i = 0; i < tmpQuery.length; i++) 
                {
                    if(typeof tmpQuery[i].local != 'undefined')
                    {
                        let tmpLocs = Array.isArray(tmpQuery[i].local) ? tmpQuery[i].local : [tmpQuery[i].local]
                        
                        for (let x = 0; x < tmpLocs.length; x++) 
                        {
                            if(tmpLocs[x].type == 'insert')
                            {
                                await this.insert(tmpLocs[x])
                            }
                            else if(tmpLocs[x].type == 'update')
                            {
                                await this.update(tmpLocs[x])
                            }
                            if(tmpLocs[x].type == 'delete')
                            {
                                await this.remove(tmpLocs[x])
                            }
                        }
                    }
                }
                resolve({result:{state:true}})
            }
            else
            {
                let tmpQuery = typeof pQuery.local != 'undefined' ? pQuery.local : pQuery
                if(typeof tmpQuery.type == 'undefined')
                {
                    resolve({result:{state:false,err:'Type is undefined in query'}});
                    return
                }

                if(tmpQuery.type == 'select')
                {
                    resolve(await this.select(tmpQuery))
                }
                else if(tmpQuery.type == 'insert')
                {
                    resolve(await this.insert(tmpQuery))
                }
                else if(tmpQuery.type == 'update')
                {
                    resolve(await this.update(tmpQuery))
                }
                else if(tmpQuery.type == 'delete')
                {
                    resolve(await this.remove(tmpQuery))
                }
            }
        });        
    }
    clearTbl(pTblName)
    {
        return new Promise(async resolve => 
        {
            this.remove({query:"DELETE FROM " + pTblName})
            resolve()
        });
    }
}
export class auth 
{
    constructor()
    {
        this.data = null
    }
    login()
    {
        return new Promise(async resolve => 
        {
            let tmpData = []
            let tmpCode = ''
            let tmpPwd = ''
            let tmpSha = ''

            if(arguments.length == 2)
            {
                tmpData.push(arguments[0],arguments[1])
                tmpSha = arguments[0]
            }
            else if(arguments.length == 3)
            {
                tmpData.push(arguments[0],arguments[1],arguments[2])
                tmpCode = arguments[0]
                tmpPwd = btoa(arguments[1])
            }
            //LOCAL DB İÇİN YAPILDI
            if(core.instance.offline)
            {
                let tmpQuery = {query : '', values:[]}

                if (tmpSha != '')
                {
                    tmpQuery.query = 'SELECT * FROM USERS WHERE SHA = ?'
                    tmpQuery.values = [tmpSha]
                } 
                else if (tmpCode != '' && tmpPwd != '')
                {
                    tmpQuery.query = 'SELECT * FROM USERS WHERE CODE = ? AND PWD = ?'
                    tmpQuery.values = [tmpCode,tmpPwd]
                } 

                let tmpData = await core.instance.local.select(tmpQuery)

                if(tmpData.result.recordset.length > 0)
                {
                    this.data = tmpData.result.recordset[0]
                    if(typeof window != 'undefined')
                        window.sessionStorage.setItem('auth',tmpData.result.recordset[0].SHA)

                    resolve(true)
                    return
                }
                else 
                {
                    if(typeof window != 'undefined')
                        window.sessionStorage.removeItem('auth')
                    
                    this.data = null
                    resolve(false)
                    return
                }
            }
            /************************************************************************************ */
            //BİRDEN FAZLA DB İÇİN YAPILDI
            tmpData.push(core.instance.sql.selectedDb != '' ? core.instance.sql.selectedDb : '')

            core.instance.socket.emit('login',tmpData,async (data) =>
            {
                if(data.length > 0)
                {
                    this.data = data[0]
                    if(typeof window != 'undefined')
                    {
                        window.sessionStorage.setItem('auth',data[0].SHA)
                    }
                    resolve(true)
                }
                else 
                {
                    if(typeof window != 'undefined')
                        window.sessionStorage.removeItem('auth')
                    
                    this.data = null
                    resolve(false)
                }
            });
        })
    }
    getUserList()
    {
        return new Promise(async resolve => 
        {   
            //LOCAL DB İÇİN YAPILDI
            if(core.instance.offline)
            {
                let tmpData = await core.instance.local.select({query:"SELECT * FROM USERS"})
                if(tmpData.result.recordset.length > 0)
                {                   
                    resolve(tmpData.result.recordset)
                    return
                }
                else 
                {
                    resolve([])
                    return
                }
            }
            /************************************************************************************ */
            //BİRDEN FAZLA DB İÇİN YAPILDI
            let tmpParam = ""
            if(core.instance.sql.selectedDb != '')
            {
                tmpParam = core.instance.sql.selectedDb
            }

            core.instance.socket.emit('getUserList',tmpParam,async (data) =>
            {
                if(data.length > 0)
                {
                    resolve(data)
                }
                else 
                {
                    resolve([])
                }
            });
        })
    }
    refreshToken(pGuid)
    {
        core.instance.socket.emit('refreshToken',[pGuid])
    }
    logout()
    {
        window.sessionStorage.removeItem('auth');
    }
}
export class util
{
    constructor()
    {
        this.core = core.instance;
        this.logPath = ""
        this.logStatus = false
    }
    folder_list(pPath)
    {
        return new Promise(resolve => 
        {
            this.core.socket.emit('util',{cmd:'folder_list',prm: pPath},(data) =>
            {
                resolve(data)
            });
        });
    }
    readFile(pPath)
    {
        return new Promise(resolve => 
        {
            this.core.socket.emit('util',{cmd:'read_file',prm: pPath},(data) =>
            {
                resolve(data)
            });
        });
    }
    writeFile(pPath,pData)
    {
        return new Promise(resolve => 
        {
            this.core.socket.emit('util',{cmd:'write_file',prm: {path:pPath,data:pData}},(data) =>
            {
                resolve(data)
            });
        });
    }
    async waitUntil()
    {
        await new Promise(resolve => setTimeout(resolve, typeof arguments[0] == 'undefined' ? 0 : arguments[0]));
    }
    isElectron() 
    {
        // Renderer process
        if (typeof window !== 'undefined' && typeof window.process === 'object' && window.process.type === 'renderer') {
            return true;
        }
    
        // Main process
        if (typeof process !== 'undefined' && typeof process.versions === 'object' && !!process.versions.electron) {
            return true;
        }
    
        // Detect the user agent when the `nodeIntegration` option is set to true
        if (typeof navigator === 'object' && typeof navigator.userAgent === 'string' && navigator.userAgent.indexOf('Electron') >= 0) {
            return true;
        }
    
        return false;
    }
    isAndroid()
    {
        return /android/i.test(navigator.userAgent || navigator.vendor || window.opera)
    }
    writeLog(pMsg,pPath)
    {
        return new Promise(resolve => 
        {
            if(!this.logStatus)
            {
                resolve(false)
                return
            }
            
            let tmpPath = this.logPath
            if(typeof pPath != 'undefined')
            {
                tmpPath = pPath
            }

            if(tmpPath != "")
            {
                this.core.socket.emit('util',{cmd:'write_log',prm: {path:tmpPath,data:moment(new Date()).format("YYYY-MM-DD HH:mm:ss SSS") + " - " + pMsg + "\n"}},(data) =>
                {
                    resolve(data)
                });
            }
            else
            {
                resolve(false)
            }
        });
    }
    getVersion()
    {
        return new Promise(resolve => 
        {
            this.core.socket.emit('util',{cmd:'version'},(data) =>
            {
                resolve(data)
            });
        });
    }
}
export class dataset
{    
    constructor(pName)
    {
        this.listeners = Object();
        this.sql = core.instance.sql;    

        if(typeof pName == 'undefined')
            this.name = pName;
        else
            this.name = 'dataset'
        
        this.dts = [];
    }
    //#region  "EVENT"
    on(pEvt,pCallback) 
    {
        for(let i = 0;i < this.length; i++)
        {
            let tmpName = this.get(i).name;
            if(typeof this.listeners[tmpName] == 'undefined')
            {
                this.listeners[tmpName] = {}
            }

            if (!this.listeners[tmpName].hasOwnProperty(pEvt))
            {
                this.listeners[tmpName][pEvt] = Array();
                this.listeners[tmpName][pEvt].push(pCallback); 
            }
        }
    }
    emit(pEvt,pName,pParams)
    {
        let tmpListener = this.listeners[pName]
        
        if (typeof tmpListener != 'undefined' && pEvt in tmpListener) 
        {
            let callbacks = this.listeners[pName][pEvt];
            for (var x in callbacks)
            {
                callbacks[x](pName,pParams);
            }
        } 
    }
    //#endregion
    get length()
    {
        return this.dts.length;
    }
    get()
    {
        //PARAMETRE OLARAK INDEX YADA TABLO ADI.
        if(arguments.length > 0 && typeof arguments[0] == 'string')
        {
            return this.dts.find(x => x.name == arguments[0])
        }
        else if (arguments.length > 0 && typeof arguments[0] == 'number')
        {
            return this.dts[arguments[0]]
        }

        return
    }
    async add(pTable)
    {
        if(typeof pTable != 'undefined')
        {
            let tmpDt = null
            if(typeof pTable == 'string')
            {
                tmpDt = new datatable(pTable)
            }
            else if(typeof pTable == 'object')
            {
                tmpDt = pTable;
            }
            
            tmpDt.on('onNew',async (e)=>
            {
                await core.instance.util.waitUntil(0)
                this.emit('onNew',tmpDt.name,e)
            })
            tmpDt.on('onAddRow',async (e)=>
            {
                await core.instance.util.waitUntil(0)
                this.emit('onAddRow',tmpDt.name,e)
            })
            tmpDt.on('onEdit',async (e)=>
            {
                await core.instance.util.waitUntil(0)
                this.emit('onEdit',tmpDt.name,e)
            })
            tmpDt.on('onRefresh',async ()=>
            {
                await core.instance.util.waitUntil(0)
                this.emit('onRefresh',tmpDt.name)
            })
            tmpDt.on('onClear',async ()=>
            {
                await core.instance.util.waitUntil(0)
                this.emit('onClear',tmpDt.name)
            })
            tmpDt.on('onDelete',async ()=>
            {
                await core.instance.util.waitUntil(0)
                this.emit('onDelete',tmpDt.name)
            })
            
            this.remove(tmpDt.name)
            this.dts.push(tmpDt)

        }
    }
    update()
    {
        return new Promise(async resolve => 
        {
            let tmpQuerys = [];

            for (let i = 0; i < this.length; i++) 
            {
                let tmp = this.get(i).toCommands();
                tmp.forEach(e => 
                {
                    tmpQuerys.push(e)    
                });
            }
            
            let tmpResult = await this.sql.execute(tmpQuerys)
            
            if(typeof tmpResult.result.err == 'undefined')
            {             
                tmpQuerys.forEach(x =>
                {
                    if(x.rowData.stat == 'editing' || x.rowData.stat == 'newing')
                    {
                        Object.setPrototypeOf(x.rowData,{stat:''})
                    }
                })        
                resolve(0)
            }
            else
            {
                console.log(tmpResult.result.err)
                tmpQuerys.forEach(x =>
                {
                    if(x.rowData.stat == 'newing')
                    {
                        Object.setPrototypeOf(x.rowData,{stat:'new'})
                    }
                    else if(x.rowData.stat == 'editing')
                    {
                        Object.setPrototypeOf(x.rowData,{stat:'edit'})
                    }
                })  
                resolve(1)
            } 
        });
    }
    async delete()
    {
        for (let i = 0; i < this.length; i++) 
        {
            await this.get(i).delete()
        }
    }
    remove(pName)
    {
        
        //EĞER PARAMETRE BOŞ GÖNDERİLİRSE TÜM DATASET TEMİZLENİYOR.
        if(typeof pName != 'undefined')
        {
            for (let i = 0; i < this.dts.length; i++) 
            {
                if(this.dts[i].name == pName)
                {
                    this.listeners[pName] = {}
                    this.dts.splice(i,1);
                }
            }
        }
        else
        {
            this.dts.splice(0,this.dts.length);
        }
    }
}
export class datatable
{    
    constructor()
    {        
        this.selectCmd;
        this.insertCmd;
        this.updateCmd;
        this.deleteCmd;

        this._deleteList = [];
        this._groupList = [];
        //EDİT SIRASINDA DEĞİŞTİĞİNİ ALGILAMAMASINI İSTEDİĞİN KOLON LİSTESİ.
        this.noColumnEdit = []
        this.listeners = Object();
        this.sql = core.instance.sql;        

        if(arguments.length == 1 && typeof arguments[0] == 'string')
        {
            this.name = arguments[0];
        }
        else if(arguments.length == 1 && arguments[0] instanceof sql)
        {
            this.sql = arguments[0];
        }
        else if(arguments.length == 2 && typeof arguments[0] == 'string' && arguments[1] instanceof sql)
        {
            this.name = arguments[0];
            this.sql = arguments[1];
        }
        else
        {
            this.name = '';
        }
    }  
    static uuidv4() 
    {
        return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
          (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        ).toString().toUpperCase();
    }   
    //#region  "EVENT"
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
    push(pItem,pIsNew)
    {   
        if(!isProxy(pItem))
        {
            pItem = new Proxy(pItem, 
            {
                get: function(target, prop, receiver) 
                {
                    return target[prop];
                },
                set: (function(target, prop, receiver) 
                {            
                    if(target[prop] != receiver)
                    {
                        target[prop] = receiver
    
                        if(typeof this.noColumnEdit.find(x => x == prop) == 'undefined')
                        {
                            this.emit('onEdit',{data:{[prop]:receiver},rowIndex:this.findIndex(x => x === pItem),rowData:pItem});
                            
                            //EĞER EDİT EDİLDİĞİNDE STATE DURUMUNUN DEĞİŞMEMESİNİ İSTEDİĞİN KOLON VARSA BURDA KONTROL EDİLİYOR
                            if(target.stat != 'new')
                            {
                                //EDİT EDİLMİŞ KOLON VARSA BURDA editColumn DEĞİŞKENİNE SET EDİLİYOR.
                                let tmpColumn = []
                                if(typeof target.editColumn != 'undefined')
                                {
                                    tmpColumn = [...target.editColumn];
                                }
                                tmpColumn.push(prop)
                                Object.setPrototypeOf(target,{stat:'edit',editColumn:tmpColumn})   
                            }
                        }
                    }
                    //return target[prop];
                    return true;
                }).bind(this)
            });
        }
        
        if(typeof pIsNew == 'undefined' || pIsNew)
        {
            Object.setPrototypeOf(pItem,{stat:'new'})
            this.emit('onNew',pItem)
        }
        this.emit('onAddRow',pItem);
        super.push(pItem)
    }
    getIndexByKey(pKey)
    {
        let tmpArr = [];
        for (let i = 0; i < this.length; i++) 
        {
            tmpArr.push(Object.assign({}, this[i]))
        }
        for (let i = 0; i < tmpArr.length; i++) 
        {
            if(JSON.stringify(tmpArr[i]) == JSON.stringify(Object.assign({}, pKey)))
            {
                return i
            }
        }
    }
    removeAt()
    {
        let tmpIndex = -1;
        if(arguments.length > 0 && typeof arguments[0] == 'object')
        {
            tmpIndex = this.getIndexByKey(arguments[0]);
        }
        else if(arguments.length > 0 && typeof arguments[0] == 'number')
        {
            tmpIndex = arguments[0]
        }
        
        if(tmpIndex > -1)
        {
            this._deleteList.push(this[tmpIndex]); 
            this.splice(tmpIndex,1);
            this.emit('onDelete');
        }
    }
    removeAll()
    {
        this.forEach(x =>
        {
            this._deleteList.push(x);
        })
        this.splice(0,this.length); 
        this.emit('onDeleteAll')
    }
    clear()
    {        
        this.splice(0,this.length);
        this._deleteList.splice(0,this._deleteList.length);
        this.emit('onClear')
    }
    refresh()
    {
        return new Promise(async resolve => 
        {
            if(typeof this.selectCmd != 'undefined')
            {
                let tmpQuery = JSON.parse(JSON.stringify(this.selectCmd))
                //LOCAL DB İÇİN YAPILDI. WHERE ŞARTINDA {index} ŞEKLİNDE DEĞER ATAMASI... ALI KEMAL KARACA - 22.08.2022 
                if(typeof tmpQuery.local != 'undefined' && typeof tmpQuery.local.values != 'undefined' && typeof tmpQuery.param != 'undefined')
                {
                    if(tmpQuery.local.values.length > 0 && typeof tmpQuery.local.values[0] == 'object')
                    {
                        let tmpValArr = []

                        Object.values(tmpQuery.local.values[0]).map(tmpItem => 
                        {
                            Object.values(tmpItem).map(tmpItem1 =>
                            {               
                                for (let i = 0; i < tmpQuery.param.length; i++) 
                                {
                                    if(tmpQuery.param[i].split(':').length > 0 && tmpQuery.param[i].split(':')[0] == tmpItem1)
                                    {
                                        tmpValArr.push(tmpQuery.value[i])
                                    }
                                }                 
                            })
                        })
                        tmpQuery.local.values = tmpValArr
                    }                                                                                
                }

                let TmpData = await this.sql.execute(tmpQuery)
                
                if(typeof TmpData.result.err == 'undefined') 
                {
                    if(typeof TmpData.result.recordset != 'undefined')
                    {
                        this.clear();
                        for (let i = 0; i < TmpData.result.recordset.length; i++) 
                        {                    
                            this.push(TmpData.result.recordset[i],false)   
                        }                                            
                        this.emit('onRefresh')
                    }
                }
                else
                {
                    console.log(tmpQuery.local)
                    console.log(TmpData.result.err)
                }                
            }
            resolve();
        });
    }
    toCommands()
    {
        let tmpStat = ['new','edit']
        let tmpQueryList = [];

        if(typeof arguments[0] != 'undefined' && arguments[0] != '')
        {
            tmpStat = arguments[0].split(',')
        }

        for (let i = 0; i < this.length; i++) 
        {
            if(typeof this[i].stat != 'undefined' && typeof tmpStat.find(x => x == this[i].stat))
            {
                let tmpQuery = undefined;

                if(this[i].stat == 'new')
                {
                    tmpQuery = JSON.parse(JSON.stringify(this.insertCmd))
                    Object.setPrototypeOf(this[i],{stat:'newing'})                    
                    //LOCALDB İÇİN YAPILDI. ALI KEMAL KARACA 28.02.2022
                    if(core.instance.offline && typeof tmpQuery.local != 'undefined' && typeof tmpQuery.dataprm != 'undefined' && typeof tmpQuery.local.values != 'undefined' && tmpQuery.local.values.length > 0)
                    {                        
                        if(typeof tmpQuery.local.values[0] == 'object')
                        {
                            let tmpValArr = []
                            Object.values(tmpQuery.local.values[0]).map(tmpMap => 
                            {
                                if(typeof tmpMap.map != 'undefined')
                                {
                                    tmpValArr.push(this[i][tmpMap.map])
                                }
                                else
                                {
                                    tmpValArr.push(tmpMap)
                                }
                            })
                            tmpQuery.local.values = tmpValArr
                        }
                    }
                }
                else if(this[i].stat == 'edit')
                {
                    tmpQuery = JSON.parse(JSON.stringify(this.updateCmd))
                    Object.setPrototypeOf(this[i],{stat:'editing'})
                    //LOCALDB İÇİN YAPILDI. ALI KEMAL KARACA 28.02.2022
                    if(core.instance.offline && typeof tmpQuery.local != 'undefined' && typeof tmpQuery.local.values != 'undefined')
                    {
                        let tmpValArr = []
                        Object.values(tmpQuery.local.values[0]).map(tmpMap => 
                        {
                            if(typeof tmpMap.map != 'undefined')
                            {
                                tmpValArr.push(this[i][tmpMap.map])
                            }
                            else
                            {
                                tmpValArr.push(tmpMap)
                            }
                        })
                        tmpQuery.local.values = tmpValArr
                    }
                }
            
                if(typeof tmpQuery != 'undefined')
                {
                    tmpQuery.value = [];
                } 
                
                if(typeof tmpQuery != 'undefined')
                {
                    if(typeof tmpQuery.param == 'undefined')
                    {
                        continue;
                    }
                    for (let m = 0; m < tmpQuery.param.length; m++) 
                    {         
                        if(typeof tmpQuery.dataprm == 'undefined')
                        {
                            tmpQuery.value.push(this[i][tmpQuery.param[m].split(':')[0]]);
                        }
                        else
                        {
                            tmpQuery.value.push(this[i][tmpQuery.dataprm[m]]);
                        }                                                       
                    }
                }
                if(typeof tmpQuery != 'undefined' && typeof tmpQuery.value != 'undefined' && tmpQuery.value.length > 0)
                {       
                    tmpQuery.rowData = this[i]
                    tmpQueryList.push(tmpQuery)
                }
            }
        }

        return tmpQueryList;
    }
    update()
    {
        return new Promise(async resolve => 
        {
            let tmpQuerys = undefined;

            if(typeof arguments[0] == 'undefined' || arguments[0] == '')
            {
                tmpQuerys = this.toCommands();
            }
            else
            {
                tmpQuerys = this.toCommands(arguments[0]);
            }            
            
            let tmpResult = await this.sql.execute(tmpQuerys)
            if(typeof tmpResult.result.err == 'undefined')
            {     
                tmpQuerys.forEach(x =>
                {
                    if(x.rowData.stat == 'editing' || x.rowData.stat == 'newing')
                    {
                        Object.setPrototypeOf(x.rowData,{stat:''})
                    }
                })
                resolve(0)
            }
            else
            {
                console.log(tmpResult.result.err)
                tmpQuerys.forEach(x =>
                {
                    if(x.rowData.stat == 'newing')
                    {
                        Object.setPrototypeOf(x.rowData,{stat:'new'})
                    }
                    else if(x.rowData.stat == 'editing')
                    {
                        Object.setPrototypeOf(x.rowData,{stat:'edit'})
                    }
                })
                resolve(1)
            } 
        });
    }
    delete()
    {
        return new Promise(async resolve => 
        {
            let tmpQueryList = [];

            for (let i = 0; i < this._deleteList.length; i++) 
            {
                if(typeof this.deleteCmd != 'undefined')
                {                    
                    let tmpQuery = undefined;
                    tmpQuery = JSON.parse(JSON.stringify(this.deleteCmd)) //{...this.deleteCmd}
                    
                    //LOCALDB İÇİN YAPILDI. ALI KEMAL KARACA 28.02.2022 - DÜZENLEME : 23.08.2022
                    if(typeof tmpQuery.local != 'undefined')
                    {
                        let tmpLocs = Array.isArray(tmpQuery.local) ? tmpQuery.local : [tmpQuery.local]
                        tmpLocs.forEach(pItem => 
                        {
                            if(pItem.type == 'update')
                            {
                                if(typeof pItem.values != 'undefined')
                                {
                                    let tmpValArr = []
                                    Object.values(pItem.values[0]).map(tmpMap => 
                                    {
                                        if(typeof tmpMap.map != 'undefined')
                                        {
                                            tmpValArr.push(this._deleteList[i][tmpMap.map])
                                        }
                                        else
                                        {
                                            tmpValArr.push(tmpMap)
                                        }
                                    })
                                    pItem.values = tmpValArr
                                }
                            }
                            if(pItem.type == 'delete')
                            {
                                if(typeof pItem.values != 'undefined')
                                {
                                    let tmpValArr = []
                                    Object.values(pItem.values[0]).map(tmpMap => 
                                    {
                                        if(typeof tmpMap.map != 'undefined')
                                        {
                                            tmpValArr.push(this._deleteList[i][tmpMap.map])
                                        }
                                        else
                                        {
                                            tmpValArr.push(tmpMap)
                                        }
                                    })
                                    pItem.values = tmpValArr
                                }
                            }
                        });
                    }
                    tmpQuery.value = [];

                    if(typeof tmpQuery.param == 'undefined')
                    {
                        continue;
                    }

                    for (let m = 0; m < tmpQuery.param.length; m++) 
                    {
                        if(typeof tmpQuery.dataprm == 'undefined')
                        {
                            tmpQuery.value.push(this._deleteList[i][tmpQuery.param[m].split(':')[0]]);
                        }
                        else
                        {
                            tmpQuery.value.push(this._deleteList[i][tmpQuery.dataprm[m]]);
                        }
                    }
                    tmpQueryList.push(tmpQuery)                                        
                }
            }
            
            if(tmpQueryList.length > 0)
            {
                let tmpDeleteData = await this.sql.execute(tmpQueryList)

                if(typeof tmpDeleteData.result.err == 'undefined')
                {
                    this._deleteList.splice(0,this._deleteList.length);
                    resolve(0)
                }
                else
                {
                    console.log(tmpDeleteData.result.err)
                    resolve(1)
                }   
            }            
            resolve(1);
        });
    }
    toArray()
    {        
        return this.slice();
    }
    toColumnArr(pColumn)
    {
        let tmpArr = []
        this.toArray().forEach(e =>
        {
            tmpArr.push(e[pColumn])
        })
        return tmpArr
    }
    import(pData)
    {
        for (let i = 0; i < pData.length; i++) 
        {
            this.push(pData[i],false);
        }
    }
    columns()
    {
        let tmpObj = {}
        if(this.length > 0)
        {
            for (let i = 0; i < Object.keys(this[0]).length; i++) 
            {
                let tmp = new Object(); 
                tmp[Object.keys(this[0])[i]] = {notNull:false};
                Object.assign(tmpObj,tmp)
            }
        }
        return tmpObj;
    }   
    groupBy(pKey)
    {
        if(typeof pKey == 'string')
        {
            pKey = pKey.split(',')
        }

        let helper = {};
        let tmpGrpData = this.reduce(function(r,o)
        {
            let key = '';
            for (let i = 0; i < pKey.length; i++) 
            {
                if(i < pKey.length - 1)
                {
                    key += o[pKey[i]] + '-'
                }
                else
                {
                    key += o[pKey[i]]
                }                
            }

            if(!helper[key]) 
            {
                helper[key] = Object.assign({}, o);
                r.push(helper[key]);                
            }
            else 
            {
                helper[key] = o;
            }
            return r;
        },[])
        
        //let tmpDt = new datatable();
        let tmpDt = Object.assign(Object.create(Object.getPrototypeOf(this)), this)
        tmpDt.splice(0,tmpDt.length);
        //tmpDt.clear()
        tmpDt.import(tmpGrpData)
        return tmpDt
    }
    where()
    {
        if(arguments.length > 0)
        {
            let tmpData = this.toArray();

            if(Object.keys(arguments[0]).length > 0)
            {
                let tmpOp = '='
                let tmpKey = Object.keys(arguments[0])[0]
                let tmpValue = Object.values(arguments[0])[0]

                if(typeof tmpValue === 'object')
                {
                    tmpOp = Object.keys(tmpValue)[0]
                    tmpValue = Object.values(tmpValue)[0]
                }

                if(tmpOp == '=')
                {
                    tmpData = tmpData.filter(x => x[tmpKey] === tmpValue)
                }
                else if(tmpOp == '<>')
                {
                    tmpData = tmpData.filter(x => x[tmpKey] !== tmpValue)
                }
                else if(tmpOp == '>')
                {
                    tmpData = tmpData.filter(x => x[tmpKey] > tmpValue)
                }
                else if(tmpOp == '<')
                {
                    tmpData = tmpData.filter(x => x[tmpKey] < tmpValue)
                }
                else if(tmpOp == 'IN' || tmpOp == 'in')
                {
                    let tmpArr = []
                    tmpValue.forEach(e => 
                    {
                        tmpData.filter(x => x[tmpKey] == e).forEach(m => 
                        {
                            tmpArr.push(m)
                        });
                    });
                    tmpData = tmpArr
                }
                else if(tmpOp == 'NIN' || tmpOp == 'nin')
                {
                    let tmpArr = []
                    tmpData.forEach(e => 
                    {
                        if(tmpValue.filter(x => x == e[tmpKey]).length == 0)
                        {
                            tmpArr.push(e)
                        }
                    });
                    tmpData = tmpArr
                }
                else if (tmpOp == 'LIKE' || tmpOp == 'like') 
                {
                    const regex = new RegExp(tmpValue);
                    tmpData = tmpData.filter((x) => 
                    {
                        return regex.test(x[tmpKey])
                    });
                }
            }
            
            let tmpDt = new datatable();
            tmpDt.import(tmpData);

            tmpDt.selectCmd = this.selectCmd;
            tmpDt.insertCmd = this.insertCmd;
            tmpDt.updateCmd = this.updateCmd;
            tmpDt.deleteCmd = this.deleteCmd;
            tmpDt._deleteList = [...this._deleteList];
            tmpDt._groupList = [...this._groupList];
            tmpDt.noColumnEdit = [...this.noColumnEdit];
            tmpDt.listeners = Object.assign({}, this.listeners);
            tmpDt.sql = this.sql;
            tmpDt.name = this.name
           
            return tmpDt;
        }
    }
    sum()
    {
        let tmpVal = 0;
        if(arguments.length > 0)
        {            
            tmpVal = this.reduce((a,b) =>
            {
                return {[arguments[0]] : Number(a[arguments[0]]) + Number(b[arguments[0]])}
            },{[arguments[0]]:0})[arguments[0]]

            if(arguments.length == 2)
            {
                tmpVal = Number(tmpVal).round(arguments[1]);
                tmpVal = tmpVal.toFixed(arguments[1])
            }
        }

        return tmpVal;
    }
    max()
    {
        let tmpVal = 0;
        if(arguments.length > 0)
        {       
            if(this.length > 0)
            {
                tmpVal = this.reduce((a,b) =>(b[arguments[0]] > a[arguments[0]] ? b : a))[arguments[0]]
            }     
            return tmpVal;
        }
    }
    min()
    {
        let tmpVal = 0;
        if(arguments.length > 0)
        {       
            if(this.length > 0)
            {
                tmpVal = this.reduce((a,b) =>(b[arguments[0]] < a[arguments[0]] ? b : a))[arguments[0]]
            }     
            return tmpVal;
        }
    }
    orderBy(pKey,pSort)
    {
        if(typeof pKey != 'undefined')
        {
            if(typeof pSort != 'undefined' && pSort == 'desc')
            {
                return this.sort((a, b) => 
                {
                    if(typeof b[pKey] == 'number')
                    {
                        return b[pKey] - a[pKey]
                    }
                    else if(typeof b[pKey] == 'string')
                    {
                        return b[pKey].localeCompare(a[pKey])
                    }
                })
            }
            else
            {
                return this.sort((a, b) => 
                {
                    if(typeof a[pKey] == 'number')
                    {
                        return a[pKey] - b[pKey]
                    }
                    else if(typeof a[pKey] == 'string')
                    {
                        return a[pKey].localeCompare(b[pKey])
                    }
                })
            }
        }
        return this
    }
}
export class param extends datatable
{
    constructor()
    {
        super()  
        this.meta = null;

        if(arguments.length > 0)
        {            
            this.meta = arguments[0]
        }

    }
    add()
    {
        if(arguments.length == 1 && typeof arguments[0] == 'object')
        {
            if(this.filter({ID:arguments[0].ID,USERS:arguments[0].USERS}).length > 0)
            {
                this.filter({ID:arguments[0].ID,USERS:arguments[0].USERS}).setValue(arguments[0].VALUE)
            }
            else
            {
                let tmpItem =
                {
                    TYPE:typeof arguments[0].TYPE == 'undefined' ? -1 : arguments[0].TYPE,
                    ID:typeof arguments[0].ID == 'undefined' ? '' : arguments[0].ID,
                    VALUE:typeof arguments[0].VALUE == 'undefined' ? '' : typeof arguments[0].VALUE == 'object' ? JSON.stringify(arguments[0].VALUE) : arguments[0].VALUE,
                    SPECIAL:typeof arguments[0].SPECIAL == 'undefined' ? '' : arguments[0].SPECIAL,
                    USERS:typeof arguments[0].USERS == 'undefined' ? '' : arguments[0].USERS,
                    PAGE:typeof arguments[0].PAGE == 'undefined' ? '' : arguments[0].PAGE,
                    ELEMENT:typeof arguments[0].ELEMENT == 'undefined' ? '' : arguments[0].ELEMENT,
                    APP:typeof arguments[0].APP == 'undefined' ? '' : arguments[0].APP,
                }
                this.push(tmpItem)    
            }
        }
    }
    load()
    {
        return new Promise(async resolve => 
        {
            if(arguments.length == 1 && typeof arguments[0] == 'object')
            {
                this.selectCmd = 
                {
                    query : "SELECT * FROM PARAM WHERE ((APP = @APP) OR (@APP = '')) AND ((USERS = @USERS) OR (@USERS = '')) AND ((ID = @ID) OR (@ID = '')) " ,
                    param : ['APP:string|50','USERS:string|50','ID:string|50'],
                    value : [
                                typeof arguments[0].APP == 'undefined' ? '' : arguments[0].APP,
                                typeof arguments[0].USERS == 'undefined' ? '' : arguments[0].USERS,
                                typeof arguments[0].ID == 'undefined' ? '' : arguments[0].ID,
                            ],
                    local : 
                    {
                        type : "select",
                        query : "SELECT * FROM PARAM WHERE ((APP = ?) OR (? = '')) AND ((USERS = ?) OR (? = '')) AND ((ID = ?) OR (? = ''));",
                        values : 
                        [
                            typeof arguments[0].APP == 'undefined' ? '' : arguments[0].APP,
                            typeof arguments[0].APP == 'undefined' ? '' : arguments[0].APP,
                            typeof arguments[0].USERS == 'undefined' ? '' : arguments[0].USERS,
                            typeof arguments[0].USERS == 'undefined' ? '' : arguments[0].USERS,
                            typeof arguments[0].ID == 'undefined' ? '' : arguments[0].ID,
                            typeof arguments[0].ID == 'undefined' ? '' : arguments[0].ID,
                        ],        
                    } 
                } 
                await this.refresh();
            }
            resolve(this);
        });
    }
    save()
    {
        return new Promise(async resolve => 
        {
            this.insertCmd = 
            {
                query : "EXEC [dbo].[PRD_PARAM_INSERT] " + 
                        "@TYPE = @PTYPE, " + 
                        "@ID = @PID, " + 
                        "@VALUE = @PVALUE, " + 
                        "@SPECIAL = @PSPECIAL, " + 
                        "@USERS = @PUSERS, " + 
                        "@PAGE = @PPAGE, " + 
                        "@ELEMENT = @PELEMENT, " + 
                        "@APP = @PAPP ", 
                param : ['PTYPE:int','PID:string|100','PVALUE:string|max','PSPECIAL:string|150','PUSERS:string|25','PPAGE:string|25','PELEMENT:string|250','PAPP:string|50'],
                dataprm : ['TYPE','ID','VALUE','SPECIAL','USERS','PAGE','ELEMENT','APP']
            } 

            this.updateCmd = 
            {
                query : "EXEC [dbo].[PRD_PARAM_UPDATE] " + 
                        "@GUID = @PGUID, " + 
                        "@TYPE = @PTYPE, " + 
                        "@ID = @PID, " + 
                        "@VALUE = @PVALUE, " + 
                        "@SPECIAL = @PSPECIAL, " + 
                        "@USERS = @PUSERS, " + 
                        "@PAGE = @PPAGE, " + 
                        "@ELEMENT = @PELEMENT, " + 
                        "@APP = @PAPP ", 
                param : ['PGUID:string|50','PTYPE:int','PID:string|100','PVALUE:string|max','PSPECIAL:string|150','PUSERS:string|25','PPAGE:string|25','PELEMENT:string|250','PAPP:string|50'],
                dataprm : ['GUID','TYPE','ID','VALUE','SPECIAL','USERS','PAGE','ELEMENT','APP']
            } 
            resolve(await this.update());
        });
    }
    filter()
    {
        //BURAYA KESİN BAKILACAK
        if(arguments.length == 1 && typeof arguments[0] == 'object')
        {
            let tmpData = this.toArray();
            let tmpMeta = [...this.meta];
            //PARAMETRENİN META DATASI FİLİTRELENİYOR.
            if(this.meta != null && this.meta.length > 0)
            {
                for (let i = 0; i < Object.keys(arguments[0]).length; i++) 
                {
                    let tmpKey = Object.keys(arguments[0])[i]
                    let tmpValue = Object.values(arguments[0])[i]

                    if(tmpKey != "USERS")
                    {
                        tmpMeta = tmpMeta.filter(x => x[tmpKey] === tmpValue)
                    }
                }
            }
            //DATA FİLİTRELENİYOR.
            if(this.length > 0)
            {
                for (let i = 0; i < Object.keys(arguments[0]).length; i++) 
                {
                    let tmpKey = Object.keys(arguments[0])[i]
                    let tmpValue = Object.values(arguments[0])[i]
                    tmpData = tmpData.filter(x => x[tmpKey] === tmpValue)
                }                
            }

            let tmpPrm = new param(tmpMeta)
            tmpPrm.import(tmpData)
            return tmpPrm;
        }
        return this;
    }
    getValue()
    {                     
        // DB İÇERİSİNDEKİ PARAMETRE DEĞERİ GERİ DÖNDÜRÜLÜYOR.
        if(this.length > 0)
        {
            // EĞER PARAMETRE OLARAK HİÇBİRŞEY GELMEDİYSE SIFIRINCI SATIRI.
            if(arguments.length == 0)
            {
               // return JSON.parse(JSON.stringify(this[0].VALUE))
               try
               {
                    return JSON.parse(this[0].VALUE)
               }
               catch(ex)
               {
                    return this[0].VALUE
               }
               
            }
            // EĞER PARAMETRE GELMİŞ İSE VE GELEN VERİ NUMBER İSE VERİLEN SATIR I DÖNDÜR.
            else if(arguments.length == 1 && typeof arguments[0] == 'number')
            {
                try 
                {
                  //  return JSON.parse(JSON.stringify(this[arguments[0]].VALUE))
                  return JSON.parse(this[arguments[0]].VALUE)

                } catch (error) 
                {
                    console.log('error param.toValue() : ' + error)
                }
            }                    
        }
        // DB İÇERİSİNDE KAYIT YOKSA META İÇERİSİNDEKİ DEĞER DÖNDÜRÜLÜYOR.
        else if(this.length == 0 && this.meta != null && this.meta.length > 0 && typeof this.meta[0].VALUE != 'undefined')
        {               
            return JSON.parse(JSON.stringify(this.meta[0].VALUE))
        }

        return undefined;
    }
    setValue()
    {
        // BU FONKSİYON 1 VEYA 2 PARAMETRE ALABİLİR. BİR PARAMETRE ALIRSA SIFIRINCI SATIRA PARAMETRE DEĞERİ SET EDİLİR. İKİ PARAMETRE ALIRSA BİRİNCİ PARAMETRE SATIR İKİNCİ PARAMETRE SET EDİLECEK DEĞERDİR.
        if(this.length > 0)
        {
            // EĞER PARAMETRE OLARAK HİÇBİRŞEY GELMEDİYSE SIFIRINCI SATIRA SET EDİLİYOR
            if(arguments.length == 1)
            {
                this[0].VALUE = typeof arguments[0] == 'object' ? JSON.stringify(arguments[0]) : arguments[0];
            }
            // EĞER PARAMETRE GELMİŞ İSE VE GELEN VERİ NUMBER İSE VERİLEN SATIR I DÖNDÜR.
            else if(arguments.length == 2 && typeof arguments[0] == 'number')
            {
                try 
                {
                    this[arguments[0]].VALUE = typeof arguments[0] == 'object' ? JSON.stringify(arguments[0]) : arguments[0];
                } catch (error) 
                {
                    console.log('error param.toValue() : ' + error)
                }
            }
        }
    }

}
export class access extends datatable
{
    constructor()
    {
        super()

        this.meta = null;

        if(arguments.length > 0)
        {
            this.meta = arguments[0]
        }
    }
    add()
    {
        if(arguments.length == 1 && typeof arguments[0] == 'object')
        {
            let tmpItem =
            {   
                ID:typeof arguments[0].ID == 'undefined' ? '' : arguments[0].ID,             
                VALUE:typeof arguments[0].VALUE == 'undefined' ? '' : JSON.stringify(arguments[0].VALUE),
                SPECIAL:typeof arguments[0].SPECIAL == 'undefined' ? '' : arguments[0].SPECIAL,
                USERS:typeof arguments[0].USERS == 'undefined' ? '' : arguments[0].USERS,
                PAGE:typeof arguments[0].PAGE == 'undefined' ? '' : arguments[0].PAGE,
                ELEMENT:typeof arguments[0].ELEMENT == 'undefined' ? '' : arguments[0].ELEMENT,
                APP:typeof arguments[0].APP == 'undefined' ? '' : arguments[0].APP,
            }
            this.push(tmpItem)
        }
    }
    load()
    {
        return new Promise(async resolve => 
        {
            if(arguments.length == 1 && typeof arguments[0] == 'object')
            {
                this.selectCmd = 
                {
                    query : "SELECT * FROM ACCESS WHERE ((APP = @APP) OR (@APP = ''))" ,
                    param : ['APP:string|50'],
                    value : [typeof arguments[0].APP == 'undefined' ? '' : arguments[0].APP],
                    local : 
                    {
                        type : "select",
                        query : "SELECT * FROM ACCESS WHERE ((APP = ?) OR (? = ''));",
                        values : 
                        [
                            typeof arguments[0].APP == 'undefined' ? '' : arguments[0].APP,
                            typeof arguments[0].APP == 'undefined' ? '' : arguments[0].APP,
                        ],        
                    } 
                } 
                await this.refresh();
            }
            resolve(this);
        });
    }
    save()
    {
        return new Promise(async resolve => 
        {
            this.insertCmd = 
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
                dataprm : ['ID','VALUE','SPECIAL','USERS','PAGE','ELEMENT','APP']
            } 
            this.updateCmd = 
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
                dataprm : ['GUID','ID','VALUE','SPECIAL','USERS','PAGE','ELEMENT','APP']
            } 
            await this.update(); 
            resolve();
        });
    }
    filter()
    {
        if(arguments.length == 1 && typeof arguments[0] == 'object')
        {
            let tmpData = this.toArray();
            let tmpMeta = [...this.meta];
            //PARAMETRENİN META DATASI FİLİTRELENİYOR.
            if(this.meta != null && this.meta.length > 0)
            {
                for (let i = 0; i < Object.keys(arguments[0]).length; i++) 
                {
                    let tmpKey = Object.keys(arguments[0])[i]
                    let tmpValue = Object.values(arguments[0])[i]

                    if(tmpKey != "USERS")
                    {
                        tmpMeta = tmpMeta.filter(x => x[tmpKey] === tmpValue)
                    }

                }
            }
            //DATA FİLİTRELENİYOR.
            if(this.length > 0)
            {
                for (let i = 0; i < Object.keys(arguments[0]).length; i++) 
                {
                    let tmpKey = Object.keys(arguments[0])[i]
                    let tmpValue = Object.values(arguments[0])[i]
                    tmpData = tmpData.filter(x => x[tmpKey] === tmpValue)

                }                
            }
            //META DATANIN İÇERİSİNE USER DEĞERİ EKLENİYOR.BU DATAYI SET EDERKEN İŞİMİZE YARAYACAK.
            if(typeof Object.keys(arguments[0]).filter(key => key.includes('USERS')) != 'undefined')
            {
                for (let i = 0; i < tmpMeta.length; i++) 
                {
                    tmpMeta[i].USERS = arguments[0].USERS
                }
            }
            let tmpAcs = new access(tmpMeta)
            tmpAcs.import(tmpData)
            return tmpAcs;
        }
        return this;
    }
    getValue()
    {
        // DB İÇERİSİNDEKİ PARAMETRE DEĞERİ GERİ DÖNDÜRÜLÜYOR.
        if(this.length > 0)
        {
            // EĞER PARAMETRE OLARAK HİÇBİRŞEY GELMEDİYSE SIFIRINCI SATIRI.
            if(arguments.length == 0)
            {
                return JSON.parse(JSON.parse(JSON.stringify(this[0].VALUE)))
            }
            // EĞER PARAMETRE GELMİŞ İSE VE GELEN VERİ NUMBER İSE VERİLEN SATIR I DÖNDÜR.
            else if(arguments.length == 1 && typeof arguments[0] == 'number')
            {
                try 
                {
                    return JSON.parse(JSON.stringify(this[arguments[0]].VALUE))
                } catch (error) 
                {
                    console.log('error param.toValue() : ' + error)
                }
            }                    
        }
        // DB İÇERİSİNDE KAYIT YOKSA META İÇERİSİNDEKİ DEĞER DÖNDÜRÜLÜYOR.
        else if(this.length == 0 && this.meta != null && this.meta.length > 0)
        {
            return JSON.parse(JSON.stringify(this.meta[0].VALUE))
        }
        return '';
    }
    setValue()
    {

        // BU FONKSİYON 1 VEYA 2 PARAMETRE ALABİLİR. BİR PARAMETRE ALIRSA SIFIRINCI SATIRA PARAMETRE DEĞERİ SET EDİLİR. İKİ PARAMETRE ALIRSA BİRİNCİ PARAMETRE SATIR İKİNCİ PARAMETRE SET EDİLECEK DEĞERDİR.
        if(this.length > 0)
        {
            // EĞER PARAMETRE OLARAK HİÇBİRŞEY GELMEDİYSE SIFIRINCI SATIRA SET EDİLİYOR
            if(arguments.length == 1)
            {
                this[0].VALUE = JSON.stringify(arguments[0]);
            }
            // EĞER PARAMETRE GELMİŞ İSE VE GELEN VERİ NUMBER İSE VERİLEN SATIR I DÖNDÜR.
            else if(arguments.length == 2 && typeof arguments[0] == 'number')
            {
                try 
                {
                    this[arguments[0]].VALUE = JSON.stringify(arguments[0])
                } catch (error) 
                {
                    console.log('error param.toValue() : ' + error)
                }
            }
        }
        else
        {
            if(this.meta.length == 1)
            {
                let tmpData = {...this.meta[0]}
                tmpData.VALUE = JSON.stringify(arguments[0])
                
                this.push(tmpData)
            }
        }
    }
}
export class menu
{
    constructor()
    {
        this.metaMenu = null;

        if(arguments.length > 0)
        {            
            this.metaMenu = arguments[0]
        }
        this.core = core.instance;
        this.ds =  new dataset()
        this.empty = {
            GUID : '00000000-0000-0000-0000-000000000000',
            TYPE : 0,
            ID : "",
            VALUE : "",
            SPECIAL : "",
            USERS : "",
            PAGE : "",
            ELEMENT : "",
            APP : ""
        }

        this._initDs();
    }
     //#region private
     _initDs()
     {
         let tmpDt = new datatable('PARAM');
         tmpDt.selectCmd = 
         {
             query : "SELECT * FROM [dbo].[PARAM] WHERE USERS = @USER AND APP = @APP AND ID=@ID",
             param : ['USER:string|50','APP:string|50','ID:string|50']
         }
         tmpDt.insertCmd = 
         {
             query : "EXEC [dbo].[PRD_PARAM_INSERT] " + 
                     "@TYPE = @PTYPE, " + 
                     "@ID = @PID, " + 
                     "@VALUE = @PVALUE, " + 
                     "@SPECIAL = @PSPECIAL, " + 
                     "@USERS = @PUSERS, " + 
                     "@PAGE = @PPAGE, " + 
                     "@ELEMENT = @PELEMENT, " + 
                     "@APP = @PAPP ", 
             param : ['PTYPE:int','PID:string|100','PVALUE:string|max','PSPECIAL:string|150','PUSERS:string|25','PPAGE:string|25','PELEMENT:string|250','PAPP:string|50'],
             dataprm : ['TYPE','ID','VALUE','SPECIAL','USERS','PAGE','ELEMENT','APP']
         } 
         tmpDt.updateCmd = 
         {
             query : "EXEC [dbo].[PRD_PARAM_UPDATE] " + 
                     "@GUID = @PGUID, " + 
                     "@TYPE = @PTYPE, " + 
                     "@ID = @PID, " + 
                     "@VALUE = @PVALUE, " + 
                     "@SPECIAL = @PSPECIAL, " + 
                     "@USERS = @PUSERS, " + 
                     "@PAGE = @PPAGE, " + 
                     "@ELEMENT = @PELEMENT, " + 
                     "@APP = @PAPP ", 
             param : ['PGUID:string|50','PTYPE:int','PID:string|100','PVALUE:string|max','PSPECIAL:string|150','PUSERS:string|25','PPAGE:string|25','PELEMENT:string|250','PAPP:string|50'],
             dataprm : ['GUID','TYPE','ID','VALUE','SPECIAL','USERS','PAGE','ELEMENT','APP']
         } 
         this.ds.add(tmpDt);
     }
     //#region
     dt()
     {
         if(arguments.length > 0)
         {
             return this.ds.get(arguments[0])
         }
 
         return this.ds.get(0)
     }
     async addEmpty()
     {
         if(typeof this.dt('PARAM') == 'undefined')
         {
             return;
         }
         let tmp = {};
         if(arguments.length > 0)
         {
             tmp = {...arguments[0]}
         }
         else
         {
             tmp = {...this.empty}
         }
         if(typeof arguments[1] == 'undefined' || arguments[1] == true)
         {
             tmp.GUID = datatable.uuidv4()
         }
         this.dt('PARAM').push(tmp,arguments[1])
         
     }
     clearAll()
     {
         for(let i = 0; i < this.ds.length; i++)
         {
             this.dt(i).clear()
         }
     }
     save()
     {
         return new Promise(async resolve => 
         {
             this.ds.delete()
             resolve(await this.ds.update()); 
         });
     }
     load()
     {
         //PARAMETRE OLARAK OBJE GÖNDERİLİR YADA PARAMETRE BOŞ İSE TÜMÜ GETİRİLİR.
         return new Promise(async resolve =>
         {
             let tmpPrm = {USER:"",APP:"",ID:"menu"}
             if(arguments.length > 0)
             {
                 tmpPrm.USER = typeof arguments[0].USER == 'undefined' ? '' : arguments[0].USER;
                 tmpPrm.APP = typeof arguments[0].APP == 'undefined' ? '' : arguments[0].APP;
                 tmpPrm.ID = typeof arguments[0].ID == 'undefined' ? 'menu' : arguments[0].ID;
             }
 
             this.ds.get('PARAM').selectCmd.value = Object.values(tmpPrm);
 
             await this.ds.get('PARAM').refresh();

             if(this.ds.get('PARAM').length > 0)
             {
                resolve(JSON.parse(this.ds.get('PARAM')[0].VALUE));
             }
             else
             {
                resolve(this.metaMenu)
             }             
         });
     }
}
Object.setPrototypeOf(datatable.prototype,Array.prototype);
//* DİZİ İÇİN GROUP BY */
Array.prototype.toGroupBy = function(pKey)
{
    return this.reduce(function(rv, x) 
    {
        (rv[x[pKey]] = rv[x[pKey]] || []).push(x);
        return rv;
    }, {});
}
//* DİZİ İÇİN ALT ELEMANLARDA ARATMA İŞLEMİ - ALI KEMAL KARACA - 24.08.2022 */
Array.prototype.findSub = function(pFilters,pFindSub)
{
    if(typeof pFilters == 'object')
    {
        let tmpKey = Object.keys(pFilters)[0];
        let tmpVal = Object.values(pFilters)[0];
    
        for (let i = 0; i < this.length; i++) 
        {
            if(this[i][tmpKey] == tmpVal)
            {
                return this[i]
            }
            else if(Array.isArray(this[i][pFindSub]))
            {
                let tmpData = this[i][pFindSub].findSub(pFilters,pFindSub)
                if (typeof tmpData != 'undefined')
                {
                    return tmpData
                }
            }
        }
    }
}
//* SAYI İÇERİSİNDEKİ ORAN. ÖRN: 10 SAYISININ YÜZDE 18 İ 1.8. */
Number.prototype.rateInc = function(pRate,pDigit)
{
    if(typeof pRate != 'undefined')
    {
        if(typeof pDigit != 'undefined')
            return isNaN(Number((this * (pRate / 100)).toFixed(pDigit))) ? 0 : Number((this * (pRate / 100)).toFixed(pDigit))
        else
            return isNaN(this * (pRate / 100)) ? 0 : this * (pRate / 100)
    }
    return 0
}
//* SAYI İÇERİSİNDEKİ DAHİLİ ORANI. ÖRN: 10 SAYISININ YÜZDE 18 İN DAHİLİ SONUCU 11.8. */
Number.prototype.rateExc = function(pRate,pDigit)
{
    if(typeof pRate != 'undefined')
    {
        if(typeof pDigit != 'undefined')
            return isNaN(Number((this * ((pRate / 100) + 1)).toFixed(pDigit))) ? 0 : Number((this * ((pRate / 100) + 1)).toFixed(pDigit))
        else
            return isNaN(this * ((pRate / 100) + 1)) ? 0 : this * ((pRate / 100) + 1)
    }
    return 0
}
//* SAYI İÇERİSİNDEKİ ORANIN ÇIKARILMIŞ SONUCU. ÖRN: 11.8 SAYISININ YÜZDE 18 ÇIKARILMIŞ SONUCU 10. */
Number.prototype.rateInNum = function(pRate,pDigit)
{
    if(typeof pRate != 'undefined')
    {
        if(typeof pDigit != 'undefined')
            return isNaN(Number((this / ((pRate / 100) + 1)).toFixed(pDigit))) ? 0 : Number((this / ((pRate / 100) + 1)).toFixed(pDigit))
        else
            return isNaN(this / ((pRate / 100) + 1)) ? 0 : this / ((pRate / 100) + 1)
    }
    return 0
}
//* B SAYISININ A SAYISINA DAHİLİ ORANI ÖRN: 1.8 SAYISININ, 11.8 SAYISIN İÇERİSİNDEKİ ORANI %18 */
Number.prototype.rate2In = function(pNum,pDigit)
{
    if(typeof pNum != 'undefined')
    {
        if(typeof pDigit != 'undefined')
        {
            return isNaN(Number(((pNum / (this - pNum)) * 100).toFixed(pDigit))) ? 0 : Number(((pNum / (this - pNum)) * 100).toFixed(pDigit))
        }
        else
        {
            return isNaN((pNum / (this - pNum)) * 100) ? 0 : (pNum / (this - pNum)) * 100
        }                 
    }
    return 0
}
//* B SAYISININ A SAYISINA ORANI ÖRN: 1.8 SAYISININ, 11.8 SAYISIN İÇERİSİNDEKİ ORANI %18 */
Number.prototype.rate2Num = function(pNum,pDigit)
{
    if(typeof pNum != 'undefined')
    {
        if(typeof pDigit != 'undefined')
        {
            return isNaN(Number(((pNum / this) * 100).toFixed(pDigit))) ? 0 : Number(((pNum / this) * 100).toFixed(pDigit))
        }
        else
        {
            return isNaN((pNum / this) * 100) ? 0 : (pNum / this) * 100
        }                 
    }
    return 0
}
//* STRING DEĞERİN SONUNA YADA BAŞINA BOŞLUK ATAR pLen = KARAKTER BOŞLUK SAYISI pType = s (BAŞINA) e (SONUNA) */
String.prototype.space = function(pLen,pType)
{
    let tmpData = this
    if(tmpData.length > pLen)
    {
        tmpData = tmpData.toString().substring(0,pLen);
    }
    if(typeof pType == 'undefined')
    {
        return tmpData.toString().padEnd(pLen,' ');
    }
    if(pType == "e")
    {
        return tmpData.toString().padEnd(pLen,' ');
    }
    else if(pType == "s")
    {
        return tmpData.toString().padStart(pLen,' ');
    }
}
//* FORMAT CURRENCY */
Number.prototype.currency = function()
{
    return new Intl.NumberFormat(localStorage.getItem('lang') == null ? 'en' : localStorage.getItem('lang'), { style: 'currency', currency: typeof Number.money == 'undefined' ? 'EUR' : typeof Number.money.code == 'undefined' ? 'EUR' : Number.money.code }).format(this)
}
//* FORMAT DECIMAL */
Number.prototype.decimal = function()
{    
    return new Intl.NumberFormat(localStorage.getItem('lang') == null ? 'en' : localStorage.getItem('lang'), { style: 'decimal',minimumIntegerDigits: 2,minimumFractionDigits: 2,maximumFractionDigits: 3}).format(this)
}
//* ROUND */
Number.prototype.round = function(pDigits)
{
    let tmpNum = "1"
    let tmpDigits = pDigits
    if(typeof pDigits == 'undefined')
    {
        tmpDigits = 2
    }

    for (let i = 0; i < tmpDigits; i++) 
    {
        tmpNum = tmpNum + "0"
    }
    tmpNum = Number(tmpNum)
    
    return isNaN(Number(Math.round(Number(this)+'e'+pDigits)+'e-'+pDigits)) ? 0 : Number(Math.round(Number(this)+'e'+pDigits)+'e-'+pDigits)
    //return Math.round((Number(this.toFixed(pDigits + 1)) + Number.EPSILON) * tmpNum) / tmpNum
    //return Math.round((this + Number.EPSILON) * tmpNum) / tmpNum
}