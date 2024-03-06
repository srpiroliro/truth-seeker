## Run
```shell
pip3 install -r requirements.txt
python3 server.py
```


## Usage
```http
# Add response to question
POST http://localhost:5000/
content-type: application/json

{
    "question": "q1",
    "response": "responseA"
}

# Get quesion percentages
GET  http://localhost:5000/
content-type: application/json

{
    "question": "q1"
}

# Change answer
PUT http://localhost:5000/
content-type: application/json

{
    "question": "q1",
    "old_response": "responseA",
    "new_response": "responseB"
}
```

## Run tests
these are not the best tests, but are tests

```
python3 test.py
```



# Notes
## Data:
- Moodle quiz example 
    - https://school.moodledemo.net/ ("Activity examples course" -> (Login) -> Quizzes (good example quiz: "Presentation and Image Editing skills") )
    - the overall style of the web is different, but the quiz style seems to be the same (from memory)
    - in lasts year test, there wasn't an option to go back or change answer. 

## Todo ideas:
- [ ] auth sys to display answers after min. X questions were answered
    - goal of this is to solve the problem with user not answering and waiting until the others answer.
- [ ] admin to see answer person by person
- [ ] add room ids
- [ ] mysql implementation ( saving in ram may be too much )