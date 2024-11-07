import React from 'react';
import NbBase from './base.js';
import NbButton from './button.js';
import Keyboard from "react-simple-keyboard";

export default class NbKeyboard extends NbBase
{
    constructor(props)
    {
        super(props);
        this.state.layoutName = typeof this.props.layoutName == 'undefined' ?  "default" : this.props.layoutName
        this.state.inputName = this.props.inputName
        this.state.inputs = {}
        
        this.keyPattern = 
        {
            qwert : 
            {
                shift: 
                [
                "q w e r t y u i o p ü . :",
                "a s d f g h j k l ş - , /",
                "z x c v b n m ö ç * _ % {shift}",
                "{numbers} {space} {backspace} @"
                ],
                default: 
                [
                "Q W E R T Y U I O P Ü . :",
                "A S D F G H J K L Ş - , /",
                "Z X C V B N M Ö Ç * _ % {shift}",
                "{numbers} {space} {backspace} @"
                ],
                mail: 
                [
                "q w e r t y u i o p ü . :",
                "a s d f g h j k l ş - , /",
                "z x c v b n m ö ç * _ % {capslock}",
                "{numbers} {space} {backspace} @",
                "hotmail gmail outlook .com",
                "icloud orange yahoo .fr"
                ],
                mailShift: 
                [
                "Q W E R T Y U I O P Ü . :",
                "A S D F G H J K L Ş - , /",
                "Z X C V B N M Ö Ç * _ % {capslock}",
                "{numbers} {space} {backspace} @",
                "hotmail gmail outlook .com",
                "icloud orange yahoo .fr"
                ],
                numbers: ["1 2 3", "4 5 6", "7 8 9", "{abc} 0 {backspace}"],
                numberSimple: ["1 2 3", "4 5 6", "7 8 9", ", 0 {backspace}"]
            },
            azert :
            {
                shift: 
                [
                    "a z e r t y u i o p % *",
                    "q s d f g h j k l m - |",
                    "w x c v b n , : . _ {shift}",
                    "{numbers} {space} {backspace} @"
                ],
                default: 
                [
                    "A Z E R T Y U I O P % *",
                    "Q S D F G H J K L M - |",
                    "W X C V B N , : . _ {shift}",
                    "{numbers} {space} {backspace} @"
                ],
                mail: 
                [
                    "a z e r t y u i o p % *",
                    "q s d f g h j k l m - |",
                    "w x c v b n , : . _ {capslock}",
                    "{numbers} {space} {backspace} @",
                    "hotmail gmail outlook .com",
                    "icloud orange yahoo .fr"
                ],
                mailShift: 
                [
                    "A Z E R T Y U I O P % *",
                    "Q S D F G H J K L M - |",
                    "W X C V B N , : . _ {capslock}",
                    "{numbers} {space} {backspace} @",
                    "hotmail gmail outlook .com",
                    "icloud orange yahoo .fr"
                ],
                numbers: ["1 2 3", "4 5 6", "7 8 9", "{abc} 0 {backspace}"],
                numberSimple: ["1 2 3", "4 5 6", "7 8 9", ", 0 {backspace}"]
            }
        }
        
        if(typeof this.props.keyType == 'undefined')
        {
            this.state.keyboard = this.keyPattern.qwert
        }
        else
        {
            this.state.keyboard = this.keyPattern[this.props.keyType]
        }
    }
    get inputName()
    {
        return this.state.inputName
    }
    set inputName(e)
    {
        this.setState({inputName:e})
    }
    setInput(e)
    {
        if(typeof this.props.focusClear != 'undefined' && this.props.focusClear == true)
        {
            this.state.inputs[this.state.inputName] = ""
            this.setState({inputs:this.state.inputs})
            this.keyboard.setInput("")
            return
        }

        this.state.inputs[this.state.inputName] = e
        this.setState({inputs:this.state.inputs})
        this.keyboard.setInput(e)        
    }
    clearInput()
    {
        this.keyboard.clearInput();
    }
    getCaretPositionEnd()
    {
        return this.keyboard.getCaretPositionEnd()
    }
    setCaretPosition(e)
    {
        this.keyboard.setCaretPosition(e)
    }
    render()
    {
        return(
            <div>
                <Keyboard keyboardRef={(r) => (this.keyboard = r)}
                inputName={this.state.inputName}
                onChangeAll={(inputs) =>
                {
                    this.props.parent[this.state.inputName].value = inputs[this.state.inputName]
                    this.setState({inputs:inputs})
                }}
                onKeyPress={(button) => 
                {
                    if (button === "{shift}" || button === "{lock}") 
                    {
                        this.setState(
                        {
                            layoutName: this.state.layoutName === "default" ? "shift" : "default"
                        });
                    }
                    if (button === "{capslock}") 
                    {
                        this.setState(
                        {
                            layoutName: this.state.layoutName === "mail" ? "mailShift" : "mail"
                        });
                    }
                    if (button === "{numbers}" || button === "{abc}") 
                    {
                        this.setState(
                        {
                            layoutName: this.state.layoutName === "numbers" ? this.props.layoutName : "numbers"
                        });
                    }
                }}
                layoutName={this.state.layoutName}
                layout={this.state.keyboard}
                display={{
                    "{numbers}": "123",
                    "{ent}": "return",
                    "{escape}": "esc ⎋",
                    "{tab}": "tab ⇥",
                    "{backspace}": "⌫",
                    "{capslock}": "caps lock ⇪",
                    "{shift}": "⇧",
                    "{controlleft}": "ctrl ⌃",
                    "{controlright}": "ctrl ⌃",
                    "{altleft}": "alt ⌥",
                    "{altright}": "alt ⌥",
                    "{metaleft}": "cmd ⌘",
                    "{metaright}": "cmd ⌘",
                    "{abc}": "ABC"
                }}
                buttonTheme={[
                {
                    class: "simple-keyboard-ratea",
                    buttons: "%"
                }]}
                mergeDisplay={true}
                />
            </div>
        )
    }
}