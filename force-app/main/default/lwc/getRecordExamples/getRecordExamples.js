import { LightningElement, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import NAME_FIELD from '@salesforce/schema/Account.Name'
import WEBSITE_FIELD from '@salesforce/schema/Account.Website'
import PHONE_FIELD from '@salesforce/schema/Account.Phone'
import INDUSTRY_FIELD from '@salesforce/schema/Account.Industry'
export default class GetRecordExamples extends LightningElement {
    
    dataId = '0015i00000oCiLHAA0'
  accData;
 
  @wire(getRecord, {
    recordId: '$dataId',
    fields: [NAME_FIELD, WEBSITE_FIELD, PHONE_FIELD, INDUSTRY_FIELD]
  })
  accountObjectData({ data, error }) {
    if (data) {
      console.log(data);
      this.accData = data.fields
      //Jelset
      console.log(error);
    }
  }
}