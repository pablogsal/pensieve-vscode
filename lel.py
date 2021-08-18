import sys

def trace(frame, *args):
    print(frame.f_code.co_name, frame.f_back.f_lineno)
# sys.setprofile(trace)

def foo(n):
    x = bar(n)
    y = baz(n)
    z = [bar(n), baz(n)]
    del y
    d = baz(n) + bar(n)
    del z

def bar(n):
    return alloc(n)

def baz(n):
    return alloc(n)

def alloc(n):
    return "a" * n

if __name__ == "__main__":
    foo(1000000)
