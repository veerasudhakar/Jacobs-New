import { LightningElement,wire} from 'lwc';
import {NavigationMixin} from 'lightning/navigation';
import GetDetailsAccount from '@salesforce/apex/AccountHandlerData.accountsList';

const COLUMNS = [
    {label : 'Name', fieldName : 'Name', type: 'button', typeAttributes: { label: { fieldName: 'Name' }, variant: 'base' }},
    {label : 'Industry', fieldName : 'Industry', type : 'text'},
    {label : 'Type', fieldName : 'Type', type : 'text'}
];
export default class PracticeonAccount extends NavigationMixin(LightningElement) {
    columns = COLUMNS;
    accdata;
    searchKey = '';

    @wire(GetDetailsAccount, { searchText: '$searchKey' })
    wiredaccounts({ data, error }) {
        if (data) {
            this.accdata = data;
            console.log(this.accdata, 'accdata......');
        } else if (error) {
            this.accdata = undefined;
            console.log('Error in Fetching data');
        }
    }

    handleSearch(event) {
        this.searchKey = event.target.value;
    }
    // handleRowSelection(event) {
    //     const selectedAccountId = event.detail.selectedRows[0].Id;
    //     this.navigateToRecordPage(selectedAccountId);
    // }

    // navigateToRecordPage(recordId) {
    //     // Navigate to the record page
    //     this[NavigationMixin.Navigate]({
    //         type: 'standard__recordPage',
    //         attributes: {
    //             recordId: recordId,
    //             actionName: 'view'
    //         }
    //     });
    // }

    handleRowSelection(event) {
        const selectedAccountId = event.detail.selectedRows[0].Id;
        this.navigateToRecordPage(selectedAccountId);
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        if (actionName === 'navigate_to_record') {
            const row = event.detail.row;
            this.navigateToRecordPage(row.Id);
        }
    }

    navigateToRecordPage(recordId) {
        // Navigate to the record page
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId,
                actionName: 'view'
            }
        });
    }
    
}