void dragon(int x1, int y1, int x2, int y2, int k){
	char tx,ty;
	if(k == 0){
		line(x1,y1,x2,y2);
	}else{
		tx = ((x1 + x2) / 2 + (y2 - y1) / 2);
 		ty = ((y1 + y2) / 2 - (x2 - x1) / 2);
		dragon(x2,y2,tx,ty,k-1);
		dragon(x1,y1,tx,ty,k-1);
	}
}

void main(){
	int i;
	setcolor(2);
	for(i = 1; i < 14; i++){
		clearscreen();
		dragon(40,40,100,100,i);
		settimer(0,500);
		while(gettimer(0)){};
	}
}