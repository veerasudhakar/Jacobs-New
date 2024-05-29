import { LightningElement,api} from 'lwc';
import NAME_FIELD from '@salesforce/schema/Account.Name';
import INDUSTRY_FIELD from '@salesforce/schema/Account.Industry';
export default class RecordViewForm extends LightningElement {

    NameField = NAME_FIELD;
    IndustryField = INDUSTRY_FIELD;
    @api recordId;
    @api objectApiName;


}