import { LightningElement, api, wire } from "lwc";
import { getRecord, getFieldValue } from "lightning/uiRecordApi";

import REVENUE_FIELD from "@salesforce/schema/Account.AnnualRevenue";
import CREATED_FIELD from "@salesforce/schema/Account.CreatedDate";
import EXP_FIELD from "@salesforce/schema/Account.SLAExpirationDate__c";

const fields = [REVENUE_FIELD, CREATED_FIELD, EXP_FIELD];
export default class WiregetRecordFieldvalue extends LightningElement {

    @api recordId;

    @wire(getRecord, { recordId: "$recordId", fields })
    account;
  
    get revenue() {
      return getFieldValue(this.account.data, REVENUE_FIELD);
    }
  
    get created() {
      return getFieldValue(this.account.data, CREATED_FIELD);
    }
  
    get expiration() {
      return getFieldValue(this.account.data, EXP_FIELD);
    }
}