import { LightningElement, wire, track } from 'lwc';
import getAccountDetails from '@salesforce/apex/accountController.accountDetails';
const COLUMNS=[
    {label : 'Name', FieldName : 'Name'},
    {label : 'Phone', FieldName : 'Phone'},
    {label : 'Industry', FieldName : 'Industry'}
];
export default class AccountDataTable extends LightningElement {
  columns = COLUMNS;
  @track accData=[];
   @wire(getAccountDetails)
wiredAccounts({data,error}){
if(data){
    this.accData = data;
    console.log(this.accData, '...data');
}else if(error){
    this.accData = undefined;
    console.log(this.accData);
}
}
}
