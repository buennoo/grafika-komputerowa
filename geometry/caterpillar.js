var gl;
var shaderProgram;
var uPMatrix;
var vertexPositionBuffer;
var vertexColorBuffer;
var vertexCoordsBuffer;
var vertexNormalBuffer;

function MatrixMul(a,b) //Mnożenie macierzy

{
  let c = [
  0,0,0,0,
  0,0,0,0,
  0,0,0,0,
  0,0,0,0
  ]
  for(let i=0;i<4;i++)
  {
    for(let j=0;j<4;j++)
    {
      c[i*4+j] = 0.0;
      for(let k=0;k<4;k++)
      {
        c[i*4+j]+= a[i*4+k] * b[k*4+j];
      }
    }
  }
  return c;
}

function createRect2(p1x,p1y,p1z,p2x,p2y,p2z,p3x,p3y,p3z,p4x,p4y,p4z)
{
  let vertexPosition = [p1x,p1y,p1z, p2x,p2y,p2z, p4x,p4y,p4z,  //Pierwszy trójkąt
                        p1x,p1y,p1z, p4x,p4y,p4z, p3x,p3y,p3z]; //Drugi trójkąt
                        
  return vertexPosition;
}

function createRectCoords(mu,mv,dau,dav,dbu,dbv)
{
  let p1u = mu;             p1v = mv;            
  let p2u = mu + dau;       p2v = mv + dav;      
  let p3u = mu + dbu;       p3v = mv + dbv;      
  let p4u = mu + dau + dbu; p4v = mv + dav + dbv;
  
  let vertexCoord = [p1u,p1v, p2u,p2v, p4u,p4v,  //Pierwszy trójkąt
                     p1u,p1v, p4u,p4v, p3u,p3v]; //Drugi trójkąt
                        
  return vertexCoord;
}

function createRectCoords2(p1u,p1v,p2u,p2v,p3u,p3v,p4u,p4v)
{
  let vertexCoord = [p1u,p1v, p2u,p2v, p4u,p4v,  //Pierwszy trójkąt
                     p1u,p1v, p4u,p4v, p3u,p3v]; //Drugi trójkąt
                        
  return vertexCoord;
}

function createRectColor(r,g,b)
{
  let vertexColor = [r,g,b, r,g,b, r,g,b,  //Pierwszy trójkąt
                     r,g,b, r,g,b, r,g,b]; //Drugi trójkąt
                        
  return vertexColor;
}

function createNormal(p1x,p1y,p1z,p2x,p2y,p2z,p3x,p3y,p3z) //Wyznaczenie wektora normalnego dla trójkąta
{
  let v1x = p2x - p1x;
  let v1y = p2y - p1y;
  let v1z = p2z - p1z;
  
  let v2x = p3x - p1x;
  let v2y = p3y - p1y;
  let v2z = p3z - p1z;
  
  let v3x =  v1y*v2z - v1z*v2y;
  let v3y =  v1z*v2x - v1x*v2z;
  let v3z =  v1x*v2y - v1y*v2x;
  
  vl = Math.sqrt(v3x*v3x+v3y*v3y+v3z*v3z); //Obliczenie długości wektora
   
  v3x/=vl; //Normalizacja na zakreś -1 1
  v3y/=vl;
  v3z/=vl;
  
  let vertexNormal = [v3x,v3y,v3z, v3x,v3y,v3z, v3x,v3y,v3z];
  return vertexNormal;
}

