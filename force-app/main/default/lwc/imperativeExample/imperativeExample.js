import { LightningElement } from 'lwc';
import getOppoDetails from '@salesforce/apex/opportunityData.oppoDetails';
export default class ImperativeExample extends LightningElement {

    oppoData = [];
error = '';
handleChange(){
    getOppoDetails()
    .then((result)=>{
        this.oppoData = result;
console.log(this.oppoData, '........result');
    })
    .catch((error)=>{
        this.oppoData = undefined;
        this.error = error;
    })
}
   
}