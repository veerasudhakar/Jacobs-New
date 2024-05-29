import { LightningElement,wire,track } from 'lwc';
import getContactData from '@salesforce/apex/ContactDataTable.contactdata';

const COLUMNS = [
    { label: 'Last Name', fieldName: 'LastName' },
    { label: 'Email', fieldName: 'Email' },
    { label: 'Phone', fieldName: 'Phone' }
];
export default class ContactDatatable extends LightningElement {
    @track columns = COLUMNS;
    @track contactData;

    @wire(getContactData)
    wiredcontacts({data, error}) {
        if (data) {
            this.contactData = data;
        } else if (error) {
            this.contactData = undefined;
            console.error('Error fetching contact data:', error);
        }
    }
}