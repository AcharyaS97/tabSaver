var currentTabs=[];
var selectedTabs=[];
var currentWindowId;
var recoveredKeys=[];
var retrievedStorageData={};
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
        if (tabs != null)
        {
 
            let listItem = $('<li class="list-group-item">');
            let color = listItem.children(':last').css('color');
            let currentURL 
            listItem.on("mouseover",function(){
                $(this).children(':last').css("color","red");
            });
            listItem.on("mouseout",function(){
                $(this).children(':last').css("color","black");
            })
            listItem.click(function(){  
                console.log("hii");
                let currentURL = $(this).children(':first')[0].innerText;
                console.log(currentURL);
                chrome.tabs.create({url:currentURL},function(t){
                    console.log(t);
                })
            })

            let listLink = $('<a>',{
                href:tabs.url,
                target:"_blank"
            })
            listLink.append(tabs.url);
            listItem.append(listLink);
            listOverall.append(listItem);
        }
    }

    return listOverall;
}

$(document).ready(function(){

    chrome.windows.getCurrent(function(data){
        currentWindowId = data.id;
    })

    //To load window showing saved tab groups
    $("#savedGroupTab").click(function(){

        $(this).parent().siblings().first().removeClass("active");
        $(this).parent().addClass("active");

        //Get all of the keys and values
        chrome.storage.sync.get(null,function(data){
            retrievedStorageData = data;
            let keys = Object.keys(data); 
            for (key of keys){
                if (key != null)
                {
                    let listItem = $('<li class="list-group-item hvr-icon-hang">');
                    let badgeSpan = $('<span class="badge badge-pill badge-primary">');
                    let a = $('<span class="hvr-icon-hang float-center">');
                    let headerSpan = $('<span class="float-left">');
                    let restoreSpan = $('<span class="float-right">');

                    let btnRestoreAll = $('<button class="btn btn-light float-right">Restore All In Group</button>');
                    //let newWindowCheckBox = $('<input class="float-right" id="newWindow">');
                    let newWindowCheckBox =$('<input>',{
                        type:"checkbox",
                        class:"float-right",
                        id:"newWindow"
                    })

                    btnRestoreAll.click(function(){
                        let urls = []
                        let liOverall = $(this).siblings(':first')[0];
                        let groupName = liOverall.innerText;
                        let tabList = retrievedStorageData[groupName];
                        for (tabs of tabList){
                            urls.push(tabs.url);
                        }
                        console.log(tabList);
                        newWind = $("#newWindow").is(':checked');
                        //Get the list of urls for the current group
                       // let newWind = $('#newWindow').attr('checked')?true:false;
                        console.log(newWind);
                        if (newWind === true)
                        {
                            console.log("Hii");
                            chrome.windows.create({url:urls})
                        }

                        else if (newWind == false){
                            for (let i = 0 ; i < urls.length ; i++)
                            {
                                chrome.tabs.create({url:urls[i]})
                            }
                        }
                    })

                    let icon = $('<i class="fas fa-chevron-down hvr-icon"></i>');  
                    
                    icon.click(function(){
                        icon.parent().siblings(':last').slideToggle();
                    });

                    restoreSpan.append(btnRestoreAll);
                    restoreSpan.append(newWindowCheckBox)
                    a.append(icon);

                    if (!recoveredKeys.includes(key)){
                        recoveredKeys.push(key);
                        badgeSpan.append(data[key].length);
                        headerSpan.append(key);
                        listItem.append(headerSpan);
                        listItem.append(badgeSpan);
                        listItem.append(a);
                        listItem.append(restoreSpan);
                        listItem.append(btnRestoreAll);
                        listItem.append(newWindowCheckBox);
                        let listContents = loadUserGroups(key,data);
                        listItem.append(listContents);
                        $("#savedTabList").append(listItem);
                    }
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
        var cTabs = currentTabs;
        var listOfRows = $("#tableBody").children();
        var listOfTrs = $.makeArray(listOfRows);
        if(this.checked){ 
            //console.log(listOfTrs);

            for (rows of listOfRows){
                let p = rows.firstElementChild.firstElementChild;
                let insertIndex = parseInt(p.innerText);
                let checkBox = rows.firstElementChild.lastElementChild;
                checkBox.checked = true;

                if (selectedTabs.length == 0)
                {
                    selectedTabs.push(currentTabs[insertIndex]);
                    continue;
                }

                // return false;

                for (let i = 0 ; i < selectedTabs.length ; i++){
                   if (selectedTabs[i].id == currentTabs[insertIndex].id)
                   {
                       break;
                   }

                   else if (i + 1 == selectedTabs.length)
                   {
                       selectedTabs.push(currentTabs[insertIndex]);
                   }
                }
            }
            console.log(selectedTabs);
            return false;
            for (var i = 0 ; i < listOfTrs.length ;i++)
            {
               var check =  listOfTrs[i].firstElementChild.lastElementChild;
               check.checked= true;
               if (!selectedTabs.includes(currentTabs[i]))
               {
                   console.log(i);
                   console.log(selectedTabs);
                   selectedTabs.push(currentTabs[i]);
               }
               
            }
        }
    
        else{
            for (var i = 0 ; i < listOfTrs.length ; i++)
            {
               var check =  listOfTrs[i].firstElementChild.lastElementChild;
               check.checked= false;
               selectedTabs.splice(selectedTabs.indexOf(currentTabs[i]),1);
            }
        }
        console.log(selectedTabs);
    });
        //Query chrome tabs api for all tabs in the current window and output to options list
        chrome.tabs.query({currentWindow:true},function(data){
        currentTabs = data;
        console.log(currentTabs);
        console.log(currentTabs[0]);
        var titleArray=[];
       // let checkBoxTd = '<td><input class="listCheckBoxes" type = "checkbox"></input></td>';
        for (var i = 0 ; i < currentTabs.length  ; i++)
        {
            let title = currentTabs[i].title;
            if (currentTabs[i].selected == false)
            {
                let checkBoxTd = $('<td>');

                let checkBox = $('<input>',{
                    type:"checkbox"
                });
                
                let labelName = $('<label>',{
                    innerText:title
                });
                
                let checkIndex = $('<p hidden = "true">');
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

             //   currentTabs.push(pageURL);  

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