function startGL() 
{
  //alert("StartGL");
  let canvas = document.getElementById("canvas3D"); //wyszukanie obiektu w strukturze strony 
  gl = canvas.getContext("experimental-webgl"); //pobranie kontekstu OpenGL'u z obiektu canvas
  gl.viewportWidth = canvas.width; //przypisanie wybranej przez nas rozdzielczości do systemu OpenGL
  gl.viewportHeight = canvas.height;
  
    //Kod shaderów
  const vertextShaderSource = ` //Znak akcentu z przycisku tyldy - na lewo od przycisku 1 na klawiaturze
    precision highp float;
    attribute vec3 aVertexPosition; 
    attribute vec3 aVertexColor;
    attribute vec2 aVertexCoords;
    attribute vec3 aVertexNormal;
    uniform mat4 uMVMatrix;
    uniform mat4 uPMatrix;
    varying vec3 vPos;
    varying vec3 vColor;
    varying vec2 vTexUV;
    varying vec3 vNormal;
    void main(void) {
      gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0); //Dokonanie transformacji położenia punktów z przestrzeni 3D do przestrzeni obrazu (2D)
      vPos = aVertexPosition;
      vColor = aVertexColor;
      vTexUV = aVertexCoords;
      vNormal = aVertexNormal;
    }
  `;
  const fragmentShaderSource = `
    precision highp float;
    varying vec3 vPos;
    varying vec3 vColor;
    varying vec2 vTexUV;
    varying vec3 vNormal;
    uniform sampler2D uSampler;
    uniform vec3 uLightPosition;
    void main(void) {
       vec3 lightDirection = normalize(uLightPosition - vPos);
       float brightness = max(dot(vNormal,lightDirection), 0.0);
      //gl_FragColor = vec4(vColor,1.0); //Ustalenie stałego koloru wszystkich punktów sceny
      //gl_FragColor = texture2D(uSampler,vTexUV)*vec4(vColor,1.0); //Odczytanie punktu tekstury i przypisanie go jako koloru danego punktu renderowaniej figury
      //gl_FragColor = vec4((vNormal+vec3(1.0,1.0,1.0))/2.0,1.0); 
      gl_FragColor = clamp(texture2D(uSampler,vTexUV) * vec4(brightness,brightness,brightness,1.0),0.0,1.0);
    }
  `;
  let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER); //Stworzenie obiektu shadera 
  let vertexShader   = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(fragmentShader, fragmentShaderSource); //Podpięcie źródła kodu shader
  gl.shaderSource(vertexShader, vertextShaderSource);
  gl.compileShader(fragmentShader); //Kompilacja kodu shader
  gl.compileShader(vertexShader);
  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) { //Sprawdzenie ewentualnych błedów kompilacji
    alert(gl.getShaderInfoLog(fragmentShader));
    return null;
  }
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(vertexShader));
    return null;
  }
  
  shaderProgram = gl.createProgram(); //Stworzenie obiektu programu 
  gl.attachShader(shaderProgram, vertexShader); //Podpięcie obu shaderów do naszego programu wykonywanego na karcie graficznej
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) alert("Could not initialise shaders");  //Sprawdzenie ewentualnych błedów
  
  //Opis sceny 3D, położenie punktów w przestrzeni 3D w formacie X,Y,Z 
  let vertexPosition = []; //3 punkty po 3 składowe - X1,Y1,Z1, X2,Y2,Z2, X3,Y3,Z3 - 1 trójkąt
  
  let stepElevation = 90/8;
  let stepAngle = 360/12;
  let radius = 2.0;
  for(let elevation=-90; elevation< 90; elevation+= stepElevation)
  {
    let radiusXZ = radius*Math.cos(elevation*Math.PI/180);
    let radiusY  = radius*Math.sin(elevation*Math.PI/180);
    
    let radiusXZ2 = radius*Math.cos((elevation+stepElevation)*Math.PI/180);
    let radiusY2  = radius*Math.sin((elevation+stepElevation)*Math.PI/180);
    
    for(let angle = 0; angle < 360; angle+= stepAngle)
    {
      
      let px1 = radiusXZ*Math.cos(angle*Math.PI/180);
      let py1 = radiusY;
      let pz1 = radiusXZ*Math.sin(angle*Math.PI/180);
      
      let px2 = radiusXZ*Math.cos((angle+stepAngle)*Math.PI/180);
      let py2 = radiusY;
      let pz2 = radiusXZ*Math.sin((angle+stepAngle)*Math.PI/180);
      
      let px3 = radiusXZ2*Math.cos(angle*Math.PI/180);
      let py3 = radiusY2;
      let pz3 = radiusXZ2*Math.sin(angle*Math.PI/180);
      
      let px4 = radiusXZ2*Math.cos((angle+stepAngle)*Math.PI/180);
      let py4 = radiusY2;
      let pz4 = radiusXZ2*Math.sin((angle+stepAngle)*Math.PI/180);
      
      vertexPosition.push(...createRect2(px1,py1,pz1,px2,py2,pz2,px3,py3,pz3,px4,py4,pz4)); // Ściana XZ
    }
  }

  vertexPositionBuffer = gl.createBuffer(); //Stworzenie tablicy w pamieci karty graficznej
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPosition), gl.STATIC_DRAW);
  vertexPositionBuffer.itemSize = 3; //zdefiniowanie liczby współrzednych per wierzchołek
  vertexPositionBuffer.numItems = vertexPosition.length/9; //Zdefinoiowanie liczby trójkątów w naszym buforze
  
  //Opis sceny 3D, kolor każdego z wierzchołków
  let vertexColor = []; //3 punkty po 3 składowe - R1,G1,B1, R2,G2,B2, R3,G3,B3 - 1 trójkąt
  
  for(let elevation=-90; elevation< 90; elevation+= stepElevation)
  {
    for(let angle = 0; angle < 360; angle+= stepAngle)
    {
      vertexColor.push(...createRectColor(1.0,1.0,1.0));
    }
  }
  
  vertexColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColor), gl.STATIC_DRAW);
  vertexColorBuffer.itemSize = 3;
  vertexColorBuffer.numItems = vertexColor.length/9;
  
  let vertexCoords = []; //3 punkty po 2 składowe - U1,V1, U2,V2, U3,V3 - 1 trójkąt
  
  for(let elevation=-90; elevation< 90; elevation+= stepElevation)
  {
    for(let angle = 0; angle < 360; angle+= stepAngle)
    {
      vertexCoords.push(...createRectCoords(0,0,1,0,0,1));
      //vertexCoords.push(...createRectCoords(x/mapSizeX,y/mapSizeY,1.0/mapSizeX,0,0,1.0/mapSizeY));
    }
  }

  vertexCoordsBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexCoordsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexCoords), gl.STATIC_DRAW);
  vertexCoordsBuffer.itemSize = 2;
  vertexCoordsBuffer.numItems = vertexCoords.length/6;
  
  let vertexNormal = [];
  
  for(let elevation=-90; elevation< 90; elevation+= stepElevation)
  {
    let radiusXZ = radius*Math.cos(elevation*Math.PI/180);
    let radiusY  = radius*Math.sin(elevation*Math.PI/180);
    
    let radiusXZ2 = radius*Math.cos((elevation+stepElevation)*Math.PI/180);
    let radiusY2  = radius*Math.sin((elevation+stepElevation)*Math.PI/180);
    
    for(let angle = 0; angle < 360; angle+= stepAngle)
    {
      
      let px1 = radiusXZ*Math.cos(angle*Math.PI/180);
      let py1 = radiusY;
      let pz1 = radiusXZ*Math.sin(angle*Math.PI/180);
      
      let px2 = radiusXZ*Math.cos((angle+stepAngle)*Math.PI/180);
      let py2 = radiusY;
      let pz2 = radiusXZ*Math.sin((angle+stepAngle)*Math.PI/180);
      
      let px3 = radiusXZ2*Math.cos(angle*Math.PI/180);
      let py3 = radiusY2;
      let pz3 = radiusXZ2*Math.sin(angle*Math.PI/180);
      
      let px4 = radiusXZ2*Math.cos((angle+stepAngle)*Math.PI/180);
      let py4 = radiusY2;
      let pz4 = radiusXZ2*Math.sin((angle+stepAngle)*Math.PI/180);
      
      let p1 = Math.sqrt(px1*px1+py1*py1+pz1*pz1)
      let p2 = Math.sqrt(px2*px2+py2*py2+pz2*pz2)
      let p3 = Math.sqrt(px3*px3+py3*py3+pz3*pz3)
      let p4 = Math.sqrt(px4*px4+py4*py4+pz4*pz4)
      
      px1 /= p1
      py1 /= p1
      pz1 /= p1
      
      px2 /= p2
      py2 /= p2
      pz2 /= p2
      
      px3 /= p3
      py3 /= p3
      pz3 /= p3
      
      px4 /= p4
      py4 /= p4
      pz4 /= p4
      
      vertexNormal.push(...createRect2(px1,py1,pz1,px2,py2,pz2,px3,py3,pz3,px4,py4,pz4));
    } 
  }  

  vertexNormalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormal), gl.STATIC_DRAW);
  vertexNormalBuffer.itemSize = 3;
  vertexNormalBuffer.numItems = vertexNormal.length/9;
  
  
  textureBuffer = gl.createTexture();
  var textureImg = new Image();
  textureImg.onload = function() { //Wykonanie kodu automatycznie po załadowaniu obrazka
    gl.bindTexture(gl.TEXTURE_2D, textureBuffer);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureImg); //Faktyczne załadowanie danych obrazu do pamieci karty graficznej
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); //Ustawienie parametrów próbkowania tekstury
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  }
  textureImg.src="assets/gr.jpg"; //Nazwa obrazka

  //Buffer dla drugiej kuli

  textureBuffer2 = gl.createTexture();
  var textureImg2 = new Image();
  textureImg2.onload = function() { //Wykonanie kodu automatycznie po załadowaniu obrazka
    gl.bindTexture(gl.TEXTURE_2D, textureBuffer2);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureImg2); //Faktyczne załadowanie danych obrazu do pamieci karty graficznej
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); //Ustawienie parametrów próbkowania tekstury
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  }
  textureImg2.src="assets/worm.jpg"; //Nazwa obrazka

  // Buffer dla trzeciej kuli
  textureBuffer3 = gl.createTexture();
  var textureImg3 = new Image();
  textureImg3.onload = function() { //Wykonanie kodu automatycznie po załadowaniu obrazka
      gl.bindTexture(gl.TEXTURE_2D, textureBuffer3);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureImg); //Faktyczne załadowanie danych obrazu do pamieci karty graficznej
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); //Ustawienie parametrów próbkowania tekstury
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  }
  textureImg3.src="assets/worm.jpg"; //Nazwa obrazka

  //Buffer dla 4 kuli
  textureBuffer4 = gl.createTexture();
  var textureImg4 = new Image();
  textureImg4.onload = function() { //Wykonanie kodu automatycznie po załadowaniu obrazka
      gl.bindTexture(gl.TEXTURE_2D, textureBuffer4);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureImg4); //Faktyczne załadowanie danych obrazu do pamieci karty graficznej
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); //Ustawienie parametrów próbkowania tekstury
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  }
  textureImg4.src="assets/gr.jpg"; //Nazwa obrazka
  
  //Buffer dla 5 kuli
  textureBuffer5 = gl.createTexture();
  var textureImg5 = new Image();
  textureImg5.onload = function() { //Wykonanie kodu automatycznie po załadowaniu obrazka
      gl.bindTexture(gl.TEXTURE_2D, textureBuffer5);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureImg5); //Faktyczne załadowanie danych obrazu do pamieci karty graficznej
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); //Ustawienie parametrów próbkowania tekstury
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  }
  textureImg5.src="assets/worm.jpg"; //Nazwa obrazka

  //Buffer dla 6 kuli
  textureBuffer6 = gl.createTexture();
  var textureImg6 = new Image();
  textureImg6.onload = function() { //Wykonanie kodu automatycznie po załadowaniu obrazka
      gl.bindTexture(gl.TEXTURE_2D, textureBuffer6);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureImg6); //Faktyczne załadowanie danych obrazu do pamieci karty graficznej
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); //Ustawienie parametrów próbkowania tekstury
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  }
  textureImg6.src="assets/gr.jpg"; //Nazwa obrazka


  //Buffer dla 7 kuli
  textureBuffer7 = gl.createTexture();
  var textureImg7 = new Image();
  textureImg7.onload = function() { //Wykonanie kodu automatycznie po załadowaniu obrazka
      gl.bindTexture(gl.TEXTURE_2D, textureBuffer7);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureImg7); //Faktyczne załadowanie danych obrazu do pamieci karty graficznej
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); //Ustawienie parametrów próbkowania tekstury
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  }
  textureImg7.src="assets/worm.jpg"; //Nazwa obrazka

  //Buffer dla 8 kuli
  textureBuffer8 = gl.createTexture();
  var textureImg8 = new Image();
  textureImg8.onload = function() { //Wykonanie kodu automatycznie po załadowaniu obrazka
      gl.bindTexture(gl.TEXTURE_2D, textureBuffer8);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureImg8); //Faktyczne załadowanie danych obrazu do pamieci karty graficznej
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); //Ustawienie parametrów próbkowania tekstury
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  }
  textureImg8.src="assets/worm.jpg"; //Nazwa obrazka

  //Macierze opisujące położenie wirtualnej kamery w przestrzenie 3D
  let aspect = gl.viewportWidth/gl.viewportHeight;
  let fov = 45.0 * Math.PI / 180.0; //Określenie pola widzenia kamery
  let zFar = 100.0; //Ustalenie zakresów renderowania sceny 3D (od obiektu najbliższego zNear do najdalszego zFar)
  let zNear = 0.1;
  uPMatrix = [
   1.0/(aspect*Math.tan(fov/2)),0                           ,0                         ,0                            ,
   0                         ,1.0/(Math.tan(fov/2))         ,0                         ,0                            ,
   0                         ,0                           ,-(zFar+zNear)/(zFar-zNear)  , -1,
   0                         ,0                           ,-(2*zFar*zNear)/(zFar-zNear) ,0.0,
  ];
  Tick();
} 
//let angle = 45.0; //Macierz transformacji świata - określenie położenia kamery

