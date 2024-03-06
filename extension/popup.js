const DEFAULT_URL="https://piroliro.com/"
const MIN_LENGTH=4;

//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////

function update_server_input(){
    // updates the server url shown in the server_url input
    chrome.storage.local.get("serverurl", ({ serverurl }) => {
        if(serverurl==undefined){
            chrome.storage.local.set({ serverurl: DEFAULT_URL });
            serverurl=DEFAULT_URL;
        }
        
        server_url.value=serverurl;
    });
}

//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////

const toggle=document.getElementById("enabler");
const slider=document.getElementById("slider");

const uname=document.getElementById("username");
const update_name=document.getElementById("update_username");

const uid=document.getElementById("uid");

const server_url=document.getElementById("url");
const update_url=document.getElementById("update_url");

//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////

// - set defaults

// EXTENSION ENABlE STATUS FROM LAST EXECUTION
chrome.storage.local.get("isEnabled", ({ isEnabled }) => {
    toggle.checked=isEnabled;
});

// SERVER URL BY DEFAULT
update_server_input()

// opacity slider
chrome.storage.local.get("opacity_level", ({ opacity_level }) => {
    slider.value=opacity_level*100;
});

chrome.storage.local.get(["userId", "name"], ({ userId, name}) => {
    if (userId == undefined) return;
    uid.textContent=!!name? name : userId.substring(0, 10)+"...";
});

//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////

// - update values

// extension enabler
toggle.addEventListener("change", () => {
    chrome.storage.local.set({ isEnabled: toggle.checked });
});

// update opacity slider saved values
slider.addEventListener("change", () => {
    chrome.storage.local.set({ opacity_level: slider.value/100 });
});

// update saved server url value
update_url.addEventListener("click", () => {
    let url=server_url.value;

    if(url.length<MIN_LENGTH){
        server_url.value=DEFAULT_URL;
        chrome.storage.local.set({ serverurl: DEFAULT_URL });
    } else {
        let clean_url=url.trim(); // remove extra spaces

        // make sure that the url ends with a /
        if(clean_url[clean_url.length-1]!='/') 
            clean_url+='/'

        // save the cleaned value to memory
        chrome.storage.local.set({ serverurl: clean_url });
    }
});

update_name.addEventListener("click", () => {
    let clean_name=uname.value.replace(/[^A-Za-z0-9]/g,"");
    if(clean_name.length<MIN_LENGTH) return

    uid.textContent=clean_name

    chrome.storage.local.set({ name: clean_name });
});

