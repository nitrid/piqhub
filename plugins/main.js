import {core} from 'gensrv'
import {menuOff} from './menu/menuOff.js'
import moment from 'moment'
import fs from 'fs'
import path from 'path'
import { generateScripts, scriptEvents } from '../app/generate-sql.js';
import express from 'express';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const versionPath = process.env.VERSION_PATH || path.join(__dirname, '../version');
const basePath = versionPath;

class main
{
    constructor()
    {
        this.core = core.instance
        this.userList = []
        this.activeProcesses = {}
        
        this.connEvt = this.connEvt.bind(this)
        this.core.socket.on('connection',this.connEvt)

        this.core.app.get('/api/menuOff', (req, res) => 
        {
            try 
            {
                let menuData = menuOff();
                res.json(menuData);
            } 
            catch (error) 
            {
                console.error('Error loading MenuOff:', error);
                res.status(500).json({ error: 'Error occurred while loading the menu' });
            }
        });

        const versionPath = process.env.VERSION_PATH || path.join(__dirname, '../version');
        const customersPath = process.env.CUSTOMERS_PATH || path.join(__dirname, '../customers');

        this.core.app.use('/api/version', express.static(versionPath));
        this.core.app.use('/api/customers', express.static(customersPath));

        const storage = multer.diskStorage(
        {
            destination: (req, file, cb) => 
            {
                const uploadPath = path.join(versionPath, req.params.version);
                if (!fs.existsSync(uploadPath)) 
                {
                    fs.mkdirSync(uploadPath, { recursive: true });
                }
                cb(null, uploadPath);
            },
            filename: (req, file, cb) => 
            {
                cb(null, 'public.zip');
            }
        });

        const upload = multer({ storage: storage });

        this.core.app.post('/api/version/:version/upload', upload.single('file'), (req, res) => 
        {
            try 
            {
                if (!req.file) 
                {
                    throw new Error('No file uploaded');
                }
                res.json({ success: true });
            } 
            catch(error) 
            {
                console.error('Error uploading file:', error);
                res.status(500).json(
                { 
                    success: false, 
                    error: error.message 
                });
            }
        });

        this.init()
    }
    connEvt(pSocket)
    {
        pSocket.on('piqhub-get-licence',async (pParam,pCallback) =>
        {
            if(typeof pParam.macid != 'undefined')
            {
                let tmpResult = await this.core.sql.execute({query: `SELECT * FROM LICENCE WHERE MACID = '${pParam.macid}' AND STATUS = 1 AND DELETED = 0`})
                if(tmpResult.result.err == null)
                {
                    if(tmpResult.result.recordset.length > 0)
                    {
                        pCallback(tmpResult.result.recordset[0])
                    }
                    else
                    {
                        pCallback(null)
                    }
                }
                else
                {
                    console.error(tmpResult.result.err)
                    pCallback(null)
                }
            }
        })
        pSocket.on('piqhub-set-info',async (pParam,pCallback) =>
        {
            if(typeof pParam.macid != 'undefined')
            {
                if(typeof pParam.version != 'undefined')
                {
                    let tmpQuery = 
                    {
                        query: `UPDATE LICENCE SET VERSION = @VERSION,REQUEST_DATE = @REQUEST_DATE WHERE MACID = @MACID AND STATUS = 1 AND DELETED = 0`,
                        param: ['VERSION:string|50','REQUEST_DATE:datetime','MACID:string|50'],
                        value: [pParam.version || '',moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),pParam.macid]
                    }

                    let tmpResult = await this.core.sql.execute(tmpQuery)
                
                    if(tmpResult.result.err)
                    {
                        console.error("Error updating license information:",tmpResult.result.err)
                        pCallback({success:false,error:tmpResult.result.err})
                        return
                    }
                }
                if(typeof pParam.userList != 'undefined')
                {
                    let existingUserIndex = this.userList.findIndex(u => u.macid === pParam.macid);

                    if (existingUserIndex !== -1) 
                    {
                        this.userList[existingUserIndex] = {macid:pParam.macid,users:pParam.userList};
                    } 
                    else 
                    {
                        this.userList.push({macid:pParam.macid,users:pParam.userList});
                    }
                }
            }
            else
            {
                console.error("MACID information is missing")
            }
        })
        pSocket.on('piqhub-get-users',(pParam,pCallback) =>
        {
            if(typeof pParam?.macid != 'undefined')
            {
                pCallback(this.userList.find(u => u.macid === pParam.macid)?.users || undefined)
            }
            else
            {
                pCallback(this.userList)
            }
        })
        pSocket.on('piqhub-gensc', async (pParam, pCallback) => 
        {
            if (typeof pParam?.version == 'undefined') 
            {
                pCallback({ success: false, error: 'Version parameter is required' });
                return;
            }

            try 
            {
                const eventHandler = (data, eventType) => 
                {
                    if(eventType === 'complete') 
                    {
                        delete this.activeProcesses[pParam.version];
                    }
                    else 
                    {
                        this.activeProcesses[pParam.version] = {
                            message: data.message,
                            process: data.process,
                            eventType: eventType
                        };
                    }
                    
                    this.core.socket.emit('script-progress', {
                        version: pParam.version,
                        message: data.message,
                        process: data.process,
                        eventType: eventType
                    });
                };

                scriptEvents.on('start', (data) => eventHandler(data, 'start'));
                scriptEvents.on('progress', (data) => eventHandler(data, 'progress'));
                scriptEvents.on('error', (data) => eventHandler(data, 'error'));
                scriptEvents.on('complete', (data) => eventHandler(data, 'complete'));

                await generateScripts(pParam.version);

                scriptEvents.removeAllListeners('start');
                scriptEvents.removeAllListeners('progress');
                scriptEvents.removeAllListeners('error');
                scriptEvents.removeAllListeners('complete');

                pCallback({ success: true });
            } 
            catch (error) 
            {
                console.error('Error in script generation:', error);
                pCallback({ success: false, error: error.message });
            }
        });
        pSocket.on('piqhub-delete-folder', async (pParam, pCallback) => 
        {
            if (typeof pParam?.path == 'undefined') 
            {
                pCallback({ success: false, error: 'Path parameter is required' });
                return;
            }

            try 
            {
                const fullPath = path.join(basePath, pParam.path);

                if (!fullPath.startsWith(basePath)) 
                {
                    pCallback({ success: false, error: 'Invalid path' });
                    return;
                }

                if (!fs.existsSync(fullPath)) 
                {
                    pCallback({ success: false, error: 'Folder does not exist' });
                    return;
                }

                const files = fs.readdirSync(fullPath);
                for (const file of files) {
                    const curPath = path.join(fullPath, file);
                    if (fs.lstatSync(curPath).isDirectory()) {
                        fs.rmSync(curPath, { recursive: true, force: true });
                    } else {
                        fs.unlinkSync(curPath);
                    }
                }
                fs.rmdirSync(fullPath);

                pCallback({ success: true, message: `Folder deleted successfully: ${pParam.path}` });
            } 
            catch (error) 
            {
                console.error('Error deleting folder:', error);
                pCallback({ success: false, error: error.message });
            }
        });
    }
    async init()
    {
        //await generateScripts('1.0.15d');
    }
}
export const _main = new main()