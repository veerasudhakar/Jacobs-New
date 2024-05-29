import { LightningElement,api } from 'lwc';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
export default class RecordFormExamples extends LightningElement {

   @api recordId;

   handleSubmit(event){
const evt = new ShowToastEvent({
 title : "Success Message",
message : "Record Created Successfully",
variant: 'success',
mode:'dismissible'
});
this.dispatchEvent(evt);
   }
}