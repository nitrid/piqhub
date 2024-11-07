import {core} from 'gensrv'
import {menuOff} from './menu/menuOff.js'

class main
{
    constructor()
    {
        this.core = core.instance
        
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
                console.error('MenuOff hatası:', error);
                res.status(500).json({ error: 'Menü yüklenirken hata oluştu' });
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
    }
    init()
    {
        
    }
}
export const _main = new main()