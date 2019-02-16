/* простая программа игры в крестики-нолики */
#define SPACE 0x20
char matrix[] = {SPACE, SPACE, SPACE, SPACE, SPACE, SPACE, SPACE, SPACE, SPACE};
void get_computer_move(void);
void get_player_move(void);
void disp_matrix(void);
char check (void);
int x, y;
int main()
{
char done;
printf("This is the game of Tic-Tac-Toe.\n");
printf("You will be playing against the computer.\n");
done = SPACE;
while(done==SPACE) {
disp_matrix(); /* вывод игровой доски */
get_player_move(); /* ходит игрок */
done = check(); /* проверка на победу */
//if (done!=SPACE) break; /* победитель */
get_computer_move(); /* ходит компьютер */
done=check(); /* проверка на победу */
} ;
if(done=='X') printf("You won!\n");
else printf("I won!!!!\n");
disp_matrix(); /* отображение результирующего положения */
return 0;
}

/* ввод хода игрока */
void get_player_move(void)
{

printf("Enter coordinates for your X.\n");
printf("Row? ");
x=random(2);
printf("Column? ");
y=random(2);
if (matrix[x*3+y] !=SPACE)
{
printf("Invalid move, try again.\n");
get_player_move();
}
else matrix[x*3+y]='X';
}

/* ход компьютера */
void get_computer_move(void)
{
int t;
char *p;
p = (char *) matrix;
for (t=0; *p!=SPACE && t<9; ++t) p++;
if(t==9)
{
printf("draw\n");
 /* game over */
}
else *p = 'O';
}

/* отображение игровой доски */
void disp_matrix(void)
{
gotoxy(0,0);
int t;
for(t=0; t<3; t++)
{
printf(" %c | %c | %c", matrix[t*3], matrix[t*3+1], matrix[t*3+2]);
if(t!=2) printf("\n - | - | -\n");
}
printf("\n");
}

/* проверка на победу */
char check(void)
{
int t;
char *p;
for(t=0; t<3; t++) { /* проверка строк */
p = &matrix[t*3+0];
if (*p==* (p+1) && * (p+1)==*(p+2)) return *p;
}
for(t=0; t<3; t++) { /* проверка столбцов */
p = &matrix[t];
if(*p==*(p+3) && *(p+3)==*(p+6)) return *p;
}

/* проверка диагоналей */
if(matrix[0]==matrix [4] && matrix[4]==matrix [8] )
return matrix[0];
if(matrix[2]==matrix[4] && matrix[4]==matrix[6])
return matrix[2];
return SPACE;
}