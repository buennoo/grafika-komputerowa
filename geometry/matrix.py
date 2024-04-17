# quick script for generating matrix, buffer and render function

#square
def generateMatrix(num) -> None:
    print(f"""
    // Macierze {num} kuli
    let uMVMatrix{num} = [
        1,0,0,0, //Macierz jednostkowa
        0,1,0,0,
        0,0,1,0,
        0,0,0,1
    ];

    let uMVScale{num} = [
        scale{num},0,0,0,
        0,scale{num},0,0,
        0,0,scale{num},0,
        0,0,0,1
    ];

    let uMVObject{num} = [
        1,0,0,0,
        0,1,0,0,
        0,0,1,0,
        object{num}x,object{num}y,object{num}z,1
    ];

    uMVMatrix{num} = MatrixMul(uMVMatrix{num},uMVScale{num});
    uMVMatrix{num} = MatrixMul(uMVMatrix{num},uMVObject{num});
    uMVMatrix{num} = MatrixMul(uMVMatrix{num},uMVRotX);
    uMVMatrix{num} = MatrixMul(uMVMatrix{num},uMVRotY);
    uMVMatrix{num} = MatrixMul(uMVMatrix{num},uMVRotZ);
    uMVMatrix{num} = MatrixMul(uMVMatrix{num},uMVTranslateZ);
    """)

def generateBuffer(num) -> None:
    print(f"""
    //Buffer dla {num} kuli
    textureBuffer{num} = gl.createTexture();
    var textureImg{num} = new Image();
    textureImg{num}.onload = function() {{ //Wykonanie kodu automatycznie po załadowaniu obrazka
        gl.bindTexture(gl.TEXTURE_2D, textureBuffer{num});
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureImg{num}); //Faktyczne załadowanie danych obrazu do pamieci karty graficznej
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); //Ustawienie parametrów próbkowania tekstury
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }}
    textureImg{num}.src="assets/worm.jpg"; //Nazwa obrazka
    """)

def generateRendering(num) -> None:
    print(f"""
    //Renderowanie {num} kuli
    gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "uMVMatrix"), false, new Float32Array(uMVMatrix{num}));
    gl.bindTexture(gl.TEXTURE_2D, textureBuffer{num});
    gl.drawArrays(gl.TRIANGLES, 0, vertexPositionBuffer.numItems*vertexPositionBuffer.itemSize); //Faktyczne wywołanie rendrowania
    """)

#generateMatrix(input("Podaj liczbe: "))
generateBuffer(input("Podaj liczbe: "))
generateRendering(input("Podaj liczbe: "))