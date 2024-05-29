import { LightningElement, track, wire,api } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { getRecord } from "lightning/uiRecordApi";
import AREULIKEIPLFIELD from "@salesforce/schema/Sport__c.Are_u_Like_IPL__c";
import AREULIKERCBFIELD from "@salesforce/schema/Sport__c.Are_u_like_RCB__c";
export default class Sports1 extends LightningElement { 
	
  @track showIPLFields;
  @track showRCBFields;
  @track isshowIPLFieldsrequired;
  @track isshowRCBFieldsrequired;
  @api recordid
  @wire(getRecord, {
    recordId: "$recordid",
    fields: [AREULIKEIPLFIELD, AREULIKERCBFIELD]
  })
  emply({ data, error }) {
    if (data) {
      if (data.fields.Are_u_Like_IPL__c.value === "Yes") {
        this.showIPLFields = true;
      }
      if (data.fields.Are_u_like_RCB__c.value === "Yes") {
        this.showRCBFields = true;
      }
    } else if (error) {
      const evt = new ShowToastEvent({
        title: "Error",
        message: error.message,
        variant: "error"
      });
      this.dispatchEvent(evt);
    }
  }
  handleIPLChange(event) {
	
	if (event.target.name === 'showIPLFields') {
		console.log('showIPLFields  ',event.target.value)
		this.showIPLFields = event.target.value === 'Yes' ? true : false
		this.isshowIPLFieldsrequired = event.target.value === 'Yes' ? true : false
	} else if (event.target.name === 'showRCBFields') {
		this.showRCBFields = event.target.value === 'Yes' ? true : false
        this.isshowRCBFieldsrequired = event.target.value === 'Yes' ? true : false
	}
  }

  handleSuccess() {
	const selectedEvent = new CustomEvent("pageone", {
		detail: {
			forward: true
		}
	});
	this.dispatchEvent(selectedEvent);
	const evt = new ShowToastEvent({
		title: 'Success',
		message: 'Your record saved successfully',
		variant: 'success',
	});
	this.dispatchEvent(evt);
}
}
