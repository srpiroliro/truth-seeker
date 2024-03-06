const SERVER_URL = "http://127.0.0.1:5000";
const Q2ANSWER=0;
const TIMEOUT=5;
const QUESTION_TOOLTIP="(i)";
const URL_KEYWORDS=["quiz", "attempt"]; // domains could vary, but the urls should contain these keywords.


if(TIMEOUT==0){
    console.log("WARNING: TIMEOUT IS SET TO 0, THIS WILL CAUSE THE SERVER TO BE SPAMMED. PLEASE SET A TIMEOUT VALUE.")
}


// var time_post_last_result=0;
var time_get_last_result=0;
var answered_questions_counter=0;


// here the history of answers will be saved.
// possible values:
//      null - wasn't answered
//      ANSWER_TEXT - the text of X answer.
var user_answers={}
var prev_user_answers={}

function update_opacity(new_value){
    const pps=document.getElementsByClassName("pps");

    for(const element of pps){
        element.style.opacity=new_value;
    };
}
function change_elements_display(is_enabled){

    const e = document.querySelectorAll(".truth-seeker");
    if (!e) return


    e.forEach(element=>{
        element.style.display=is_enabled==1?"initial":"none";
        // element.style.visibility=is_enabled?"visible":"hidden";
    });
}

function setup_question(question){
    console.log("setting up question!")

    let question_text=get_question_text(question); // clear the question text
    if(!question_text) return

    let question_parent=question.parentElement;
    
    // get all answers
    question_parent.querySelectorAll('input[type="radio"]').forEach(answer_option=>{
        // answer clicked.
        answer_option.onclick = () => handle_answer_click(answer_option, question_text);
    });

    question.insertAdjacentHTML("beforeend", `<b style="margin-left:20px; opacity:0.5" class="truth-seeker"><i>${QUESTION_TOOLTIP}</i></b>`); // add the tooltip icon
}

const handle_answer_click = (option, question_text) => {
    console.log("ANSWER CLICKED!")

    // the input is located inside a tab
    let option_parent=option.parentElement,
    answer_text=get_answer_text(option_parent);

    prev_user_answers={...user_answers}; // copy old answers
    user_answers[question_text]=answer_text; // update new answer 

    // avoid user clicking multiple times on the same answer.
    if(prev_user_answers[question_text] == user_answers[question_text])
        return 0;

    chrome.storage.local.get(['userId', 'name'], ({ userId, name }) => {
        console.log("USER ID:", userId, "NAME:", name)
        if(userId==undefined){
            return -1
        }

        post2api({
            "user_id": userId,
            "name": !!name? name : userId.substring(0, 10)+"...",
            "question": question_text,
            "answers": answer_text,
            "previous_answer": prev_user_answers[question_text]
        });
        
        // increase the ammount of questions answered
        answered_questions_counter++;
    });
}

function main(){
    // check if user is doing a quiz
    if(!URL_KEYWORDS.some(keyword=>window.location.href.includes(keyword)))
        return 0;

    // get all questions
    let questions=document.getElementsByClassName("qtext");
    
    // check that question were found
    if(questions.length<=0)
        return 0;

    // get the table of quesions-answers ready.
    for(let question of questions){
        user_answers[sanetize_text(question.innerText)]=null;

    }

    for(let question of questions){

        setup_question(question);
    }
}

function get_question_data(parent, question){
    let question_text=get_question_text(question);

    // get the server url
    chrome.storage.local.get("serverurl", ({ serverurl }) => {
        if(serverurl==undefined){ 
            alert("NO SERVER URL WAS SET! try setting it in the extension popup.");
            return -1
        } 

        fetch(
            serverurl+"?question="+question_text,
            {method: 'GET',headers: {'Accept': 'application/json'}}
        ).then(response => response.json())
        .then(json => {
            visualize_answers_data(parent, json)
        });
    });
}

function visualize_answers_data(parent, answers_data){
    let answers_stats=answers_data["data"];

    console.log("ANSWERS:", answers_data)

    // check if retuned data is empty or not
    if(Object.keys(answers_stats).length===0){
        alert("no answers");
        return 
    }

    // for each answer (input type radio), place the % aside
    parent.querySelectorAll('input[type="radio"]').forEach(answer_option => {
        update_answer_percentage(answer_option, answers_stats)
    });
}