var angleZ = 0.0;
var angleY = 0.0;
var angleX = 0.0;
var tz = -8.0;
//Do sterowania prawo-lewo
var tx = 0.0;

var lightX = 10;
var lightY = 0;
var lightZ = 0;

// polozenie 1 kuli
var objectx = -2.0;
var objecty = 0.0;
var objectz = -3.0;

var scale = 0.7;

// polozenie drugiej kuli
var object2x = 0.0;
var object2y = 1.0;
var object2z = -3.0;

var scale2 = 0.6;

// polozenie trzeciej kuli
var object3x = 2.0;
var object3y = 0.0;
var object3z = -3.0;

var scale3 = 0.7;

// polozenie 4 kuli
var object4x = 4.0;
var object4y = 1.0;
var object4z = -3.0;

var scale4 = 0.6;

// polozenie 5 kuli
var object5x = 6.0;
var object5y = 0.0;
var object5z = -3.0;

var scale5 = 0.7;

// polozenie 6 kuli
var object6x = 8.0;
var object6y = 1.0;
var object6z = -3.0;

var scale6 = 0.6;

// polozenie 7 kuli
var object7x = -4.0;
var object7y = 1.0;
var object7z = -3.0;

var scale7 = 0.6;

// polozenie 8 kuli
var object8x = 10.0;
var object8y = 0.0;
var object8z = -3.0;

