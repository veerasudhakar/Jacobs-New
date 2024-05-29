public with sharing class vendorDetails {
    @AuraEnabled(cacheable=true)
    public static List<Account> getRecentAccounts(){
        return [SELECT Id, Name FROM Account ORDER BY CreatedDate DESC LIMIT 1];
    }

    @AuraEnabled(cacheable=true)
    public static List<Opportunity> getRecentOpportunities(){
        return [SELECT Id, Name FROM Opportunity ORDER BY CreatedDate DESC LIMIT 1];
    }

  @AuraEnabled
    public static void insertRecords(List<Vendor__c> records) {
        // Perform DML operation to insert the records
        System.debug('Data from lwc...'+ records);
        insert records;
    }
}