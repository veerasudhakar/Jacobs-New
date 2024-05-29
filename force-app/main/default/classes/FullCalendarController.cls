public with sharing class FullCalendarController {

    public class EventException extends Exception {}
    
    /**
     * @description: To retrieve the most recent events
     */
    @AuraEnabled(cacheable=true)
    public static List<Employee__c> fetchEvents() {
        return [SELECT Id, Name, Email__c, Mobile__c, start_date__c, End_date__c, status__c FROM Employee__c];
    }

    /**
     * @description To create an event from web component 
     * @param event - json string with event details - title, start and end for now
     */
   /*
    @AuraEnabled
public static Id createEvent(String event) {
    if(String.isBlank(event)){
        return null;
    }

    Map<String, Object> eventMap = (Map<String, Object>) JSON.deserializeUntyped(event);
    
    Employee__c newEmployee = new Employee__c();
    newEmployee.Name = eventMap.get('Name') != null ? (String)eventMap.get('Name') : null;
    newEmployee.Email__c = eventMap.get('Email__c') != null ? (String)eventMap.get('Email__c') : null;
    newEmployee.Mobile__c = eventMap.get('Mobile__c') != null ? (String)eventMap.get('Mobile__c') : null;

    String startDateString = eventMap.get('start_date__c') != null ? (String)eventMap.get('start_date__c') : null;
    String endDateString = eventMap.get('End_date__c') != null ? (String)eventMap.get('End_date__c') : null;

    // Convert date strings to Date type
    newEmployee.start_date__c = startDateString != null ? Date.valueOf(startDateString) : null;
    newEmployee.End_date__c = endDateString != null ? Date.valueOf(endDateString) : null;

    newEmployee.status__c = eventMap.get('status__c') != null ? (String)eventMap.get('status__c') : null;

    insert newEmployee;

    return newEmployee.Id;
}
*/
   @AuraEnabled
public static Employee__c createEvent(String event) {
    if (String.isBlank(event)) {
        return null;
    }

    Map<String, Object> eventMap = (Map<String, Object>) JSON.deserializeUntyped(event);
    
    Employee__c newEmployee = new Employee__c();
    newEmployee.Name = eventMap.get('Name') != null ? (String) eventMap.get('Name') : null;
    newEmployee.Email__c = eventMap.get('Email__c') != null ? (String) eventMap.get('Email__c') : null;
    newEmployee.Mobile__c = eventMap.get('Mobile__c') != null ? (String) eventMap.get('Mobile__c') : null;

    String startDateString = eventMap.get('start_date__c') != null ? (String) eventMap.get('start_date__c') : null;
    String endDateString = eventMap.get('End_date__c') != null ? (String) eventMap.get('End_date__c') : null;

    // Convert date strings to Date type
    newEmployee.start_date__c = startDateString != null ? Date.valueOf(startDateString) : null;
    newEmployee.End_date__c = endDateString != null ? Date.valueOf(endDateString) : null;

    newEmployee.status__c = eventMap.get('status__c') != null ? (String) eventMap.get('status__c') : null;

    insert newEmployee;

    // Return the newly created employee record
    return newEmployee;
}
    /**
     * @description To delete an event from web component 
     * @param eventid - event id to delete from the component
     */
    @AuraEnabled
    public static void deleteEvent(Id eventid) {
        
        if(eventid != null){
            delete [SELECT Id FROM Employee__c Where Id=:eventid];
        }else{
            throw new EventException('Event id is not passed');
        }

    }
}