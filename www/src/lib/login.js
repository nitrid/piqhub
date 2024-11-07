import React from 'react';
import App from './app.js'
import TextBox from 'devextreme-react/text-box';
import Button from 'devextreme-react/button';
import NdSelectBox from '../core/react/devex/selectbox.js';

export default class Login extends React.PureComponent
{
    constructor()
    {
        super()
        this.style =
        {
            body : 
            {
                backgroundColor : '#ecf0f1',                
                height: '100%',
            },
            login_box :
            {
                position: 'relative',
                margin:'auto',
                top: '30%',
                width: '400px',
                height: 'fit-content',
            }
        }  
        this.state = 
        {
            kullanici: '',
            sifre: '',
            alert: '',
            Users:[]
        }  
        this.core = App.instance.core;
        
        this.onLoginClick = this.onLoginClick.bind(this)
        this.textValueChanged = this.textValueChanged.bind(this)
    }
    componentDidMount()
    {
        this.init()
    }
    async init()
    {
        let tmpData =  await this.core.auth.getUserList()
        console.log(tmpData)
        let tmpUsers = []
        for (let i = 0; i < tmpData.length; i++) 
        {
            if(tmpData[i].ROLE == 'Administrator')
            tmpUsers.push(tmpData[i])
        }
        this.setState({Users:tmpUsers})
        this.cmbkullanici.dataRefresh({source:this.state.Users})
    }
    textValueChanged(e) 
    {      
        if(e.element.id == 'Kullanici')
        {
            this.setState({kullanici: e.value});
        } 
        else if(e.element.id == 'Sifre')
        {
            this.setState({sifre: e.value});
        }
    }
    async onLoginClick(e)
    {
        if(this.state.kullanici == '' && this.state.sifre == '')
        {
            return;
        }
        
        if((await this.core.auth.login(this.state.kullanici,this.state.sifre,'ADMIN')))
        {
            //ADMIN PANELINE YANLIZCA ADMINISTRATOR ROLUNDEKİ KULLANICILAR GİREBİLİR...
            if(this.core.auth.data.ROLE == 'Administrator')
            {
                App.instance.setState({logined:true});
            }
            else
            {
                this.setState({logined:false,alert:"Yetkisiz Giriş"})
            }
        }
        else
        {
            this.setState({logined:false,alert:"Geçersiz Kullanıcı Yada Şifre"})
        }
    }
    render()
    {
        return (
            <div style={this.style.body}>
                <div className="card" style={this.style.login_box}>
                   <div className="card-header">{"PIQHUB"}</div>
                   <div className="card-body">
                        <div className="row">
                            <div className="col-12 pb-2">
                                <h6 className="text-center" style={{color:'#ff7675'}}>{this.state.alert}</h6>
                            </div>
                        </div>
                        <div className="dx-field">
                            <div className="dx-field-label">{"Kullanıcı :"}</div>
                            <div className="dx-field-value">
                            <NdSelectBox simple={true} parent={this} id="cmbkullanici" height='fit-content'
                                    displayExpr="NAME"                       
                                    valueExpr="CODE"
                                    value= ""
                                    searchEnabled={true}
                                    data={{source:this.state.Users}}
                                    onValueChanged={(async(e)=>
                                    {
                                        this.setState({kullanici:e.value})
                                    }).bind(this)}
                                    />
                            </div>
                        </div>
                        <div className="dx-field">
                            <div className="dx-field-label">{"Şifre :"}</div>
                            <div className="dx-field-value">
                                <TextBox id="Sifre" mode="password" showClearButton={true} height='fit-content' valueChangeEvent="keyup" onValueChanged={this.textValueChanged} />
                            </div>
                        </div>
                        <div className="dx-field">
                            <Button
                                width={'100%'}
                                height='fit-content'
                                text={"Giriş"}
                                type="default"
                                stylingMode="contained"
                                onClick={this.onLoginClick}
                            />
                        </div>
                   </div>
                </div>
            </div>
        )
    }
}