# for rendering position of objects

def position(x):
    y = x+2
    print(f"""
    //Top
    -{x}.0, +1.0, -1.0,  -{x}.0, +1.0, +1.0,  -{y}.0, +1.0, +1.0, //3 punkty po 3 składowe - X1,Y1,Z1, X2,Y2,Z2, X3,Y3,Z3 - 1 trójkąt
    -{x}.0, +1.0, -1.0,  -{y}.0, +1.0, +1.0,  -{y}.0, +1.0, -1.0,
    //Left
    -{y}.0, -1.0, +1.0,  -{y}.0, +1.0, +1.0,  -{y}.0, -1.0, -1.0,
    -{y}.0, -1.0, -1.0,  -{y}.0, +1.0, +1.0,  -{y}.0, +1.0, -1.0,
    //Right
    -{x}.0, +1.0, +1.0,  -{x}.0, -1.0, +1.0,  -{x}.0, -1.0, -1.0,
    -{x}.0, +1.0, +1.0,  -{x}.0, -1.0, -1.0,  -{x}.0, +1.0, -1.0,
    //Front
    -{y}.0, -1.0, +1.0,  -{y}.0, +1.0, +1.0,  -{x}.0, -1.0, +1.0,
    -{x}.0, +1.0, +1.0,  -{x}.0, -1.0, +1.0,  -{y}.0, +1.0, +1.0,
    //Back
    -{y}.0, +1.0, -1.0,  -{y}.0, -1.0, -1.0,  -{x}.0, -1.0, -1.0,
    -{y}.0, +1.0, -1.0,  -{x}.0, -1.0, -1.0,  -{x}.0, +1.0, -1.0,
    //Bottom
    -{x}.0, -1.0, +1.0,  -{x}.0, -1.0, -1.0,  -{y}.0, -1.0, +1.0,
    -{y}.0, -1.0, +1.0,  -{x}.0, -1.0, -1.0,  -{y}.0, -1.0, -1.0,
    """)

# each time +4
position(33)