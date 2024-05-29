import { LightningElement, api, track} from 'lwc';
import saveData from '@salesforce/apex/DataController.saveData';

export default class ChildComponent2 extends LightningElement {
    @api chosenValue;
    @track age = '';
    @track sports = '';
    @track annualIncome = '';

    handleAgeChange(event) {
        this.age = event.target.value;
    }

    handleSportsChange(event) {
        this.sports = event.target.value;
    }

    handleAnnualIncomeChange(event) {
        this.annualIncome = event.target.value;
    }

    handleSave() {
        // Call Apex method to save data
        saveData({ email: '', phone: '', age: this.age, sports: this.sports, annualIncome: this.annualIncome })
            .then(() => {
                // Show success toast message or any other notification

                // Reset fields after saving
                this.age = '';
                this.sports = '';
                this.annualIncome = '';
            })
            .catch(error => {
                // Show error toast message or any other notification
            });
    }
}
