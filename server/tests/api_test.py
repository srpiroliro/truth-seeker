import requests
from pprint import pprint

API_URL="http://127.0.0.1:5000"

def test(name, exp, res):
    assert res == exp, f"❌ Test \"{name}\" (expected {exp} got {res})"
    print(f"✅ Test \"{name}\"")

def addResponse(question:str, response:str):
    return requests.post(url=API_URL, json={"question":question, "response":response})

def getQuestion(question:str):
    return requests.get(url=f"{API_URL}?question={question}", json={"question":question}).json()["data"]

def changeAnswer(question:str, new:str, old:str):
    return requests.put(url=API_URL, json={"question":question, "old_response":old, "new_response":new})

if __name__ == "__main__":
    print("server.py SHOULD BE RUNNING!"); input("continue? ")
    
    # clients answering same thing.
    addResponse("q1", "responseA") # client 1
    addResponse("q1", "responseA") # client 2
    addResponse("q1", "responseA") # client 3
    test("Add 3 responseA in Question1", 3, getQuestion("q1")[0]["count"])

    addResponse("q1", "responseB") # client 4
    addResponse("q1", "responseB") # client 5
    test("Add 2 responseA in Question1", 2, len(getQuestion("q1")))
    
    addResponse("q2", "responseC") # client 1
    addResponse("q2", "responseC") # client 2
    addResponse("q2", "responseD") # client 3
    addResponse("q2", "responseE") # client 4
    test("Add 4 responses in Question2", 3, len(getQuestion("q2")))

    changeAnswer("q2", "responseD", "responseC") # client 1
    res = getQuestion("q2")
    cntC=cntD=0
    for i in res:
        if i["answer"]=="responseC": cntC = i["count"]
        elif i["answer"]=="responseD": cntD = i["count"]

    test("Change q2 response from responseC to responseD (D)", 2, cntD)
    test("Change q2 response from responseC to responseD (C)", 1, cntC)

    print()
    print("ALL TESTS PASSED!")