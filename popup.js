$(document).ready(function(){
    chrome.storage.sync.get(null,function(tabData){
        Object.keys(tabData);
        
    })
})