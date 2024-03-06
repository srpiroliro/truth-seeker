from flask import Flask, Response, request, jsonify
from flask_cors import CORS

from pprint import pprint

ALLOWED_KEYS=["question","answers","previous_answer", "user_id", "name"]

class QuestionHandler():
    def __init__(self):
        self.questions = {}
        """
            {
                QUESTION(str): {
                    QUESTION_ANSWER(str): {
                        UID(str): NAME(str),
                        ...
                    },
                    ...
                }
            }
        """
    
    def add(self, question:str, response:str, user_data:dict)->None:
        """ adds an answer to stats
        example: client answers X question with Y reponse
            - questions[X][Y]+=1

        Args:
            question (str): the question in the exam.
            response (list): the clients response to this question.
        """
        self.manage_response(question, response, user_data)


    def manage_response(self, question:str, response:str, user_data:dict)->None:
        """ Manages the responses

        Args:
            question (str): the question in the exam.
            response (str) the clients response to this question.
            op (int): value to add to the counter of the question. 
        """        

        if question not in self.questions:
            self.questions[question]={}
        
        # SLOW !!!
        for answer in self.questions[question]:
            if user_data["uid"] in self.questions[question][answer]:
                del self.questions[question][answer][user_data["uid"]]
                break

        if response not in self.questions[question]:
            self.questions[question][response]={}
            
        if user_data["uid"] not in self.questions[question][response]:
            self.questions[question][response][user_data["uid"]]=""
        
        self.questions[question][response][user_data["uid"]]=user_data["name"] if user_data["name"] else user_data["uid"][:6]
        

    def get(self, question:str)->dict:
        """ returns the data of all the possible answers

        Args:
            question (list[str]): quiz question provided to the client.

        Returns:
            dict: {"answerX": {"count":Y, "percentage":Z}, ...}
        """
        question_answers = self.questions.get(question, {})

        responses = {}
        
        total_answers = sum([len(question_answers[answer]) for answer in question_answers])
        for answer in question_answers:
            if len(question_answers[answer])==0: continue
            
            responses[answer]={
                "users":list(question_answers[answer].values()),
                "percentage": 0 if total_answers==0 else float(f"{len(question_answers[answer])/total_answers:.2}")
            }

        return responses

if __name__ == "__main__":
    app = Flask(__name__)
    CORS(app)

    handler = QuestionHandler()

    @app.route('/api/',methods=['GET'])
    def getQuestion():
        """
        Returns: {
            "data":{
                "answer1":{"users": int, "percentage": float},
                ...
            }
        }
        """
        
        question = request.args.get("question")

        if question:
            if question=="all": res=handler.questions
            else: res=handler.get(question)
        else: res="don't be lookin"        

        response=jsonify({"data": res})
        response.headers.add('Access-Control-Allow-Origin', '*')
        
        return response

    @app.route('/api/',methods=['POST'])
    def addResponse():
        content=request.get_json(silent=True)

        if all(k in content for k in ALLOWED_KEYS):
            handler.add(content["question"], content["answers"], {"uid":content["user_id"], "name":content["name"]})

            response=jsonify({"data": True})
        else: response=jsonify({"error": "missing key's"})
        
        response.headers.add('Access-Control-Allow-Origin', '*')
        
        return response

    @app.route('/api/', methods=['OPTIONS'])
    def opti():
        response=""
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response

    app.run()