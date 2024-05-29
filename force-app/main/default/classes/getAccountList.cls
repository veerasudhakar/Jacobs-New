public with sharing class getAccountList {
    @AuraEnabled(Cacheable=true)
    public static List<Account> accountList(string searchkey){

        string key='%'+searchkey+'%';
       List<Account> accountsList = [select Id,Name,Industry from Account Where Name Like:key];
       return accountsList; 
    }
}