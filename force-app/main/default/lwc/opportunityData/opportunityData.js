import { LightningElement,wire} from 'lwc';
import getOppoDetails from '@salesforce/apex/opportunityData.oppoDetails';
import {NavigationMixin} from "lightning/navigation";
const COLUMNS = [
    {
        label: "Name",
        type: "button",
        typeAttributes: { label: { fieldName: "Name" }, name: "gotoOpportunity", variant: "base" }
    },
    {label : "Amount", type : "Currency", fieldName : "Amount"},
    {label : "Phone", type: "phone", fieldName : "Phone"},
    {label : "stageName", fieldName : "StageName"},
    { label: "Close Date", type: "date", fieldName: "CloseDate" },
    { label: "Description", fieldName: "Description" },
    {
        label: "Edit",
        type: "button",
        typeAttributes: {
            label: "Edit",
            name: "editOpportunity",
            variant: "brand"
        }
    }

];
export default class OpportunityData extends NavigationMixin(LightningElement) {

   columns = COLUMNS; 
@wire(getOppoDetails,{})
OpportunitiesData;

handleRowAction(event){
if(event.detail.action.name === "gotoOpportunity"){
this[NavigationMixin.GenerateUrl]({
    type:"Standard__recordPage",
    attributes:{
        recordId: event.detial.row.Id,
        actionName : "view"
    }
}).then((url)=>{
    window.open(url, "_blank");
});
}
if(event.detail.action.name === "editOpportunity"){
    this[NavigationMixin.Navigate]({
      type : "Standard__recordPage",
      attributes:{
        recordId : event.detail.row.Id,
        actionName : "edit"
      }
    });
}
}
}