const update_answer_percentage = (answer_option, stats) => {
    let answer_parent = answer_option.parentElement; // get parent tag of the input to get the answer text
    let answer_text = get_answer_text(answer_parent);

    
    let pps=answer_parent.querySelector(".pps")
    if(pps) answer_parent.removeChild(pps);
    
    if(!(answer_text in stats)) return;

    let new_pps_data=Math.round(stats[answer_text].percentage*100);
    
    answer_parent.insertAdjacentHTML("beforeend", `

    <div class="truth-seeker tooltip-container pps" style='margin-left:10px;'>
        <b>${new_pps_data}%</b> (i)
        <span class="tooltip-text">
            <textarea readonly>${stats[answer_text].users.join('\n')}</textarea>
        </span>
    </div>
    `)

    
    
    // set the opacity levels
    chrome.storage.local.get('opacity_level').then((elm)=>{
        update_opacity(elm.opacity_level);
    });
}

function get_answer_text(parent){
    let ans=parent.querySelector(".flex-fill.ml-1");
    if(!ans) ans=parent.querySelector("label");

    let text = ans.textContent + get_img_element_urls(ans).join("");
    return sanetize_text(text)
}

function get_question_text(question){
    let text = question.textContent.replace(QUESTION_TOOLTIP, "") + get_img_element_urls(question).join("");
    return sanetize_text(text);
}

const get_img_element_urls = (element) => {
    let images=element.querySelectorAll("img");
    let urls=[];

    if(images.length>0) 
        images.forEach(image=>urls.push(image.src));

    return urls;
}

function post2api(data){
    chrome.storage.local.get("serverurl", ({ serverurl }) => {
        if(serverurl==undefined ) {
            alert("NO SERVER URL WAS SET! try setting it in the extension popup.");
            return;
        }
       
        fetch(serverurl, {
            method: "POST",
            headers: {'Content-Type': 'application/json'}, 
            body: JSON.stringify(data)
        }).then(res => console.log("RESPONSE CODE:",res.status==200, res.status))
        .catch(error => console.log("[!!] POST REQUEST FAILED:", error));
    });
}

function sanetize_text(string){
    const escaped_string = string
        .replace(/[&<>"'/,?!\.\s\n]/ig, "");

    return encodeURIComponent(escaped_string);
}


function generate_uuid(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    
    let result = '';
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}


const handle_question_click = (question) => {
    let parent=question.parentElement;
    let current_time=Date.now()/1000;

    // check if user is not spamming and if has already answered minumum Q2ASNWER number of questions. 
    if(current_time-time_get_last_result>TIMEOUT && answered_questions_counter>=Q2ANSWER){
        time_get_last_result=current_time; // update last time.

        // get the answers
        if(get_question_data(parent, question)<0){
            alert("FIX THE ISSUE AND RELOAD");
            return
        }

    }else if (current_time-time_get_last_result<=TIMEOUT){ // rate limitter was hit
        alert("chill for "+ Math.round(TIMEOUT - (current_time-time_get_last_result)) +" seconds. ")
        console.log("rate limited!",TIMEOUT - (current_time-time_get_last_result))
    }
}

function addStyle(styles) {
    /* Create style document */
    var css = document.createElement('style');
 
    if (css.styleSheet) 
        css.styleSheet.cssText = styles;
    else 
        css.appendChild(document.createTextNode(styles));
     
    /* Append style to the tag name */
    document.getElementsByTagName("head")[0].appendChild(css);
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

console.log("[ EXETNSION loaded ]")

chrome.storage.onChanged.addListener(function(changes, area){
    // was it opacity?
    if(changes.opacity_level){
        update_opacity(changes.opacity_level.newValue); // update
    }


    if(changes.isEnabled!==undefined)
        change_elements_display(changes.isEnabled.newValue); // update
});

chrome.storage.local.get('isEnabled', (elm) => {
    if(elm.isEnabled) main();
    change_elements_display(elm.isEnabled);
});

chrome.storage.local.get('userId', (elm) => {
    if (!elm.userId) {
        const newUserId = generate_uuid(44);

        chrome.storage.local.set({ userId: newUserId }, function() {
            console.log("GENERATING USER ID: ", newUserId); 
        });
    } else {
        console.log("USER ID:", elm.userId)
    }
});


// get the stats for X question whenever its clicked
document.querySelectorAll('div.qtext').forEach(question => {
    question.onclick=()=> handle_question_click(question);
});


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// load stylesheets

const css_styles = `
    .tooltip-container {
        z-index: 1; /* Place the tooltip above other elements */

        position: relative; /* Important for positioning the tooltip */
        display: inline-block; /* To keep the element within text flow */

    }
    
    .tooltip-text {
        z-index: 1; /* Place the tooltip above other elements */

        visibility: hidden; 
        background-color: #333;
        color: #fff;
        padding: 5px 10px;
        border-radius: 5px;
        position: absolute;
        opacity: 0; /* Hide by default */
        transition: opacity 0.3s; 
    }
    
    .tooltip-container:hover {
    }

    .tooltip-container:hover .tooltip-text {
        visibility: visible;
        opacity: 1;
    }
`;
window.onload = () => addStyle(css_styles);