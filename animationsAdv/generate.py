# quick script for generating moving robot's parts

def generateMovingPart(num):
    numSec = int(num)+1
    numThird = int(num)+2
    print(f"""
    uMMatrix6 = MatrixMul(uMMatrix{num},CreateScaleMatrix(Object{num}Sizedx,Object{num}Sizedy,Object{num}Sizedz));
    uMMatrix6 = MatrixMul(uMMatrix{num},CreateTranslationMatrix(Object{num}Sizedx,0.0,0.0)); 
    uMMatrix6 = MatrixMul(uMMatrix{num},CreateRotationZMatrix(Object{num}AngleZ));
    uMMatrix6 = MatrixMul(uMMatrix{num},CreateTranslationMatrix(Object{num}PositionX,Object{num}PositionY,Object{num}PositionZ));  
    
    uMMatrix7 = MatrixMul(uMMatrix{numSec},CreateScaleMatrix(Object{numSec}Sizedx,Object{numSec}Sizedy,Object{numSec}Sizedz));
    uMMatrix7 = MatrixMul(uMMatrix{numSec},CreateTranslationMatrix(Object{numSec}Sizedx,0.0,0.0)); 
    uMMatrix7 = MatrixMul(uMMatrix{numSec},CreateRotationZMatrix(Object{numSec}AngleZ));
    uMMatrix7 = MatrixMul(uMMatrix{numSec},CreateTranslationMatrix(Object{numSec}PositionX,Object{numSec}PositionY,Object{numSec}PositionZ));
    
    uMMatrix7 = MatrixMul(uMMatrix{numSec},CreateTranslationMatrix(Object{numSec}Sizedx,0.0,0.0)); 
    uMMatrix7 = MatrixMul(uMMatrix{numSec},CreateRotationZMatrix(Object{numSec}AngleZ));
    uMMatrix7 = MatrixMul(uMMatrix{numSec},CreateTranslationMatrix(Object{numSec}PositionX,Object{numSec}PositionY,Object{numSec}PositionZ));
    
    uMMatrix8 = MatrixMul(uMMatrix{numThird},CreateScaleMatrix(Object{numThird}Sizedx,Object{numThird}Sizedy,Object{numThird}Sizedz));
    uMMatrix8 = MatrixMul(uMMatrix{numThird},CreateTranslationMatrix(Object{numThird}Sizedx,0.0,0.0)); 
    uMMatrix8 = MatrixMul(uMMatrix{numThird},CreateRotationZMatrix(Object{numThird}AngleZ));
    uMMatrix8 = MatrixMul(uMMatrix{numThird},CreateTranslationMatrix(Object{numThird}PositionX,Object{numThird}PositionY,Object{numThird}PositionZ));
    
    uMMatrix8 = MatrixMul(uMMatrix{numThird},CreateTranslationMatrix(Object{numThird}Sizedx,0.0,0.0)); 
    uMMatrix8 = MatrixMul(uMMatrix{numThird},CreateRotationZMatrix(Object{numThird}AngleZ));
    uMMatrix8 = MatrixMul(uMMatrix{numThird},CreateTranslationMatrix(Object{numThird}PositionX,Object{numThird}PositionY,Object{numThird}PositionZ));
    
    uMMatrix8 = MatrixMul(uMMatrix{numThird},CreateTranslationMatrix(Object{numThird}Sizedx,0.0,0.0)); 
    uMMatrix8 = MatrixMul(uMMatrix{numThird},CreateRotationZMatrix(Object{numThird}AngleZ));
    uMMatrix8 = MatrixMul(uMMatrix{numThird},CreateTranslationMatrix(Object{numThird}PositionX,Object{numThird}PositionY,Object{numThird}PositionZ));
        """)
    

while True:
    print('1 - MovingParts')
    userInput = input("Numer: ")
    match userInput:
        case '1':
            print('Matix')
            generateMovingPart(input("Podaj liczbe: "))
        case '2':
            print('Buffer')
        case '3':
            print('Rendering')
        case '4':
            print('Positions')
        case 'end':
            break