var scale8 = 0.6;

function Tick()
{  
  let uMVMatrix = [
  1,0,0,0, //Macierz jednostkowa
  0,1,0,0,
  0,0,1,0,
  0,0,0,1
  ];
  
  let uMVRotZ = [
  +Math.cos(angleZ*Math.PI/180.0),+Math.sin(angleZ*Math.PI/180.0),0,0,
  -Math.sin(angleZ*Math.PI/180.0),+Math.cos(angleZ*Math.PI/180.0),0,0,
  0,0,1,0,
  0,0,0,1
  ];
  
  let uMVRotY = [
  +Math.cos(angleY*Math.PI/180.0),0,-Math.sin(angleY*Math.PI/180.0),0,
  0,1,0,0,
  +Math.sin(angleY*Math.PI/180.0),0,+Math.cos(angleY*Math.PI/180.0),0,
  0,0,0,1
  ];
  
  let uMVRotX = [
  1,0,0,0,
  0,+Math.cos(angleX*Math.PI/180.0),+Math.sin(angleX*Math.PI/180.0),0,
  0,-Math.sin(angleX*Math.PI/180.0),+Math.cos(angleX*Math.PI/180.0),0,
  0,0,0,1
  ];
  
  let uMVTranslateZ = [
  1,0,0,0,
  0,1,0,0,
  0,0,1,0,
  0,0,tz,1
  ];

  let uMVTranslateX = [
    1,0,0,0,
    0,1,0,0,
    0,0,1,0,
    tx,0,0,1
  ];

  let uMVScale = [
    scale,0,0,0,
    0,scale,0,0,
    0,0,scale,0,
    0,0,0,1
  ];
  let uMVObject = [
    1,0,0,0,
    0,1,0,0,
    0,0,1,0,
    objectx,objecty,objectz,1
    ];

  uMVMatrix = MatrixMul(uMVMatrix,uMVScale);
  uMVMatrix = MatrixMul(uMVMatrix,uMVObject);

  uMVMatrix = MatrixMul(uMVMatrix,uMVRotX);
  uMVMatrix = MatrixMul(uMVMatrix,uMVRotY);
  uMVMatrix = MatrixMul(uMVMatrix,uMVRotZ);
  uMVMatrix = MatrixMul(uMVMatrix,uMVTranslateZ);
  uMVMatrix = MatrixMul(uMVMatrix,uMVTranslateX);

  //alert(uPMatrix);

  // Macierze drugiej kuli
  let uMVMatrix2 = [
    1,0,0,0, //Macierz jednostkowa
    0,1,0,0,
    0,0,1,0,
    0,0,0,1
  ];

  let uMVScale2 = [
    scale2,0,0,0,
    0,scale2,0,0,
    0,0,scale2,0,
    0,0,0,1
  ];

  let uMVObject2 = [
    1,0,0,0,
    0,1,0,0,
    0,0,1,0,
    object2x,object2y,object2z,1
  ];

  uMVMatrix2 = MatrixMul(uMVMatrix2,uMVScale2);
  uMVMatrix2 = MatrixMul(uMVMatrix2,uMVObject2);
  uMVMatrix2 = MatrixMul(uMVMatrix2,uMVRotX);
  uMVMatrix2 = MatrixMul(uMVMatrix2,uMVRotY);
  uMVMatrix2 = MatrixMul(uMVMatrix2,uMVRotZ);
  uMVMatrix2 = MatrixMul(uMVMatrix2,uMVTranslateZ);
  uMVMatrix2 = MatrixMul(uMVMatrix2,uMVTranslateX);
  // Macierze trzeciej kuli
  let uMVMatrix3 = [
    1,0,0,0, //Macierz jednostkowa
    0,1,0,0,
    0,0,1,0,
    0,0,0,1
  ];

  let uMVScale3 = [
    scale3,0,0,0,
    0,scale3,0,0,
    0,0,scale3,0,
    0,0,0,1
  ];

  let uMVObject3 = [
    1,0,0,0,
    0,1,0,0,
    0,0,1,0,
    object3x,object3y,object3z,1
  ];

  uMVMatrix3 = MatrixMul(uMVMatrix3,uMVScale3);
  uMVMatrix3 = MatrixMul(uMVMatrix3,uMVObject3);
  uMVMatrix3 = MatrixMul(uMVMatrix3,uMVRotX);
  uMVMatrix3 = MatrixMul(uMVMatrix3,uMVRotY);
  uMVMatrix3 = MatrixMul(uMVMatrix3,uMVRotZ);
  uMVMatrix3 = MatrixMul(uMVMatrix3,uMVTranslateZ);
  uMVMatrix3 = MatrixMul(uMVMatrix3,uMVTranslateX);

  // Macierze 4 kuli
  let uMVMatrix4 = [
      1,0,0,0, //Macierz jednostkowa
      0,1,0,0,
      0,0,1,0,
      0,0,0,1
  ];

  let uMVScale4 = [
      scale4,0,0,0,
      0,scale4,0,0,
      0,0,scale4,0,
      0,0,0,1
  ];

  let uMVObject4 = [
      1,0,0,0,
      0,1,0,0,
      0,0,1,0,
      object4x,object4y,object4z,1
  ];

  uMVMatrix4 = MatrixMul(uMVMatrix4,uMVScale4);
  uMVMatrix4 = MatrixMul(uMVMatrix4,uMVObject4);
  uMVMatrix4 = MatrixMul(uMVMatrix4,uMVRotX);
  uMVMatrix4 = MatrixMul(uMVMatrix4,uMVRotY);
  uMVMatrix4 = MatrixMul(uMVMatrix4,uMVRotZ);
  uMVMatrix4 = MatrixMul(uMVMatrix4,uMVTranslateZ);
  uMVMatrix4 = MatrixMul(uMVMatrix4,uMVTranslateX);

  // Macierze 5 kuli
  let uMVMatrix5 = [
    1,0,0,0, //Macierz jednostkowa
    0,1,0,0,
    0,0,1,0,
    0,0,0,1
  ];

  let uMVScale5 = [
      scale5,0,0,0,
      0,scale5,0,0,
      0,0,scale5,0,
      0,0,0,1
  ];

  let uMVObject5 = [
      1,0,0,0,
      0,1,0,0,
      0,0,1,0,
      object5x,object5y,object5z,1
  ];

  uMVMatrix5 = MatrixMul(uMVMatrix5,uMVScale5);
  uMVMatrix5 = MatrixMul(uMVMatrix5,uMVObject5);
  uMVMatrix5 = MatrixMul(uMVMatrix5,uMVRotX);
  uMVMatrix5 = MatrixMul(uMVMatrix5,uMVRotY);
  uMVMatrix5 = MatrixMul(uMVMatrix5,uMVRotZ);
  uMVMatrix5 = MatrixMul(uMVMatrix5,uMVTranslateZ);
  uMVMatrix5 = MatrixMul(uMVMatrix5,uMVTranslateX);

  // Macierze 6 kuli
  let uMVMatrix6 = [
      1,0,0,0, //Macierz jednostkowa
      0,1,0,0,
      0,0,1,0,
      0,0,0,1
  ];

  let uMVScale6 = [
      scale6,0,0,0,
      0,scale6,0,0,
      0,0,scale6,0,
      0,0,0,1
  ];

  let uMVObject6 = [
      1,0,0,0,
      0,1,0,0,
      0,0,1,0,
      object6x,object6y,object6z,1
  ];

  uMVMatrix6 = MatrixMul(uMVMatrix6,uMVScale6);
  uMVMatrix6 = MatrixMul(uMVMatrix6,uMVObject6);
  uMVMatrix6 = MatrixMul(uMVMatrix6,uMVRotX);
  uMVMatrix6 = MatrixMul(uMVMatrix6,uMVRotY);
  uMVMatrix6 = MatrixMul(uMVMatrix6,uMVRotZ);
  uMVMatrix6 = MatrixMul(uMVMatrix6,uMVTranslateZ);
  uMVMatrix6 = MatrixMul(uMVMatrix6,uMVTranslateX);

  // Macierze 7 kuli
  let uMVMatrix7 = [
    1,0,0,0, //Macierz jednostkowa
    0,1,0,0,
    0,0,1,0,
    0,0,0,1
  ];

  let uMVScale7 = [
    scale7,0,0,0,
    0,scale7,0,0,
    0,0,scale7,0,
    0,0,0,1
  ];

  let uMVObject7 = [
    1,0,0,0,
    0,1,0,0,
    0,0,1,0,
    object7x,object7y,object7z,1
  ];

  uMVMatrix7 = MatrixMul(uMVMatrix7,uMVScale7);
  uMVMatrix7 = MatrixMul(uMVMatrix7,uMVObject7);
  uMVMatrix7 = MatrixMul(uMVMatrix7,uMVRotX);
  uMVMatrix7 = MatrixMul(uMVMatrix7,uMVRotY);
  uMVMatrix7 = MatrixMul(uMVMatrix7,uMVRotZ);
  uMVMatrix7 = MatrixMul(uMVMatrix7,uMVTranslateZ);
  uMVMatrix7 = MatrixMul(uMVMatrix7,uMVTranslateX);

  // Macierze 8 kuli
  let uMVMatrix8 = [
    1,0,0,0, //Macierz jednostkowa
    0,1,0,0,
    0,0,1,0,
    0,0,0,1
  ];

  let uMVScale8 = [
    scale8,0,0,0,
    0,scale8,0,0,
    0,0,scale8,0,
    0,0,0,1
  ];

  let uMVObject8 = [
    1,0,0,0,
    0,1,0,0,
    0,0,1,0,
    object8x,object8y,object8z,1
  ];

  uMVMatrix8 = MatrixMul(uMVMatrix8,uMVScale8);
  uMVMatrix8 = MatrixMul(uMVMatrix8,uMVObject8);
  uMVMatrix8 = MatrixMul(uMVMatrix8,uMVRotX);
  uMVMatrix8 = MatrixMul(uMVMatrix8,uMVRotY);
  uMVMatrix8 = MatrixMul(uMVMatrix8,uMVRotZ);
  uMVMatrix8 = MatrixMul(uMVMatrix8,uMVTranslateZ);
  uMVMatrix8 = MatrixMul(uMVMatrix8,uMVTranslateX);

  //Render Scene
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight); 
  gl.clearColor(0.0,1.0,0.1,0.3); //Wyczyszczenie obrazu kolorem czerwonym
  gl.clearDepth(1.0);             //Wyczyścienie bufora głebi najdalszym planem
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.useProgram(shaderProgram)   //Użycie przygotowanego programu shaderowego
  
  gl.enable(gl.DEPTH_TEST);           // Włączenie testu głębi - obiekty bliższe mają przykrywać obiekty dalsze
  gl.depthFunc(gl.LEQUAL);            // 
  
  gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "uPMatrix"), false, new Float32Array(uPMatrix)); //Wgranie macierzy kamery do pamięci karty graficznej
  gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "uMVMatrix"), false, new Float32Array(uMVMatrix));
  
  gl.enableVertexAttribArray(gl.getAttribLocation(shaderProgram, "aVertexPosition"));  //Przekazanie położenia
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
  gl.vertexAttribPointer(gl.getAttribLocation(shaderProgram, "aVertexPosition"), vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
  
  gl.enableVertexAttribArray(gl.getAttribLocation(shaderProgram, "aVertexColor"));  //Przekazanie kolorów
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  gl.vertexAttribPointer(gl.getAttribLocation(shaderProgram, "aVertexColor"), vertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
  
  gl.enableVertexAttribArray(gl.getAttribLocation(shaderProgram, "aVertexCoords"));  //Pass the geometry
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexCoordsBuffer);
  gl.vertexAttribPointer(gl.getAttribLocation(shaderProgram, "aVertexCoords"), vertexCoordsBuffer.itemSize, gl.FLOAT, false, 0, 0);
  
  gl.enableVertexAttribArray(gl.getAttribLocation(shaderProgram, "aVertexNormal"));  //Przekazywanie wektorów normalnych
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
  gl.vertexAttribPointer(gl.getAttribLocation(shaderProgram, "aVertexNormal"), vertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);
  
  gl.uniform3f(gl.getUniformLocation(shaderProgram, "uLightPosition"),lightX,lightY,lightZ);
  
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, textureBuffer);
  gl.uniform1i(gl.getUniformLocation(shaderProgram, "uSampler"), 0);
  
  gl.drawArrays(gl.TRIANGLES, 0, vertexPositionBuffer.numItems*vertexPositionBuffer.itemSize); //Faktyczne wywołanie rendrowania

  // Renderowanie drugiej kuli
  gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "uMVMatrix"), false, new Float32Array(uMVMatrix2));
  gl.bindTexture(gl.TEXTURE_2D, textureBuffer2);
  gl.drawArrays(gl.TRIANGLES, 0, vertexPositionBuffer.numItems*vertexPositionBuffer.itemSize); //Faktyczne wywołanie rendrowania

  // Renderowanie drugiej kuli
  gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "uMVMatrix"), false, new Float32Array(uMVMatrix3));
  gl.bindTexture(gl.TEXTURE_2D, textureBuffer3);
  gl.drawArrays(gl.TRIANGLES, 0, vertexPositionBuffer.numItems*vertexPositionBuffer.itemSize); //Faktyczne wywołanie rendrowania

  //Renderowanie 4 kuli
  gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "uMVMatrix"), false, new Float32Array(uMVMatrix4));
  gl.bindTexture(gl.TEXTURE_2D, textureBuffer4);
  gl.drawArrays(gl.TRIANGLES, 0, vertexPositionBuffer.numItems*vertexPositionBuffer.itemSize); //Faktyczne wywołanie rendrowania
   
  //Renderowanie 5 kuli
  gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "uMVMatrix"), false, new Float32Array(uMVMatrix5));
  gl.bindTexture(gl.TEXTURE_2D, textureBuffer5);
  gl.drawArrays(gl.TRIANGLES, 0, vertexPositionBuffer.numItems*vertexPositionBuffer.itemSize); //Faktyczne wywołanie rendrowania

  //Renderowanie 6 kuli
  gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "uMVMatrix"), false, new Float32Array(uMVMatrix6));
  gl.bindTexture(gl.TEXTURE_2D, textureBuffer6);
  gl.drawArrays(gl.TRIANGLES, 0, vertexPositionBuffer.numItems*vertexPositionBuffer.itemSize); //Faktyczne wywołanie rendrowania

  //Renderowanie 7 kuli
  gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "uMVMatrix"), false, new Float32Array(uMVMatrix7));
  gl.bindTexture(gl.TEXTURE_2D, textureBuffer7);
  gl.drawArrays(gl.TRIANGLES, 0, vertexPositionBuffer.numItems*vertexPositionBuffer.itemSize); //Faktyczne wywołanie rendrowania

  //Renderowanie 8 kuli
  gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "uMVMatrix"), false, new Float32Array(uMVMatrix8));
  gl.bindTexture(gl.TEXTURE_2D, textureBuffer8);
  gl.drawArrays(gl.TRIANGLES, 0, vertexPositionBuffer.numItems*vertexPositionBuffer.itemSize); //Faktyczne wywołanie rendrowania

  setTimeout(Tick,100);
}
function handlekeydown(e)
{
 // Q W E A S D
 if(e.keyCode==87) angleX=angleX+1.0; //W
 if(e.keyCode==83) angleX=angleX-1.0; //S
 if(e.keyCode==68) angleY=angleY+1.0;
 if(e.keyCode==65) angleY=angleY-1.0;
 if(e.keyCode==81) angleZ=angleZ+1.0;
 if(e.keyCode==69) angleZ=angleZ-1.0;
 //alert(e.keyCode);
 //alert(angleX);
 
 //U I O J K L
 if(e.keyCode==76) lightX=lightX+0.1;
 if(e.keyCode==74) lightX=lightX-0.1;
 if(e.keyCode==73) lightY=lightY+0.1;
 if(e.keyCode==75) lightY=lightY-0.1;
 if(e.keyCode==85) lightZ=lightZ+0.1;
 if(e.keyCode==79) lightZ=lightZ-0.1;

  //NOWE
  if(e.keyCode==84) tz=tz-1.0;
  if(e.keyCode==71) tz=tz+1.0;
  if(e.keyCode==70) tx=tx+1.0;
  if(e.keyCode==72) tx=tx-1.0;
}