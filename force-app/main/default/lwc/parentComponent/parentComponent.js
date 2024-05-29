import { LightningElement } from 'lwc';

export default class ParentComponent extends LightningElement {
    greeting = '';

    handleChange(event){
        this.greeting = event.target.value;
    }
}
