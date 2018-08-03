var currentTabs=[];
var selectedTabs=[];

var recoveredKeys=[];

function getURL (tabURL){

    if (tabURL.startsWith("chrome-extension"))
    {
        var strings = tabURL.split('&');
        for (let i = 0 ; i < strings.length ; i++)
        {
            if (strings[i].startsWith("uri="))
            {
                return (strings[i].substring(strings[i].indexOf("http")));
            }
        }
    }

    return tabURL;
}

function storeUserGroup(groupName){

    let key = groupName;
    let jsonfile ={};
    jsonfile[key] = selectedTabs;
    let storageKeys;
    chrome.storage.sync.get(null,function(data){
        storageKeys = Object.keys(data);

        if (!storageKeys.includes(groupName.toString()))
        {  
            chrome.storage.sync.set(jsonfile,function(){
                alert("Group " + groupName + " added successfully");
                return true;
            })
        }

        else{
            alert("You already have a group named " + groupName + ". Please choose another name");
        }
    })
}

function loadUserGroups(groupName,storageData)
{
    let listOverall = $('<ul class="list-group internalList collapse">');

    for (tabs of storageData[groupName])
    {
        let listItem = $('<li class="list-group-item">');
        let listLink = $('<a>')
        listLink.append(tabs.url);
        listItem.append(listLink);
        listOverall.append(listItem);
    }

    return listOverall;
}


$(document).ready(function(){

    //To load window showing saved tab groups
    $("#savedGroupTab").click(function(){

        $(this).parent().siblings().first().removeClass("active");
        $(this).parent().addClass("active");

        //Get all of the keys and values
        chrome.storage.sync.get(null,function(data){
            let keys = Object.keys(data); 
            for (key of keys){
                let listItem = $('<li class="list-group-item hvr-icon-hang">');
                let badgeSpan = $('<span class="badge badge-pill badge-primary">');
                let a = $('<span class="hvr-icon-hang">');
                  
                let icon = $('<i class="fas fa-chevron-down hvr-icon"></i>');  

                icon.click(function(){
                    icon.parent().siblings(':last').slideToggle();
                });

                a.append(icon);

                if (!recoveredKeys.includes(key)){
                    recoveredKeys.push(key);
                    badgeSpan.append(data[key].length);

                    listItem.append(key);
                    listItem.append("        ");
                    listItem.append(badgeSpan);
                    listItem.append(a);

                    let listContents = loadUserGroups(key,data);
                    listItem.append(listContents);
                    $("#savedTabList").append(listItem);

                }
            }
        })
    })
    //To load window showing list of current tabs
    $("#addGroup").click(function(event){
        $(this).parent().siblings().last().removeClass("active");
        $(this).parent().addClass("active");
        console.log(selectedTabs.length);
        if (selectedTabs.length === 0)
        {
            alert("Add tabs to save");
        }
    
        else{
            $("#addGroupModal").modal('show');
         
            $("#submitGroup").click(function(){
                let groupName = $("#groupNameTextBox").val();
                if (groupName == "")
                {
                    alert("Pick a name for your group");
                }
                else{     
                    storeUserGroup(groupName);               
                }
            })
        }
    
        return true;
    })
    
    

    $('#selectAllCheckBox').change(function(){
        var listOfRows = $("#tableBody").children();
        var listOfTrs = $.makeArray(listOfRows);

        if(this.checked){ 
            //console.log(listOfTrs);
            for (var i = 0 ; i < listOfTrs.length ;i++)
            {
               var check =  listOfTrs[i].firstElementChild.lastElementChild;
              // var insertionIndex =listOfTrs[i].firstElementChild.firstElementChild.value
               check.checked= true;
               if (selectedTabs.indexOf(currentTabs[insertionIndex]) < 0)
               {
                   selectedTabs.push(currentTabs[i]);
               }
               
            }
        }
    
        else{
            for (var i = 0 ; i < listOfTrs.length ; i++)
            {
               var check =  listOfTrs[i].firstElementChild.lastElementChild;
               var insertionIndex =listOfTrs[i].firstElementChild.firstElementChild.value; 
               check.checked= false;
               selectedTabs.splice(selectedTabs.indexOf(currentTabs[insertionTabIndex]),1);
            }
        }
        console.log(selectedTabs);
    });
        //$(this).addClass("active");
        //Query chrome tabs api for all tabs in the current window and output to options list
        chrome.tabs.query({currentWindow:true},function(currentTabs){
        var titleArray=[];
       // let checkBoxTd = '<td><input class="listCheckBoxes" type = "checkbox"></input></td>';
        for (var i = 0 ; i < currentTabs.length  ; i++)
        {
            let title = currentTabs[i].title;
            if (currentTabs[i].active != true)
            {
                let checkBoxTd = $('<td>');

                let checkBox = $('<input>',{
                    type:"checkbox"
                });
                
                let labelName = $('<label>',{
                    innerText:title
                });
                
                let checkIndex = $('<p hidden>');
                checkIndex.append(i);

                checkBox.change(function(){
                let insertionTabIndex = $(this).siblings(':first').html();
                if (this.checked){
                    selectedTabs.push(currentTabs[insertionTabIndex]);
                }
                else{
                    selectedTabs.splice(selectedTabs.indexOf(currentTabs[insertionTabIndex]),1);
                }
                }); 
                checkBoxTd.append(checkIndex);
                checkBoxTd.append(checkBox);
                let tabURL = currentTabs[i].url;
                let pageURL = getURL(tabURL);

                currentTabs.push(pageURL);  

                let labelURL = $('<label>',{
                    innerText : pageURL
                });

                let pageNameRow = $('<td>');
                pageNameRow.append(title);
             

                let pageURLRow = $('<td>');
                pageURLRow.append(pageURL);

                let row = $('<tr/>')
                
                row.append(checkBoxTd)
                row.append(pageNameRow)
                row.append(pageURLRow);

                $('#myTable tbody').append(row);
            }
        }
    });
});

