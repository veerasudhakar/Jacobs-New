import { LightningElement } from 'lwc';

export default class CwithChild extends LightningElement {
textdata='';

handleChange(event){
this.textdata = event.target.value;
}

handleSearch(){
    const event = new CustomEvent('select',{
        detail : this.textdata
    })
    this.dispatchEvent(event);
}

}