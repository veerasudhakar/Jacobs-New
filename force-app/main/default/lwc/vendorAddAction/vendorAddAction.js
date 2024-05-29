import { LightningElement, track, wire, api } from 'lwc';
import insertRecords from '@salesforce/apex/vendorDetails.insertRecords';
import { getRecord } from 'lightning/uiRecordApi';

export default class VendorAddAction extends LightningElement {
    Maincomponent = false;
    Addrow = false;
    @track records = []; // Assuming records is an array of objects containing Deduction Name, Account, Opportunity, and Amount
    @track isLoading = false; // Flag to indicate if data is loading
    @track accountId;
    @track opportunityId;
   
    @api recordId;

    @wire(getRecord, { recordId: '$recordId', fields: ['Opportunity.AccountId', 'Opportunity.Id'] })
    wiredRecord({ error, data }) {
        if (data) {
            console.log('Record data:', data);
            console.log('Account ID:', data.fields.AccountId.value);
            console.log('Opportunity ID:', data.fields.Id.value);
            this.accountId = data.fields.AccountId.value;
            this.opportunityId = data.fields.Id.value;
        } else if (error) {
            console.error('Error fetching record', error);
        }
    }

    addRow() {
        this.Addrow = true;
        // Assuming you have a function to create a new row object
        const newRow = this.createNewRow();
        this.records = [...this.records, newRow];
    }

    createNewRow() {
        return {
            // Assuming you'll assign a unique Id later
            Name: '',
            Account__c: this.accountId,
            Opportunity__c: this.opportunityId,
            Amount__c: ''
        };
    }

    handleName(event) {
        // Get the index of the record being edited
        const index = event.target.dataset.id;
        // Update the value in the records array
        this.records[index].Name = event.target.value;
    }

    handleEmail(event) {
        // Get the index of the record being edited
        const index = event.target.dataset.id;
        // Update the value in the records array
        this.records[index].Amount = event.target.value;
    }

    handleDeleteAction(event) {
        const recordId = event.target.dataset.id; // Get the ID of the record to delete
        const index = this.records.findIndex(record => record.Id === recordId); // Find the index of the record in the array
        if (index !== -1) {
            // Remove the record from the array
            this.records = [...this.records.slice(0, index), ...this.records.slice(index + 1)];
        }
    }

    handleInsertAction() {
        if (this.validateFields()) {
            let recordsToInsert = this.records.map(record => {
                return {
                    Name: record.Name,
                    Account__c: this.accountId,
                    Opportunity__c: this.opportunityId,
                    Amount__c: record.Amount
                };
            });

            insertRecords({ records: recordsToInsert })
            .then(result => {
                console.log('Inserted Records Successfully:', result);
            })
            .catch(error => {
                console.error('Error Inserting Records:', error);
            });
           this.records = [];
           this.Addrow = false;
        }
    }

    validateFields() {
        let isValid = true;
        this.records.forEach((record, index) => {
            if (!record.Name) {
                this.records[index].NameError = 'Vendor Name is required';
                isValid = false;
            } else {
                this.records[index].NameError = '';
            }

            if (!record.Amount) {
                this.records[index].EmailError = 'Amount is required';
                isValid = false;
            } else {
                this.records[index].EmailError = '';
            }
        });
        return isValid;
    }

    closeAction() {
        this.records = [];
        this.Maincomponent = false;
    }

    handleClicktoopen() {
        this.Maincomponent = true;
    }

    clearall(){

        this.records = [];
    }

}