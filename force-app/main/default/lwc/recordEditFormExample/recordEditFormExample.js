import { LightningElement,api } from 'lwc';
import NAME_FIELD from '@salesforce/schema/Contact.Name';
import PHONE_FIELD from '@salesforce/schema/contact.phone';
export default class RecordEditFormExample extends LightningElement {
    nameField = NAME_FIELD;
    phoneField = PHONE_FIELD;

    @api recordId;
    @api objectApiName;
}