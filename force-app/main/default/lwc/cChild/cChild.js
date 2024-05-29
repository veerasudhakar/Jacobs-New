import { LightningElement,api } from 'lwc';

export default class CChild extends LightningElement {
    @api progressValue;
  handleChnage(event) {
    this.progressValue = event.target.value;
    // Creates the event with the data.
    const selectedEvent = new CustomEvent("progressvaluechange", {
      detail: this.progressValue
    });

    // Dispatches the event.
    this.dispatchEvent(selectedEvent);
  }
}