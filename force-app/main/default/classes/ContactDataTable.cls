public with sharing class ContactDataTable {
    @AuraEnabled(cacheable=true)
   public static List<Contact> contactdata(){

    List<Contact> contacts = [Select Id,LastName,Email,Phone From Contact LIMIT 10];
    return contacts;
   }
   //system.debug('contacts:'+contacts);
}