import React from 'react';
import LoadIndicator from 'devextreme-react/load-indicator';
import App from '../lib/app.js';
import { dialog } from '../core/react/devex/dialog.js';

export default class Page extends React.PureComponent
{
  constructor(props)
  {
    super(props)
    
    this.core = App.instance.core;

    this.page = React.lazy(() => import("../pages/" + props.data.path).then(async (obj)=>
    {
      obj.default.prototype.user = this.core.auth.data;
      obj.default.prototype.lang = App.instance.lang;
      
      obj.default.prototype.t = App.instance.lang.getFixedT(null,null,this.props.data.id)
      obj.default.prototype.pagePrm = this.props.data.pagePrm;

      obj.default.prototype.init = (function()
      {
        let tmpCached = obj.default.prototype.init;
        return function()
        {          
          tmpCached.apply(this,arguments)
          this.emit('onInit')
        }
      }());
      //EVENT PAGE - ALI KEMAL KARACA - 25.01.2022 *****/
      obj.default.prototype.listeners = Object();
      obj.default.prototype.on = function(pEvt, pCallback) 
      {
        if (!this.listeners.hasOwnProperty(pEvt))
        this.listeners[pEvt] = Array();
        this.listeners[pEvt].push(pCallback); 
      }
      obj.default.prototype.emit = function(pEvt, pParams)
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
      App.instance.panel.onClose = async () =>
      {
        
          let tmpConfObj =
          {
              id:'msgClose',showTitle:true,title:("Dikkat"),showCloseButton:true,width:'500px',height:'200px',
              button:[{id:"btn01",caption:("Evet"),location:'before'},{id:"btn02",caption:("Hayır"),location:'after'}],
              content:(<div style={{textAlign:"center",fontSize:"20px"}}>{("Sayfayı Kapatmak İstediğinize Eminmisiniz?")}</div>)
          }
          
          let pResult = await dialog(tmpConfObj);
          if(pResult == 'btn01')
          {
              App.instance.panel.closePage()
          }
      }
      //***********************************************/      
      return obj;
    }))    
  }
  render()
  {
    return(
      <React.Fragment>
        <React.Suspense fallback={<div style={{position: 'relative',margin:'auto',top: '40%',left:'50%'}}><LoadIndicator height={40} width={40} /></div>}>          
          <this.page data={this.props.data}/>
        </React.Suspense>
      </React.Fragment>
    )
  }
}