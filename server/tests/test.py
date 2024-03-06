from .. import server
from server import QuestionHandler


def test(name, exp, res):
    assert res == exp, f"❌ Test \"{name}\" (expected {exp} got {res})"
    print(f"✅ Test \"{name}\"")

if __name__ == "__main__":
    handler = QuestionHandler()
    handler.addResponse("q1", "responseA")
    handler.addResponse("q1", "responseA")
    res = handler.getQuestion("q1")
    test("Add responseA in Question1", 2, res[0]["count"])
    

    handler.addResponse("q1", "responseB")
    handler.addResponse("q1", "responseB")
    res = handler.getQuestion("q1")
    test("Add responseB in Question1", 2, res[1]["count"])

    handler.removeResponse("q1", "responseA")
    res = handler.getQuestion("q1")
    test("Remove responseA from Question1", 1, res[0]["count"])

    handler.removeResponse("q1", "responseB")
    res = handler.getQuestion("q1")
    test("Remove responseB from Question1", 1, res[1]["count"])

    handler.removeResponse("q1", "responseB")
    res = handler.getQuestion("q1")
    test("responseB missing from Question1", 1, len(res))

    print()
    print("ALL TESTS PASSED!")