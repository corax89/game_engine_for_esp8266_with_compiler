void plot_circle(int x, int y, int x_center, int  y_center){
    putpixel(x_center+x,y_center+y);
    putpixel(x_center+x,y_center-y);
    putpixel(x_center-x,y_center+y);
    putpixel(x_center-x,y_center-y);
}

void circle(int x_center, int y_center, int radius){
    int x,y,delta;
    x = 0;
    y = radius;
    delta = 3 - 2 * radius;
    while(x<y) {
        plot_circle(x,y,x_center,y_center);
        plot_circle(y,x,x_center,y_center);
        if(delta<0)
            delta += 4*x+6;
        else {
            delta += 4*(x-y)+10;
            y--;
        }
        x++;
    }
    if(x==y) 
		plot_circle(x,y,x_center,y_center);
}

void fillCircle(int x0, int y0, int radius){
	int i,x,y,xChange,yChange,radiusError;
    x = radius;
    y = 0;
    xChange = 1 - (radius << 1);
    yChange = 0;
    radiusError = 0;
    while (x >= y){
		line(x0 - x, y0 + y, x0 + x, y0 + y);
		line(x0 - x, y0 - y, x0 + x, y0 - y);
		line(x0 - y, y0 + x, x0 + y, y0 + x);
		line(x0 - y, y0 - x, x0 + y, y0 - x);
        y++;
        radiusError += yChange;
        yChange += 2;
        if (((radiusError << 1) + xChange) > 0){
            x--;
            radiusError += xChange;
            xChange += 2;
        }
    }
}

void main(){
	while(1){
		setcolor(1 + random(14));
		fillCircle(random(120),random(120),30);
	}
}