import { LightningElement,wire,track} from 'lwc';
import GetAccountList from '@salesforce/apex/getAccountList.accountList';
export default class DataTable extends LightningElement {

   
   searchkey = '';
   @wire(GetAccountList, {searchkey : '$searchkey'})
   Getaccounts;
error;

if(data){
    this.accounts = data;
}
elseif(error){
    this.accounts = undefined;
}

}