import { LightningElement,wire } from 'lwc';
import GETACCOUNTDATA from '@salesforce/apex/accountData.getAccountData';

const COLUMNS=[
    {label : "Name", fieldName : "Name", sortable:true},
    {label : "Industry", fieldName : "Industry", sortable:true},
    {label : "Phone", fieldName : "Phone", sortable : true}

]
export default class GetTheDataOnDatatable extends LightningElement {

accData=[];
searchKey='';
columns = COLUMNS
sortBy;
sortDirection;
handleChange(event){
    this.searchKey = event.target.value;
    console.log('this.searchKey...', this.searchKey);
}

@wire(GETACCOUNTDATA, {searchKey : '$searchKey'})
wiredAccountsData({data, error}){
    if(data){
        this.accData = data;
        console.log('this.accData...', this.accData);
    }else if(error){
        this.accData = undefined;
        console.log('error....', error);
    }
}

handleSortAccountData(event) {       
    this.sortBy = event.detail.fieldName;       
    this.sortDirection = event.detail.sortDirection;       
    this.sortAccountData(event.detail.fieldName, event.detail.sortDirection);
}
sortAccountData(fieldname, direction) {
    
    let parseData = JSON.parse(JSON.stringify(this.accData));
   
    let keyValue = (a) => {
        return a[fieldname];
    };


   let isReverse = direction === 'asc' ? 1: -1;


       parseData.sort((x, y) => {
        x = keyValue(x) ? keyValue(x) : ''; 
        y = keyValue(y) ? keyValue(y) : '';
       
        return isReverse * ((x > y) - (y > x));
    });
    
    this.accData = parseData;
}
}