int   bit1                = 1;
int   bitSizeMinusOne     = 31;
int   resolution          = 256; //example resolution
int   resolutionShift     = 8;   //2^8 = 256 
int   roundBit            = 1 << (resolutionShift-1);
int   resolutionShiftPlusOne = resolutionShift + 1;
     
int fixedPointMultiply(int x, int y){         
  return  (x * y  + roundBit) >> resolutionShift;
}                      
           
int fixedPointDivide(int numerator, int denominator){
  int doubleResult = (numerator << resolutionShiftPlusOne) / denominator;
	int sign         = (doubleResult >> bitSizeMinusOne) | bit1;
  int roundAdd     = sign * (doubleResult & bit1);
	return (doubleResult + roundAdd) >> 1;
}

int toFixedPoint(int full, int numerator, int denominator){
	int n = (full << resolutionShift) + fixedPointDivide(numerator, denominator);
  return n;
}
        
int fixedPointToInt(int x){ // always rounding towards negative infinity here!
  return x >> resolutionShift;
}