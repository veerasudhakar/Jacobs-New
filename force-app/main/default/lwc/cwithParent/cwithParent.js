import { LightningElement} from 'lwc';

export default class CwithParent extends LightningElement {
childdata;

handleMessage(event){
this.childdata = event.detail;
}
}