int s1,s2,s3,s4,s5,s6,x;

void main(){
while(1){
	gotoxy(0,1);
	settimer(1,5000);
	for(int i = 0; i < 10000; i++){}
	s1 = 5000 - gettimer(1);
	printf("nop \t%d\n",s1);
	settimer(1,5000);
	for(i = 0; i < 10000; i++)
		x=x+1;
	s2 = 5000 - gettimer(1) - s1;
	printf("add \t%d\n",s2);
	settimer(1,5000);
	for(i = 0; i < 10000; i++)
		x=x-1;
	s3 = 5000 - gettimer(1) - s1;
	printf("sub \t%d\n",s3);
	settimer(1,5000);
	for(int i = 0; i < 10000; i++)
		x=x*3;
	s4 = 5000 - gettimer(1) - s1;
	printf("mul \t%d\n",s4);
	settimer(1,5000);
	for(i = 0; i < 10000; i++)
		x=x/3;
	s5 = 5000 - gettimer(1) - s1;
	printf("div \t%d\n",s5);
	settimer(1,5000);
	for(i = 0; i < 10000; i++)
		x=sqrt(30000);
	s6 = 5000 - gettimer(1) - s1;
	printf("sqr \t%d\n",s6);
}
}	