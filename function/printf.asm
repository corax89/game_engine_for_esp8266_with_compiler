_printf: 
 MOV R2,R0 
 ADD R2,R1 
 LDI R2,(R2) 
 LDC R3,(R2) 
next_printf_c: 
 CMP R3,37 ;% 
 JZ printf_get
 PUTC R3
 INC R2 
 LDC R3,(R2) 
 JNZ next_printf_c 
 RET 
next_printf_c_end:
 INC R2 
 LDC R3,(R2)
 JNZ next_printf_c 
 RET
printf_get: 
 INC R2 
 LDC R3,(R2) 
 CMP R3,37 ;%
 JZ printf_percent
 DEC R1,2 
 LDI R4,(R1+R0)
 CMP R3,68 ;D 
 JZ printf_d 
 CMP R3,73 ;I 
 JZ printf_d 
 CMP R3,83 ;S 
 JZ printf_s 
 CMP R3,67 ;C 
 JZ printf_c 
 JMP next_printf_c 
printf_percent:
 PUTC R3 
 JMP next_printf_c_end 
printf_d:  
 PUTN R4
 JMP next_printf_c_end
printf_c: 
 PUTC R4
 JMP next_printf_c_end
printf_s:
 PUTS R4 
 JMP next_printf_c_end