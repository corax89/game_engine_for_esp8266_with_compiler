"use strict";
//разбивка на токены
function tokenize(s) {
	var tokens = [];
	var thisToken = 0;
	var lastDefine,
	l;
	var tokenReplace = [
		's_x', 0, 's_y', 1, 's_speedx', 2, 's_speedy', 3, 's_width', 4, 's_height', 5,
		's_angle', 6, 's_lives', 7, 's_collision', 8, 's_solid', 9, 's_gravity', 10,
		's_on_collision', 11, 's_on_exit_screen', 12, 's_is_scrolled', 13, 's_is_onebit', 14,
		's_flip_horizontal', 15,
		'key_up', 1, 'key_left', 4, 'key_down', 2, 'key_right', 8, 'key_a', 16, 'key_b', 32,
		'key_select', 64, 'key_start', 128
	];
	//упрощенный вариант #define
	function define(s) {
		lastDefine = [''];
		while (lastDefine.length != 0) {
			lastDefine = [];
			s = s.replace(/#define\s*([^\n]*)/, function (str, def, offset, s) {
					lastDefine = [def];
					return ' ';
				});
			if (lastDefine.length > 0) {
				var d = lastDefine[0];
				if (d.search(/\(/) > -1) {
					var f,
					e;
					for (var i = 0; i < d.length; i++) {
						if (d[i] == '(') {
							f = i;
							var c = 0;
							for (var j = i; j < d.length; j++) {
								if (d[j] == '(')
									c++;
								if (d[j] == ')') {
									c--;
									if (c == 0) {
										e = j;
										break;
									}
								}
							}
							break;
						}
					}
					if (e - f == 1) {
						d = d.split(' ');
						s = s.replace(new RegExp(d[0], 'g'), d.slice(1).join(' '));
					} else {
						var func = d.slice(0, f);
						var onePart = d.slice(f + 1, e);
						var twoPart = d.slice(e + 1);
						var Dvars = onePart.split(',');
						var fnrgexp = new RegExp(func + '\\\((.*?)\\)', 'g');
						s = s.replace(fnrgexp, function (str, def, offset, s) {
								var Dvsource = def.split(',');
								var nFunc = twoPart + ' ';
								if (Dvars.length != Dvsource.length) {
									info('#define ' + func + ' error: ' + def);
								} else {
									for (var i = 0; i < Dvars.length; i++) {
										nFunc = nFunc.replace(new RegExp(Dvars[i], 'g'), Dvsource[i]);
									}
								}
								return nFunc;
							});
					}
				} else {
					d = d.split(' ');
					s = s.replace(new RegExp(d[0], 'g'), d.slice(1).join(' '));
				}
			}
		}
		return s;
	}

	s = define(s);
	s = s.replace(/#include[^\n]*/g, ''); //удаление инклюдов, дабы не мешали
	s = s.replace(/\r/g, ''); //удаление возврата каретки
	l = s.length;
	tokens[0] = '';
	for (var i = 0; i < l; i++) {
		switch (s[i]) {
		case '"':
			//обработка строки
			if (tokens[thisToken] != '')
				thisToken++;
			tokens[thisToken] = s[i++];
			while (i < l && s[i] != '"') {
				tokens[thisToken] += s[i++];
				//замена специальных символов
				if (s[i] == '\\' && s[i + 1] == '"') {
					tokens[thisToken] += '\\"';
					i += 2;
				}
			}
			tokens[thisToken] += s[i];
			thisToken++;
			tokens[thisToken] = '';
			break;
		case '\'':
			//обработка отдельных символов
			if (tokens[thisToken] != '')
				thisToken++;
			if (s[i + 2] == '\'') {
				tokens[thisToken] = '' + s.charCodeAt(i + 1);
				thisToken++;
				tokens[thisToken] = '';
				i += 2;
			}
			break;
		case '=':
			if (s[i - 1] == '=' || s[i - 1] == '!' || s[i - 1] == '+' || s[i - 1] == '-'
				 || s[i - 1] == '*' || s[i - 1] == '/' || s[i - 1] == '|' || s[i - 1] == '&' || s[i - 1] == '^') {
				tokens[thisToken - 1] += '=';
				break;
			}
		case '.':
			if (s[i + 1] >= '0' && s[i + 1] <= '9' && s[i] == '.') {
				tokens[thisToken] += s[i];
				break;
			}
		case '+':
		case '~':
		case '-':
		case '*':
		case '%':
		case '/':
			//если комментарии, то убираем, оставляя переводы строк
			if (s[i + 1] == '/') {
				while (s[i + 1] != '\n')
					i++;
				break;
			}
			if (s[i + 1] == '*') {
				i += 2;
				while (!(s[i] == '*' && s[i + 1] == '/')) {
					if (s[i] == '\n') {
						if (tokens[thisToken] != '')
							thisToken++;
						tokens[thisToken] = s[i];
						thisToken++;
						tokens[thisToken] = '';
					}
					i++;
					if (i >= l)
						break;
				}
				i++;
				break;
			}
		case '>':
		case '<':
		case '!':
		case '&':
		case '^':
		case '|':
		case '(':
		case ')':
		case '{':
		case '}':
		case '[':
		case ']':
		case ';':
		case '?':
		case ':':
		case ',':
		case '\n':
			if (tokens[thisToken] != '')
				thisToken++;
			tokens[thisToken] = s[i];
			if ((s[i] == '>' || s[i] == '<') && s[i + 1] == '=') {
				i++;
				tokens[thisToken] += s[i];
			}
			if (!(s[i] == '-'
					 && (tokens[thisToken - 1] == '=' || tokens[thisToken - 1] == '(' || tokens[thisToken - 1] == ',' || tokens[thisToken - 1] == '>' || tokens[thisToken - 1] == '<')
					 && s[i + 1] >= '0' && s[i + 1] <= '9')) {
				thisToken++;
				tokens[thisToken] = '';
			}
			break;
		case '\t':
		case ' ':
			//убираем лишние пробельные символы
			while (l < i && s[i + 1] == ' ')
				i++;
			if (tokens[thisToken] != '') {
				thisToken++;
				tokens[thisToken] = '';
			}
			break;
		default:
			tokens[thisToken] += s[i].toLowerCase();
		}
	}
	for (var i = 0; i < tokens.length; i++) {
		var n = tokenReplace.indexOf(tokens[i]);
		if (n > -1 && n % 2 == 0)
			tokens[i] = '' + tokenReplace[n + 1];
	}

	return tokens;
}

function compile(t) {
	var asm = []; //основной ассемблерный код
	var dataAsm = []; //ассемблерный код, который будет добавлен в конце основного
	var thisTokenNumber = 0; //номер текущего токена
	var thisToken; //текущий токен
	var lastToken; //предыдущий токен
	var varTable = []; //таблица переменных
	var localVarTable = []; //таблица локальных переменных
	var functionTable = []; //таблица, содержащая имена функций и их исходный код на ассемблере
	var lockAddLocalVar = false;
	var thisFunction;
	var callInFunction; //Есть ли вызов другой функции внутри функции
	var varInRegister; //локальная переменная в регистре
	var isIntoFunction = false; //находимся ли мы в теле функции
	var functionVarTable = []; //таблица переменных, указанных в объявлении текущей обрабатываемой функции
	var structArr = []; //массив структур
	var newType = []; //массив для вновь определенных типов
	var lineCount = -1; //номер текущей строки
	var registerCount = 1; //указатель на используемый в данный момент регистор процессора
	var lastEndString = 0; //указатель на токен, являющийся последним в предыдущей строке
	var labelNumber = 0; //номер ссылки, необходим для создания уникальных имен ссылок
	var localStackLength = 0; //используется в функциях для работы с локальными переменными относительно указателя стека
	var blockStack = []; // stack for break and continue
	var switchStack = []; //указывает на последний switch, необходимо для обработки break
	var typeOnStack = []; //тип значения в регистре
	var MULTIPLY_FP_RESOLUTION_BITS = 8; //point position in fixed point number
	var bracketCount = 0; //счетчик скобок
	var longArg = false;
	var lastNewLine = -1;
	var findLoopCompile = 0;
	var lastLoopToken = 0;

	function putError(line, error, par) {
		var er = 'uncown';
		if (language == 'rus')
			switch (error) {
			case 0:
				er = "функция " + par + " уже была объявлена";
				break;
			case 1:
				er = "функция " + par + " не соответствует прототипу";
			case 2:
				er = "ожидалось определение типа";
				break;
			case 3:
				er = "ожидалась запятая или закрывающая скобка";
				break;
			case 4:
				er = "ожидалась фигурная открывающая скобка";
				break;
			case 5:
				er = "ожидалась закрывающая скобка в функции " + par;
				break;
			case 6:
				er = "ожидался аргумент в функции " + par;
				break;
			case 7:
				er = "ожидалась открывающая скобка в функции " + par;
				break;
			case 8:
				er = "функция " + par + " не может возвращать значение";
				break;
			case 9:
				er = "работа с локальными массивами не поддерживается";
				break;
			case 10:
				er = "не указана длина массива";
				break;
			case 11:
				er = "неправильное объявление массива";
				break;
			case 12:
				er = "неверное количество аргументов";
				break;
			case 13:
				er = "ожидалась открывающая скобка в конструкции " + par;
				break;
			case 14:
				er = "отсутствует конструкция switch";
				break;
			case 15:
				er = "ожидалось двоеточие";
				break;
			case 16:
				er = "ожидалось число";
				break;
			case 17:
				er = "неподдерживаемое объявление переменных";
				break;
			case 18:
				er = "ожидалась скобка";
				break;
			case 19:
				er = "предупреждение, unsigned не реализовано";
				break;
			case 20:
				er = "неизвестный токен " + par;
				break;
			case 21:
				er = "не найдена точка входа в функцию main";
				break;
			case 22:
				er = "тип " + par + " не поддерживается";
				break;
			}
		else
			switch (error) {
			case 0:
				er = "the " + par + " function has already been declared";
				break;
			case 1:
				er = "the function " + par + " does not match the prototype";
			case 2:
				er = "expected type definition";
				break;
			case 3:
				er = "expected comma or closing bracket";
				break;
			case 4:
				er = "expected curly opening bracket";
				break;
			case 5:
				er = "expected closing bracket in function " + par;
				break;
			case 6:
				er = "expected argument in function " + par;
				break;
			case 7:
				er = "expected opening bracket in function " + par;
				break;
			case 8:
				er = "the function " + par + " cannot return a value";
				break;
			case 9:
				er = "working with local arrays is not supported";
				break;
			case 10:
				er = "array length not specified";
				break;
			case 11:
				er = "invalid array declaration";
				break;
			case 12:
				er = "invalid number of arguments";
				break;
			case 13:
				er = "expected opening bracket in construction " + par;
				break;
			case 14:
				er = par + " not inside switch/for/while block";
				break;
			case 15:
				er = "colon is expected";
				break;
			case 16:
				er = "expected number";
				break;
			case 17:
				er = "unsupported variable declaration";
				break;
			case 18:
				er = "expected brace";
				break;
			case 19:
				er = "warning, unsigned not implemented";
				break;
			case 20:
				er = "unknown token " + par;
				break;
			case 21:
				er = "main function entry point not found";
				break;
			case 22:
				er = "type " + par + " not supported";
				break;
			}
		info("" + (line + 1) + " " + er);
	}
	//получаем следующий токен, возвращаем false если следующего токена не существует
	function getToken() {
		findLoopCompile++;
		if (lastLoopToken + 10 < thisTokenNumber) {
			lastLoopToken = thisTokenNumber;
			findLoopCompile = 0;
		}
		if (findLoopCompile > 1000) {
			thisTokenNumber = 100000000;
			return false;
		}
		lastToken = thisToken;
		if (thisTokenNumber < t.length) {
			thisToken = t[thisTokenNumber];
			thisTokenNumber++;
			if (thisToken == '\n' && thisTokenNumber > lastNewLine) {
				lineCount++;
				lastNewLine = thisTokenNumber;
			}
			return true;
		}
		thisToken = false;
		return false;
	}
	//откатываемся к предыдущему токену
	function previousToken() {
		if (thisTokenNumber > 1) {
			thisTokenNumber--;
			thisToken = t[thisTokenNumber - 1];
			if (thisTokenNumber > 1) {
				lastToken = t[thisTokenNumber - 2];
			} else {
				lastToken = '';
			}
			return true;
		} else
			return false;
	}
	//получение ранга операции для правильного порядка выполнения математических операций
	function getRangOperation(t) {
		switch (t) {
		case '>':
		case '<':
		case '!':
		case '==':
		case '!=':
		case '<=':
		case '>=':
		case '?':
		case ':':
			return 1;
		case '|':
		case '&':
		case '^':
			return 1;
		case '+':
		case '-':
			return 3;
		case '*':
		case '/':
		case '%':
			return 4;

		}
		return 0;
	}

	function typeCast(r1, type1, r2, type2) {
		if (type1 != type2 && (type1 == 'fixed' || type2 == 'fixed')) {
			if (type1 == 'fixed') {
				asm.push(' ITOF R' + r2);
				typeOnStack[r2] = 'fixed';
			} else {
				asm.push(' ITOF R' + r1);
				typeOnStack[r1] = 'fixed';
			}
		}
	}

	function typeCastToFirst(r, type) {
		if (typeOnStack[r] == 'fixed' && type != 'fixed') {
			asm.push(' FTOI R' + r);
			typeOnStack[r] = 'int';
		} else if (typeOnStack[r] != 'fixed' && type == 'fixed') {
			asm.push(' ITOF R' + r);
			typeOnStack[r] = 'fixed';
		}
	}

	function addStruct() {
		var name,
		count = 0,
		size = 0,
		vars = [];
		getToken();
		name = thisToken;
		if (!newType.indexOf(name > -1))
			putError(lineCount, 0, ''); //info("" + lineCount + " функция уже объявлена??");
		else
			newType.push(name);
		getToken();
		if (thisToken == '{') {
			getToken();
			removeNewLine();
			while (thisToken && thisToken != '}') {
				vars[count] = [];
				if (thisToken && thisToken == '}')
					break;
				vars[count][0] = thisToken;
				isType(thisToken);
				getToken();
				vars[count][1] = thisToken;
				vars[count][2] = (vars[count][0] == 'char') ? 1 : 2;
				vars[count][3] = size;
				size += vars[count][2];
				getToken();
				if (thisToken != ';')
					break;
				getToken();
				removeNewLine();
				count++;
			}
			structArr.push([name, size, count, vars]);
		} else
			putError(lineCount, 4, ''); //info("" + lineCount + " ожидалась фигурная открывающая скобка");
		//console.log(structArr);
	}

	//регистрация функции: имя, тип возвращаемых данных, операнды, объявлена ли функция, исходный код, нужно ли вставлять функцию вместо перехода
	function registerFunction(name, ftype, operands, declar, asm, inline, varLength) {
		var pos = -1;
		for (var i = 0; i < functionTable.length; i++) {
			if (functionTable[i].name == name)
				pos = i;
		}
		if (pos >= 0 && functionTable[pos].declar == 1) {
			putError(lineCount, 0, name); //info("" + lineCount + " функция " + name + " уже была объявлена");
		} else if (pos == -1) {
			// имя функции, тип возвращаемых данных, операнды, объявлена ли функция, используется ли функция, код функции, нужно ли вставлять функцию вместо перехода
			functionTable.push({
				name: name,
				type: ftype,
				operands: operands,
				declar: declar,
				use: 0,
				asm: asm,
				inline: inline,
				varLength: varLength
			});
		} else {
			if (!(functionTable[pos].type == ftype)) {
				putError(lineCount, 1, name); //info("" + lineCount + " функция " + name + " не соответствует прототипу");
			}
			functionTable[pos].declar = declar;
			functionTable[pos].asm = asm;
			functionTable[pos].varLength = varLength;
		}
		return pos;
	}
	//обработка встреченной в коде функции
	function addFunction(type, optimizationVar, isSecondPass) {
		var name = thisToken;
		var start = 0;
		var inCodePos = thisTokenNumber - 1;
		var labelPos = labelNumber;
		var savedDataAsm = dataAsm.length;
		var savedLineCount = lineCount;
		var	savedlastNewLine = lastNewLine;
		var savedfindLoopCompile = findLoopCompile;
		var savedlastLoopToken = lastLoopToken;
		varInRegister = optimizationVar;
		callInFunction = 0;
		thisFunction = name;
		if(!isSecondPass)
			localVarTable = [];
		functionVarTable = [];
		registerCount = 1;
		//main вызывается всегда, так что пока что просто ее перепрыгиваем
		//if (name == 'main')
		//	asm.push(' JMP _end_main');
		getToken();
		getToken();
		//добавляем в таблицу переменные функции, сразу тип, затем имя, подряд для упрощения поиска (имя все равно не может соответствовать типу
		while (thisToken != ')') {
			if (isType(thisToken))
				functionVarTable.push(thisToken);
			else {
				putError(lineCount, 2, ''); //info("" + lineCount + " ожидалось определение типа");
				return false;
			}
			getToken();
			if (!thisToken)
				return;
			if (thisToken == ')' && lastToken == 'void' && functionVarTable.length == 1) {
				if(!isSecondPass)
					functionVarTable = [];
			} else {
				functionVarTable.push(thisToken);
				getToken();
				if (thisToken == '[') {
					getToken();
					getToken();
				}
				if (thisToken == ',')
					getToken();
				else if (thisToken != ')') {
					putError(lineCount, 3, ''); //info("" + lineCount + " ожидалась запятая или закрывающая скобка");
					return false;
				}
			}
		}
		getToken();
		removeNewLine();
		//если следует точка с запятой, значит тело функции будет описано дальше. Регистрируем функцию, что бы можно было ее использовать
		if (thisToken == ';') {
			registerFunction(name, type, functionVarTable, 0, [], 0, 0);
		}
		//иначе обрабатываем содержимое функции
		else {
			isIntoFunction = true;
			registerFunction(name, type, functionVarTable, 0, [], 0, 0);
			if (thisToken != '{') {
				putError(lineCount, 4, ''); //info("" + lineCount + " ожидалась фигурная открывающая скобка");
				return false;
			}
			//запоминаем начало ассемблерного кода, принадлежащего функции
			start = asm.length;
			asm.push('_' + name + ':');
			//освобождаем место на стеке для переменных
			if (localVarTable.length > 0) {
				if (localVarTable.length < 15)
					asm.push(' DEC R0,' + localVarTable.length);
				else
					asm.push(' LDC R15,' + localVarTable.length + '\n SUB R0,R15');
			}
			skipBrace();
			if (localVarTable.length > 0xf)
				asm.push(' LDC R15,' + localVarTable.length + '\n ADD R0,R15');
			else if (localVarTable.length > 0)
				asm.push(' INC R0,' + localVarTable.length);
			asm.push(' RET');
			//иначе вырезаем весь код функции из таблицы asm и сохраняем в таблицу функций. Это позволит в итоге добавить в финальный код только используемые функции
			if (callInFunction == 0 && optimizationVar == 0 && !isSecondPass) {
				thisTokenNumber = inCodePos;
				thisToken = t[thisTokenNumber++];
				asm.splice(start, asm.length - start);
				labelNumber = labelPos;
				lastNewLine = savedlastNewLine;
				findLoopCompile = savedfindLoopCompile;
				lastLoopToken = savedlastLoopToken;
				dataAsm.splice(savedDataAsm, dataAsm.length - savedDataAsm);
				lockAddLocalVar = true;
				lineCount = savedLineCount;
				addFunction(type, 1, true);
			}else if(localVarTable.length > 0 && !isSecondPass){
				thisTokenNumber = inCodePos;
				thisToken = t[thisTokenNumber++];
				asm.splice(start, asm.length - start);
				labelNumber = labelPos;
				lastNewLine = savedlastNewLine;
				findLoopCompile = savedfindLoopCompile;
				lastLoopToken = savedlastLoopToken;
				dataAsm.splice(savedDataAsm, dataAsm.length - savedDataAsm);
				lockAddLocalVar = true;
				lineCount = savedLineCount;
				addFunction(type, 0, true);
			} else
				registerFunction(name, type, functionVarTable, 1, asm.splice(start, asm.length - start), false, localVarTable.length);
			localVarTable = [];
			isIntoFunction = false;
		}
		thisFunction = '';
		varInRegister = 0;
		lockAddLocalVar = false;
	}
	//вставка кода функции
	function inlineFunction(func) {
		getToken();
		var i = 0;
		if (thisToken != ')') {
			previousToken();
			while (!(thisToken == ')' || thisToken == ';')) {
				getToken();
				if (!thisToken)
					return;
				while (!(thisToken == ',' || thisToken == ')' || thisToken == ';')) {
					execut();
					if (!thisToken)
						return;
					if (getRangOperation(thisToken) > 0)
						execut();
					else if (!(thisToken == ',' || thisToken == ')' || thisToken == ';'))
						getToken();
				}
				typeCastToFirst(registerCount - 1, func.operands[i * 2]);
				i++;
				if (i > func.operands.length / 2 && !longArg) {
					putError(lineCount, 3, func.name); //info("" + lineCount + " ожидалась закрывающая скобка в функции " + t);
					return false;
				}
			}
		}
		if (thisToken == ')')
			bracketCount--;
		//проверяем соответствие количества аргументов заявленному
		if (i < func.operands.length / 2 && !longArg) {
			putError(lineCount, 6, func.name); //info("" + lineCount + " ожидался аргумент в функции " + t);
			return false;
		}
		asm.push(func.asm.replace(/[Rr]\%(\d)/g, function (str, reg, offset, s) {
				return 'R' + (registerCount - parseInt(reg));
			}));
		registerCount -= func.operands.length / 2;
		if (func.type != 'void') {
			typeOnStack[registerCount] = func.type;
			registerCount++;
		}
		getToken();
		if (getRangOperation(thisToken) > 0)
			execut();
	}
	//обработка вызова функции
	function callFunction(t) {
		var func;
		longArg = false;
		var operandsCount = 0;
		var pushOnStack = 0;
		var copyLocalStackLength = localStackLength;
		for (var i = 0; i < functionTable.length; i++) {
			if (functionTable[i].name == t) {
				func = functionTable[i];
				break;
			}
		}
		//проверка на неопределенное количество аргументов
		if (func.operands.length > 0 && func.operands[func.operands.length - 1] == '...')
			longArg = true;
		getToken();
		if (thisToken == '(')
			bracketCount++;
		else if (thisToken != '(') {
			if (thisToken == ')' || thisToken == ',') {
				asm.push(' LDI R' + registerCount + ',_' + func.name);
				func.use++;
				registerCount++;
				return;
			} else
				putError(lineCount, 7, t); //info("" + lineCount + " ожидалась открывающая скобка в функции " + t);
			return false;
		}
		if (func.inline == true) {
			inlineFunction(func);
			return;
		}
		callInFunction = 1;
		func.use++;
		i = 0;
		if (registerCount > 1) {
			//если функция должна вернуть значение, то складываем на стек все значения регистров, содержащих данные, дабы функция их не повредила
			if (func.type != 'void') {
				asm.push(' PUSHN R' + (registerCount - 1));
				pushOnStack = registerCount - 1;
				localStackLength += (registerCount - 1);
			} else
				putError(lineCount, 8, func.name); //info('' + lineCount + ' функция ' + func.name + ' не может возвращать значение');
		} else
			registerCount++;
		getToken();
		if (thisToken != ')') {
			previousToken();
			while (!(thisToken == ')' || thisToken == ';')) {
				i++;
				getToken();
				if (!thisToken)
					return;
				while (!(thisToken == ',' || thisToken == ')' || thisToken == ';')) {
					execut();
					if (!thisToken)
						return;
					if (getRangOperation(thisToken) > 0)
						execut();
					else if (!(thisToken == ',' || thisToken == ')' || thisToken == ';'))
						getToken();
				}
				if (!longArg)
					typeCastToFirst(registerCount - 1, func.operands[operandsCount * 2]);
				registerCount--;
				operandsCount++;
				asm.push(' PUSH R' + registerCount);
				localStackLength += 1;
				if (i > func.operands.length / 2 && !longArg) {
					putError(lineCount, 5, t); //info("" + lineCount + " ожидалась закрывающая скобка в функции " + t);
					return false;
				}
			}
		}
		if (thisToken == ')')
			bracketCount--;
		//проверяем соответствие количества аргументов заявленному
		if (i < func.operands.length / 2 && !longArg) {
			putError(lineCount, 6, t); //info("" + lineCount + " ожидался аргумент в функции " + t);
			return false;
		}
		if (longArg)
			asm.push(' LDC R1,' + (operandsCount * 2));
		asm.push(' CALL _' + func.name);
		//функции возвращают значение в первый регистр, переносим в нужный нам
		if (func.type != 'void') {
			if (registerCount != 1) {
				typeOnStack[registerCount] = func.type;
				asm.push(' MOV R' + registerCount + ',R1');
			}
		}
		//восстанавливаем указатель стека
		if ((operandsCount * 2) > 0xf)
			asm.push(' LDC R15,' + (operandsCount * 2) + '\n ADD R0,R15');
		else if (operandsCount * 2 > 0 > 0)
			asm.push(' INC R0,' + (operandsCount * 2));
		//возвращаем все данные регистров из стека
		if (registerCount > 1) {
			if (pushOnStack > 0)
				asm.push(' POPN R' + pushOnStack);
			localStackLength = 0;
		}
		registerCount++;
		localStackLength = copyLocalStackLength;
		getToken();
		if (getRangOperation(thisToken) > 0)
			execut();
	}
	//добавляем новую переменную в таблицу
	function addVar(type) {
		if (isIntoFunction) {
			if(!lockAddLocalVar){
				localVarTable.push(type);
				localVarTable.push(thisToken);
			}
		} else {
			if (isVar(thisToken))
				putError(lineCount, 0, thisToken);
			if (newType.indexOf(type) > -1) {
				var len = 0;
				for (var i = 0; i < structArr.length; i++) {
					if (structArr[i][0] == type) {
						len = structArr[i][1];
						break;
					}
				}
				varTable.push({
					name: thisToken,
					type: type,
					length: len,
					length2: false
				});
				asm.push(' _' + thisToken + ' byte ' + len + ' dup(?)');
			} else {
				varTable.push({
					name: thisToken,
					type: type,
					length: 1,
					length2: false
				});
				asm.push(' _' + thisToken + ' word ? ');
			}
		}
	}
	//возвращаем тип и имя переменной, если такая существует
	function getVar(t) {
		for (var i = 0; i < varTable.length; i++) {
			if (varTable[i].name == t)
				return varTable[i];
		}
		return {
			name: 'null',
			type: 'void',
			length: 1,
			length2: false
		}
	}
	//обрабатываем переменные, данные которых содержатся на стеке
	function localVarToken() {
		var type,
		l,
		op;
		var numberVarInRegister = -1; //номер регистра, содержащего переменную
		var point = false;
		if (lastToken == '*' && registerCount == 1)
			point = true;
		var number = functionVarTable.indexOf(thisToken);
		if (number == -1) {
			number = localVarTable.indexOf(thisToken);
			type = localVarTable[number - 1];
			l = localStackLength * 2 + number - 1; //позиция переменной относительно указателя на стек
			if ((number + 1) / 2 <= 6 && number >= 0 && varInRegister) {
				numberVarInRegister = 15 - (number + 1) / 2;
			}
		} else {
			type = functionVarTable[number - 1];
			l = localStackLength * 2 + functionVarTable.length + localVarTable.length - number + 1;
		}
		var token = thisToken;
		getToken();
		//если переменная является массивом
		if (thisToken == '[') {
			//вычисление номера ячейки массива
			while (thisToken != ']') {
				getToken();
				if (!thisToken)
					return;
				execut();
			}
			getToken();
			//загрузка ячейки массива
			if (thisToken != '=') {
				previousToken();
				if (numberVarInRegister > -1) {
					asm.push(' MOV R' + (registerCount + 1) + ',R' + numberVarInRegister + ' ;' + token);
				} else {
					asm.push(' LDI R' + (registerCount + 1) + ',(' + l + '+R0) ;' + token);
				}
				typeCastToFirst(registerCount - 1, 'int');
				if (type == 'char' || type == '*char') {
					asm.push(' LDC R' + (registerCount - 1) + ',(R' + (registerCount + 1) + '+R' + (registerCount - 1) + ')');
				} else {
					if (type == '*int' && !point) {
						asm.push(' LDC R' + (registerCount - 1) + ',(R' + (registerCount + 1) + '+R' + (registerCount - 1) + ')');
					} else {
						asm.push(' LDC R' + (registerCount + 2) + ',2\n MUL R' + (registerCount - 1) + ',R' + (registerCount + 2));
						asm.push(' LDI R' + (registerCount - 1) + ',(R' + (registerCount + 1) + '+R' + (registerCount - 1) + ')');
					}
				}
				typeOnStack[registerCount - 1] = type;
			}
			//сохранение ячейки массива
			else {
				getToken();
				execut();
				getToken();
				//если за переменной следует математическая операция, то продолжаем трансляцию кода
				if (getRangOperation(thisToken) > 0)
					execut();
				registerCount--;
				if (numberVarInRegister > -1) {
					asm.push(' MOV R' + (registerCount + 1) + ',R' + numberVarInRegister + ' ;' + token);
				} else {
					asm.push(' LDI R' + (registerCount + 1) + ',(' + l + '+R0) ;' + token);
				}
				typeCastToFirst(registerCount - 1, 'int');
				typeCastToFirst(registerCount + 1, type);
				if (type == 'char' || type == '*char') {
					if (type == '*char' && !point) {
						asm.push(' STC (R' + (registerCount + 1) + '+R' + (registerCount - 1) + '),R' + registerCount);
					} else {
						asm.push(' LDC R' + (registerCount + 2) + ',2\n MUL R' + (registerCount - 1) + ',R' + (registerCount + 2));
						asm.push(' STC (R' + (registerCount + 1) + '+R' + (registerCount - 1) + '),R' + registerCount);
					}
				} else {
					if (type == '*int' && !point) {
						asm.push(' STC (R' + (registerCount + 1) + '+R' + (registerCount - 1) + '),R' + registerCount);
					} else {
						asm.push(' LDC R' + (registerCount + 2) + ',2\n MUL R' + (registerCount - 1) + ',R' + (registerCount + 2));
						asm.push(' STI (R' + (registerCount + 1) + '+R' + (registerCount - 1) + '),R' + registerCount);
					}
				}
				registerCount--;
			}
		}
		//получить значение переменной
		else if (thisToken != '=' && thisToken != '+=' && thisToken != '-=' && thisToken != '*=' && thisToken != '/=') {
			previousToken();
			if (type == 'char') {
				if (numberVarInRegister > -1) {
					asm.push(' MOV R' + registerCount + ',R' + numberVarInRegister + ' ;' + token);
				} else {
					asm.push(' LDC R' + registerCount + ',(' + l + '+R0) ;' + token);
				}
			} else {
				if (numberVarInRegister > -1) {
					asm.push(' MOV R' + registerCount + ',R' + numberVarInRegister + ' ;' + token);
				} else {
					if(l == 0)
						asm.push(' LDI R' + registerCount + ',(R0) ;' + token);
					else
						asm.push(' LDI R' + registerCount + ',(' + l + '+R0) ;' + token);
				}
			}
			typeOnStack[registerCount] = type;
			registerCount++;
		}
		//присвоить значение переменной
		else {
			op = thisToken;
			getToken();
			execut();
			if (getRangOperation(thisToken) > 0)
				execut();
			getToken();
			if (getRangOperation(thisToken) > 0)
				execut();
			registerCount--;
			//---------
			if (op == '+=' || op == '-=' || op == '*=' || op == '/=' || op == '&=' || op == '|=' || op == '^=') {
				typeCastToFirst(registerCount, type);
				if (numberVarInRegister > -1) {
					asm.push(' MOV R' + (registerCount + 1) + ',R' + numberVarInRegister + ' ;' + token);
				} else {
					asm.push(' LDI R' + (registerCount + 1) + ',(' + l + '+R0) ;' + token);
				}
				if (op == '+=') {
					asm.push(' ADD R' + registerCount + ',R' + (registerCount + 1));
				} else if (op == '-=') {
					asm.push(' SUB R' + (registerCount + 1) + ',R' + registerCount);
					asm.push(' MOV R' + registerCount + ',R' + (registerCount + 1));
				} else if (op == '*=') {
					asm.push(' MUL R' + registerCount + ',R' + (registerCount + 1));
				} else if (op == '/=') {
					asm.push(' DIV R' + (registerCount + 1) + ',R' + registerCount);
					asm.push(' MOV R' + registerCount + ',R' + (registerCount + 1));
				} else if (op == '&=') {
					asm.push(' AND R' + registerCount + ',R' + (registerCount + 1));
				} else if (op == '|=') {
					asm.push(' OR R' + registerCount + ',R' + (registerCount + 1));
				} else if (op == '^=') {
					asm.push(' XOR R' + registerCount + ',R' + (registerCount + 1));
				}

			} else
				previousToken();
			//---------
			typeCastToFirst(registerCount, type);
			if (type == 'char') {
				if (numberVarInRegister > -1) {
					asm.push(' MOV R' + numberVarInRegister + ',R' + registerCount + ' ;' + token);
					asm.push(' LDI R' + registerCount + ',255\nAND R' + numberVarInRegister + ',' + registerCount);
				} else {
					asm.push(' STC (' + l + '+R0),R' + registerCount + ' ;' + token);
				}
			} else {
				if (numberVarInRegister > -1) {
					asm.push(' MOV R' + numberVarInRegister + ',R' + registerCount + ' ;' + token);
				} else {
					if(l == 0)
						asm.push(' STI (R0),R' + registerCount + ' ;' + token);
					else
						asm.push(' STI (' + l + '+R0),R' + registerCount + ' ;' + token);
				}
			}

		}
	}
	//преобразование строки в формат, понятный ассемблеру, с заменой спецсимволов на их числовой код
	function pushString() {
		var s = '';
		while (thisToken[0] == '"') {
			for (var i = 0; i < thisToken.length; i++) {
				if (thisToken[i] == ';') {
					s += '",59,"';
				} else if (thisToken[i] == '\\') {
					i++;
					if (thisToken[i] == '\\')
						s += '",92,"';
					else if (thisToken[i] == 'n')
						s += '",10,"';
					else if (thisToken[i] == 't')
						s += '",9,"';
					else if (thisToken[i] == '"')
						s += '",34,"';
				} else
					s += thisToken[i];
			}
			getToken();
			removeNewLine();
			s += ',';
		}
		previousToken();
		//dataAsm вставляется в таблицу asm после завершения компиляции
		dataAsm.push('DB ' + s + '0');
	}
	//добавляем массив
	function addArray(type) {
		var name = lastToken;
		var arraylen2d = false;
		var length = 1;
		var buf = '';
		if (isVar(name))
			putError(lineCount, 0, name);
		getToken();
		//количество элементов не указано
		if (thisToken == ']') {
			getToken();
			if (thisToken == '[') {
				getToken();
				getToken();
			}
			if (thisToken != '=')
				putError(lineCount, 10, ''); //info("" + lineCount + " не указана длина массива");
			else
				getToken();
			//массив это строка символов
			if (thisToken[0] == '"') {
				length = thisToken.length - 2;
				dataAsm.push('_' + name + ':');
				pushString();
				varTable.push({
					name: name,
					type: type,
					length: length,
					length2: false
				});
			}
			//массив уже заполнен, считаем количество элементов
			else if (thisToken == '{') {
				var brcount = 0;
				while (thisToken && thisToken != '}') {
					var minus = false;
					getToken();
					removeNewLine();
					if (thisToken == '{') {
						brcount++;
						arraylen2d = 1;
						getToken();
					}
					removeNewLine();
					if (!thisToken)
						return;
					if (thisToken == '-') {
						minus = true;
						getToken();
					}
					if (isNumber(parseInt(thisToken))) {
						if (minus)
							buf += '-';
						if (thisToken.indexOf('.') > -1 && type == 'fixed') {
							buf += Math.floor(parseFloat(thisToken) * (1 << MULTIPLY_FP_RESOLUTION_BITS)) + ',';
						} else
							buf += parseInt(thisToken) + ',';
					} else if (isVar(thisToken))
						buf += '_' + thisToken + ',';
					else
						buf += '0,';
					length++;
					if (arraylen2d)
						arraylen2d++;
					getToken();
					removeNewLine();
					if (thisToken == '}' && brcount > 0) {
						brcount--;
						getToken();
						removeNewLine();
					}
					if (!(thisToken == '}' || thisToken == ','))
						putError(lineCount, 11, ''); //info("" + lineCount + " неправильное объявление массива");
				}
				if (arraylen2d)
					arraylen2d--;
				if (type == 'int' || type == 'fixed') {
					dataAsm.push('_' + name + ': \n DW ' + buf.substring(0, buf.length - 1));
				} else if (type == 'char') {
					dataAsm.push('_' + name + ': \n DB ' + buf.substring(0, buf.length - 1));
				}
				varTable.push({
					name: name,
					type: type,
					length: length,
					length2: arraylen2d
				});
			}
		}
		//количество элементов указано
		else if (isNumber(thisToken)) {
			var length2 = false;
			length = thisToken * 1 + 1;
			getToken();
			if (thisToken != ']')
				putError(lineCount, 11, ''); //info("" + lineCount + " неправильное объявление массива");
			getToken();
			if (thisToken == '[') {
				getToken();
				if (isNumber(thisToken)) {
					length2 = thisToken * 1;
					length = length * length2;
					getToken();
					if (thisToken != ']')
						putError(lineCount, 11, ''); //info("" + lineCount + " неправильное объявление массива");
					getToken();
				} else
					putError(lineCount, 11, ''); //info("" + lineCount + " неправильное объявление массива");
			}
			var newArr = '';
			if (isStruct(type)) {
				var l = structArr[newType.indexOf(type)][1];
				newArr = (' _' + name + ' byte ' + (length * l) + ' dup(?)');
			} else if (type == 'char')
				newArr = (' _' + name + ' byte ' + length + ' dup(?)');
			else
				newArr = (' _' + name + ' word ' + length + ' dup(?)');
			varTable.push({
				name: name,
				type: type,
				length: length,
				length2: length2
			});
			if (thisToken == '=') {
				getToken();
				if (thisToken != '{')
					putError(lineCount, 11, '');
				var nlength = 1;
				while (thisToken && thisToken != '}') {
					getToken();
					removeNewLine();
					if (!thisToken)
						return;
					if (isNumber(parseInt(thisToken))) {
						if (thisToken.indexOf('.') > -1 && type == 'fixed') {
							buf += Math.floor(parseFloat(thisToken) * (1 << MULTIPLY_FP_RESOLUTION_BITS)) + ',';
						} else
							buf += parseInt(thisToken) + ',';
					} else if (isVar(thisToken))
						buf += '_' + thisToken + ',';
					else
						buf += '0,';
					nlength++;
					getToken();
					removeNewLine();
					if (!(thisToken == '}' || thisToken == ','))
						putError(lineCount, 11, ''); //info("" + lineCount + " неправильное объявление массива");
				}
				if (type == 'int' || type == 'fixed')
					newArr = ('_' + name + ': \n DW ' + buf.substring(0, buf.length - 1));
				else if (type == 'char')
					newArr = ('_' + name + ': \n DB ' + buf.substring(0, buf.length - 1));
				if (nlength < length) {
					console.log(nlength);
					for (var i = nlength; i <= length; i++)
						newArr += ',0';
				} else
					length = nlength;
				varTable.push({
					name: name,
					type: type,
					length: length,
					length2: false
				});
			}
			dataAsm.push(newArr);
		} else
			putError(lineCount, 11, ''); //info("" + lineCount + " неправильное объявление массива");
	}
	//проверка, является ли токен t функцией
	function isFunction(t) {
		for (var i = 0; i < functionTable.length; i++) {
			if (functionTable[i].name == t)
				return true;
		}
		return false;
	}
	//проверка, является ли токен t переменной
	function isVar(t) {
		for (var i = 0; i < varTable.length; i++) {
			if (varTable[i].name == t)
				return true;
		}
		return false;
	}
	//проверка, является ли токен t объявлением типа
	function isType(t) {
		if (['long', 'float', 'double'].indexOf(t) > -1) {
			putError(lineCount, 22, t); //type not supported
			if (thisToken == t) {
				thisToken = 'int';
				return true;
			}
		}
		if (['int', '*int', 'char', '*char', 'fixed', '*fixed', 'void', '*void'].indexOf(t) > -1)
			return true;
		if (newType.indexOf(t) > -1)
			return true;
		return false;
	}
	//проверка, является ли токен структорой
	function isStruct(t) {
		if (newType.indexOf(t) > -1)
			return true;
		return false;
	}
	//проверка, является ли токен t числом
	function isNumber(t) {
		return !isNaN(parseFloat(t)) && isFinite(t);
	}
	//сохраняем значение структуры
	function structAssigment(thisVar, struct, pos, nVar, isArray) {
		var op = thisToken;
		getToken();
		if (thisToken == '{') {
			if (isArray) {
				asm.push(' LDC R' + (registerCount + 2) + ',' + pos[1]);
				asm.push(' MUL R' + (registerCount - 1) + ',R' + (registerCount + 2));
				asm.push(' ADD R' + (registerCount + 1) + ',R' + (registerCount - 1));
			}
			var spos = 0;
			while (thisToken && thisToken != '}') {
				var buf = '',
				minus = false;
				getToken();
				removeNewLine();
				if (!thisToken)
					return;
				if (thisToken == '-') {
					minus = true;
					getToken();
				}
				if (isNumber(parseInt(thisToken))) {
					if (minus)
						buf += '-';
					if (thisToken.indexOf('.') > -1 && struct[spos][0] == 'fixed') {
						buf += Math.floor(parseFloat(thisToken) * (1 << MULTIPLY_FP_RESOLUTION_BITS));
					} else
						buf += parseInt(thisToken);
				} else if (isVar(thisToken))
					buf += '_' + thisToken;
				asm.push(' LDI R' + registerCount + ',' + buf);
				if (struct[3][nVar][0] == 'char') {
					asm.push(' STC (_' + thisVar.name + ' + R' + (registerCount - 1) + '),R' + registerCount);
					asm.push(' INC R' + (registerCount - 1) + ',1');
				} else {
					asm.push(' STI (_' + thisVar.name + ' + R' + (registerCount - 1) + '),R' + registerCount);
					asm.push(' INC R' + (registerCount - 1) + ',2');
				}
				spos++;
				getToken();
				removeNewLine();
				if (!(thisToken == '}' || thisToken == ','))
					putError(lineCount, 11, ''); //info("" + lineCount + " неправильное объявление массива");
			}
			asm.pop();
		} else {
			execut();
			if (getRangOperation(thisToken) > 0)
				execut();
			getToken();
			if (getRangOperation(thisToken) > 0)
				execut();
			registerCount--;
			typeCastToFirst(registerCount, struct[3][nVar][0]);
			asm.push(' LDC R' + (registerCount + 1) + ',' + pos);
			if (isArray) {
				asm.push(' LDC R' + (registerCount + 2) + ',' + struct[1]);
				asm.push(' MUL R' + (registerCount - 1) + ',R' + (registerCount + 2));
				asm.push(' ADD R' + (registerCount + 1) + ',R' + (registerCount - 1));
			}
			if (op == '+=' || op == '-=' || op == '*=' || op == '/=' || op == '&=' || op == '|=' || op == '^=') {
				if (struct[3][nVar][0] == 'char')
					asm.push(' LDC R' + (registerCount + 2) + ',(_' + thisVar.name + ' + R' + (registerCount + 1) + ')');
				else
					asm.push(' LDI R' + (registerCount + 2) + ',(_' + thisVar.name + ' + R' + (registerCount + 1) + ')');
				if (op == '+=') {
					asm.push(' ADD R' + (registerCount) + ',R' + (registerCount + 2));
				} else if (op == '-=') {
					asm.push(' SUB R' + (registerCount + 2) + ',R' + (registerCount));
					asm.push(' MOV R' + (registerCount) + ',R' + (registerCount + 2));
				} else if (op == '*=') {
					asm.push(' MUL R' + (registerCount) + ',R' + (registerCount + 2));
				} else if (op == '/=') {
					asm.push(' DIV R' + (registerCount + 2) + ',R' + (registerCount));
					asm.push(' MOV R' + (registerCount) + ',R' + (registerCount + 2));
				} else if (op == '&=') {
					asm.push(' AND R' + (registerCount) + ',R' + (registerCount + 2));
				} else if (op == '|=') {
					asm.push(' OR R' + (registerCount) + ',R' + (registerCount + 2));
				} else if (op == '^=') {
					asm.push(' XOR R' + (registerCount) + ',R' + (registerCount + 2));
				}
			}
			if (struct[3][nVar][0] == 'char')
				asm.push(' STC (_' + thisVar.name + ' + R' + (registerCount + 1) + '),R' + registerCount);
			else {
				asm.push(' STI (_' + thisVar.name + ' + R' + (registerCount + 1) + '),R' + registerCount);
			}
		}
	}
	//загружаем значение структуры
	function structLoad(thisVar, struct, pos, nVar, isArray) {
		typeOnStack[registerCount] = struct[3][nVar][0];
		if (isArray)
			registerCount--;
		asm.push(' LDC R' + (registerCount + 1) + ',' + pos);
		if (isArray) {
			asm.push(' LDC R' + (registerCount + 2) + ',' + struct[1]);
			asm.push(' MUL R' + (registerCount) + ',R' + (registerCount + 2));
			asm.push(' ADD R' + (registerCount + 1) + ',R' + (registerCount));
		}
		if (struct[3][nVar][0] == 'char')
			asm.push(' LDC R' + (registerCount) + ',(_' + thisVar.name + ' + R' + (registerCount + 1) + ')');
		else
			asm.push(' LDI R' + (registerCount) + ',(_' + thisVar.name + ' + R' + (registerCount + 1) + ')');
		registerCount++;
	}
	//обрабатываем структуру
	function structToken() {
		var v = getVar(thisToken);
		var s = [];
		var m = [];
		var n;
		s = structArr[newType.indexOf(v.type)];
		var members = s[3];
		getToken();
		if (thisToken == '.') {
			getToken();
			for (var i = 0; i < members.length; i++) {
				if (members[i][1] == thisToken) {
					m = members[i];
					n = i;
					break;
				}
			}
			if (typeof n === 'undefined') {
				putError(lineCount, 20, thisToken);
				return;
			}
			getToken();
			if (thisToken != '=' && thisToken != '+=' && thisToken != '-=' && thisToken != '*=' && thisToken != '/=' 
				&& thisToken != '&=' && thisToken != '|=' && thisToken != '^=') {
				previousToken();
				structLoad(v, s, m[3], n, false);
			}
			//присваивание значения переменной
			else
				structAssigment(v, s, m[3], n, false);
		} else if (thisToken == '[') {
			//вычисление номера ячейки массива
			getToken();
			while (thisToken != ']') {
				if (!thisToken || ('}]),:'.indexOf(thisToken) > -1)) {
					putError(thisLine, 18, '');
					return;
				}
				execut();
				if (getRangOperation(thisToken) == 0 && thisToken != ']') {
					getToken();
					execut();
				}
			}
			typeCastToFirst(registerCount - 1, 'int');
			getToken();
			if (thisToken == '[') {
				//вычисление номера ячейки двухмерного массива
				getToken();
				while (thisToken != ']') {
					if (!thisToken || ('}]),:'.indexOf(thisToken) > -1)) {
						putError(thisLine, 18, '');
						return;
					}
					execut();
					if (getRangOperation(thisToken) == 0 && thisToken != ']') {
						getToken();
						execut();
					}
				}
				typeCastToFirst(registerCount - 1, 'int');
				if (v.length2) {
					if ((v.length / v.length2) - 1 < 255)
						asm.push(' LDC R' + registerCount + ',' + ((v.length / v.length2) - 1));
					else
						asm.push(' LDI R' + registerCount + ',' + ((v.length / v.length2) - 1));
					asm.push(' MUL R' + (registerCount - 1) + ',R' + registerCount);
				}
				asm.push(' ADD R' + (registerCount - 2) + ',R' + (registerCount - 1));
				registerCount--;
				getToken();
			}
			if (thisToken == '.') {
				getToken();
				for (var i = 0; i < members.length; i++) {
					if (members[i][1] == thisToken) {
						m = members[i];
						n = i;
						break;
					}
				}
				if (typeof n === 'undefined') {
					putError(lineCount, 20, thisToken);
					return;
				}
				getToken();
				//загрузка ячейки массива
				if (thisToken != '=' && thisToken != '+=' && thisToken != '-=' && thisToken != '*=' && thisToken != '/=' 
					&& thisToken != '&=' && thisToken != '|=' && thisToken != '^=') {
						previousToken();
						structLoad(v, s, m[3], n, true);
				}
				//сохранение ячейки массива
				else
					structAssigment(v, s, m[3], n, true);
			} else if (thisToken == '=') {
				structAssigment(v, members, s, n, true);
			} else {
				var len = 1;
				for (var i = 0; i < structArr.length; i++) {
					if (structArr[i][0] == v.type) {
						len = structArr[i][1];
						break;
					}
				}
				asm.push(' LDC R' + registerCount + ',' + len);
				asm.push(' MUL R' + (registerCount - 1) + ',R' + registerCount);
				asm.push(' LDI R' + registerCount + ',_' + v.name);
				asm.push(' ADD R' + (registerCount - 1) + ',R' + (registerCount));
			}
		} else {
			asm.push(' LDI R' + registerCount + ',_' + v.name);
			registerCount++;
		}
	}
	//обрабатываем переменную
	function varToken() {
		var v = getVar(thisToken);
		var point = false;
		var op;
		var thisLine = lineCount;
		if (isStruct(v.type)) {
			structToken();
			return;
		}
		if (lastToken == '*' && registerCount == 1)
			point = true;
		getToken();
		//если переменная является массивом
		if (thisToken == '[') {
			//вычисление номера ячейки массива
			getToken();
			while (thisToken != ']') {
				if (!thisToken || ('}]),:'.indexOf(thisToken) > -1)) {
					putError(thisLine, 18, '');
					return;
				}
				execut();
				if (getRangOperation(thisToken) == 0 && thisToken != ']') {
					getToken();
					execut();
				}
			}
			typeCastToFirst(registerCount - 1, 'int');
			getToken();
			if (thisToken == '[') {
				//вычисление номера ячейки двухмерного массива
				getToken();
				while (thisToken != ']') {
					if (!thisToken || ('}]),:'.indexOf(thisToken) > -1)) {
						putError(thisLine, 18, '');
						return;
					}
					execut();
					if (getRangOperation(thisToken) == 0 && thisToken != ']') {
						getToken();
						execut();
					}
				}
				typeCastToFirst(registerCount - 1, 'int');
				if (v.length2) {
					if ((v.length / v.length2) - 1 < 255)
						asm.push(' LDC R' + registerCount + ',' + ((v.length / v.length2) - 1));
					else
						asm.push(' LDI R' + registerCount + ',' + ((v.length / v.length2) - 1));
					asm.push(' MUL R' + (registerCount - 1) + ',R' + registerCount);
				}
				asm.push(' ADD R' + (registerCount - 2) + ',R' + (registerCount - 1));
				registerCount--;
				getToken();
			}
			//загрузка ячейки массива
			if (thisToken != '=' && thisToken != '+=' && thisToken != '-=' && thisToken != '*=' && thisToken != '/='
				 && thisToken != '&=' && thisToken != '|=' && thisToken != '^=') {
				previousToken();
				if (v.type == 'char' || v.type == '*char') {
					if (v.type == '*char' && !point) {
						asm.push(' LDI R' + registerCount + ',(_' + v.name + ')');
						asm.push(' LDC R' + (registerCount - 1) + ',(R' + registerCount + '+R' + (registerCount - 1) + ')');
					} else
						asm.push(' LDC R' + (registerCount - 1) + ',(_' + v.name + '+R' + (registerCount - 1) + ')');
				} else {
					if (v.type == '*int' && !point) {
						asm.push(' LDIAL R' + registerCount + ',(_' + v.name + ')');
						asm.push(' LDI R' + (registerCount - 1) + ',(R' + registerCount + '+R' + (registerCount - 1) + ')');
					} else {
						asm.push(' LDIAL R' + (registerCount - 1) + ',(_' + v.name + '+R' + (registerCount - 1) + ')');
					}
				}
				typeOnStack[registerCount - 1] = v.type;
			}
			//сохранение ячейки массива
			else {
				op = thisToken;
				getToken();
				execut();
				getToken();
				//если за переменной следует математическая операция, то продолжаем трансляцию кода
				if (getRangOperation(thisToken) > 0)
					execut();
				registerCount--;
				typeCastToFirst(registerCount - 1, 'int');
				typeCastToFirst(registerCount, v.type);
				if (v.type == 'char' || v.type == '*char') {
					if (v.type == '*char' && !point) {
						asm.push(' LDI R' + (registerCount + 1) + ',(_' + v.name + ')');
						asm.push(' STC (R' + (registerCount + 1) + '+R' + (registerCount - 1) + '),R' + registerCount);
					} else {
						if (op == '+=') {
							asm.push(' LDC R' + (registerCount + 1) + ',(_' + v.name + '+R' + (registerCount - 1) + ')');
							asm.push(' ADD R' + registerCount + ',R' + (registerCount + 1));
						} else if (op == '-=') {
							asm.push(' LDC R' + (registerCount + 1) + ',(_' + v.name + '+R' + (registerCount - 1) + ')');
							asm.push(' SUB R' + (registerCount + 1) + ',R' + registerCount);
							asm.push(' MOV R' + registerCount + ',R' + (registerCount + 1));
						} else if (op == '*=') {
							asm.push(' LDC R' + (registerCount + 1) + ',(_' + v.name + '+R' + (registerCount - 1) + ')');
							asm.push(' MUL R' + registerCount + ',R' + (registerCount + 1));
						} else if (op == '/=') {
							asm.push(' LDC R' + (registerCount + 1) + ',(_' + v.name + '+R' + (registerCount - 1) + ')');
							asm.push(' DIV R' + (registerCount + 1) + ',R' + registerCount);
							asm.push(' MOV R' + registerCount + ',R' + (registerCount + 1));
						} else if (op == '&=') {
							asm.push(' LDC R' + (registerCount + 1) + ',(_' + v.name + '+R' + (registerCount - 1) + ')');
							asm.push(' AND R' + registerCount + ',R' + (registerCount + 1));
						} else if (op == '|=') {
							asm.push(' LDC R' + (registerCount + 1) + ',(_' + v.name + '+R' + (registerCount - 1) + ')');
							asm.push(' OR R' + registerCount + ',R' + (registerCount + 1));
						} else if (op == '^=') {
							asm.push(' LDC R' + (registerCount + 1) + ',(_' + v.name + '+R' + (registerCount - 1) + ')');
							asm.push(' XOR R' + registerCount + ',R' + (registerCount + 1));
						}
						asm.push(' STC (_' + v.name + '+R' + (registerCount - 1) + '),R' + registerCount);
					}
				} else {
					if (v.type == '*int' && !point) {
						asm.push(' LDIAL R' + (registerCount + 1) + ',(_' + v.name + ')');
						asm.push(' STI (R' + (registerCount + 1) + '+R' + (registerCount - 1) + '),R' + registerCount);
					} else {
						if (op == '+=') {
							asm.push(' LDIAL R' + (registerCount + 1) + ',(_' + v.name + '+R' + (registerCount - 1) + ')');
							asm.push(' ADD R' + registerCount + ',R' + (registerCount + 1));
						} else if (op == '-=') {
							asm.push(' LDIAL R' + (registerCount + 1) + ',(_' + v.name + '+R' + (registerCount - 1) + ')');
							asm.push(' SUB R' + (registerCount + 1) + ',R' + registerCount);
							asm.push(' MOV R' + registerCount + ',R' + (registerCount + 1));
						} else if (op == '*=') {
							asm.push(' LDIAL R' + (registerCount + 1) + ',(_' + v.name + '+R' + (registerCount - 1) + ')');
							asm.push(' MUL R' + registerCount + ',R' + (registerCount + 1));
						} else if (op == '/=') {
							asm.push(' LDIAL R' + (registerCount + 1) + ',(_' + v.name + '+R' + (registerCount - 1) + ')');
							asm.push(' DIV R' + (registerCount + 1) + ',R' + registerCount);
							asm.push(' MOV R' + registerCount + ',R' + (registerCount + 1));
						} else if (op == '&=') {
							asm.push(' LDIAL R' + (registerCount + 1) + ',(_' + v.name + '+R' + (registerCount - 1) + ')');
							asm.push(' AND R' + registerCount + ',R' + (registerCount + 1));
						} else if (op == '|=') {
							asm.push(' LDIAL R' + (registerCount + 1) + ',(_' + v.name + '+R' + (registerCount - 1) + ')');
							asm.push(' OR R' + registerCount + ',R' + (registerCount + 1));
						} else if (op == '^=') {
							asm.push(' LDIAL R' + (registerCount + 1) + ',(_' + v.name + '+R' + (registerCount - 1) + ')');
							asm.push(' XOR R' + registerCount + ',R' + (registerCount + 1));
						}
						asm.push(' STIAL (_' + v.name + '+R' + (registerCount - 1) + '),R' + registerCount);
					}
				}
				registerCount--;
			}
		}
		//загрузка значения переменной
		else if (thisToken != '=' && thisToken != '+=' && thisToken != '-=' && thisToken != '*=' && thisToken != '/='
			 && thisToken != '&=' && thisToken != '|=' && thisToken != '^=') {
			previousToken();
			if (v.length > 1) {
				asm.push(' LDI R' + registerCount + ',_' + thisToken);
			} else if (v.type == 'char' || v.type == '*char') {
				asm.push(' LDC R' + registerCount + ',(_' + thisToken + ')');
			} else {
				asm.push(' LDI R' + registerCount + ',(_' + thisToken + ')');
			}
			typeOnStack[registerCount] = v.type;
			registerCount++;
		}
		//присваивание значения переменной
		else
			assigment();
	}
	//обработка возврата из функции
	function returnToken() {
		registerCount = 2;
		while (thisToken != ';') {
			getToken();
			if (!thisToken)
				return;
			execut();
		}
		registerCount--;
		asm.push(' MOV R1,R' + registerCount);
		registerCount--;
		if (registerCount > 1) {
			putError(lineCount, 12, ''); //info("" + lineCount + " неверное количество аргументов");
		}
		registerCount = 1;
		if ((localVarTable.length) > 0xf)
			asm.push(' LDC R15,' + (localVarTable.length) + '\n ADD R0,R15');
		else if ((localVarTable.length) > 0)
			asm.push(' INC R0,' + (localVarTable.length));
		asm.push(' RET ');
	}
	//присваивание значения переменной
	function assigment() {
		var variable = lastToken;
		var op = thisToken;
		registerCount = 2;
		if (localVarTable.indexOf(variable) > -1) {
			previousToken();
			localVarToken();
			return;
		} else {
			var v = getVar(variable);
			getToken();
			execut();
			if (getRangOperation(thisToken) > 0)
				execut();
			getToken();
			if (getRangOperation(thisToken) > 0)
				execut();
			registerCount--;
			if (op == '+=') {
				asm.push(' LDI R' + (registerCount + 1) + ',(_' + variable + ')');
				asm.push(' ADD R' + registerCount + ',R' + (registerCount + 1));
			} else if (op == '-=') {
				asm.push(' LDI R' + (registerCount + 1) + ',(_' + variable + ')');
				asm.push(' SUB R' + (registerCount + 1) + ',R' + registerCount);
				asm.push(' MOV R' + registerCount + ',R' + (registerCount + 1));
			} else if (op == '*=') {
				asm.push(' LDI R' + (registerCount + 1) + ',(_' + variable + ')');
				asm.push(' MUL R' + registerCount + ',R' + (registerCount + 1));
			} else if (op == '/=') {
				asm.push(' LDI R' + (registerCount + 1) + ',(_' + variable + ')');
				asm.push(' DIV R' + (registerCount + 1) + ',R' + registerCount);
				asm.push(' MOV R' + registerCount + ',R' + (registerCount + 1));
			} else if (op == '&=') {
				asm.push(' LDI R' + (registerCount + 1) + ',(_' + variable + ')');
				asm.push(' AND R' + registerCount + ',R' + (registerCount + 1));
			} else if (op == '|=') {
				asm.push(' LDI R' + (registerCount + 1) + ',(_' + variable + ')');
				asm.push(' OR R' + registerCount + ',R' + (registerCount + 1));
			} else if (op == '^=') {
				asm.push(' LDI R' + (registerCount + 1) + ',(_' + variable + ')');
				asm.push(' XOR R' + registerCount + ',R' + (registerCount + 1));
			}
			typeCastToFirst(registerCount, v.type);
			asm.push(' STI (_' + variable + '),R' + registerCount);
		}
		previousToken();
	}

	//обработка сложения/вычитания/декремента/инкремента
	function addSub() {
		var variable = lastToken;
		var operation = thisToken;
		getToken();
		//если инкремент
		if (thisToken == '+' && operation == '+') {
			//если инкремент следует за переменной (var++)
			if (isVar(variable) || localVarTable.indexOf(variable) > -1 || functionVarTable.indexOf(variable) > -1) {
				if (localVarTable.indexOf(variable) > -1) {
					var number = localVarTable.indexOf(variable);
					if ((number + 1) / 2 <= 6 && number >= 0 && varInRegister) {
						var numberVarInRegister = 15 - (number + 1) / 2;
						asm.push(' INC R' + numberVarInRegister);
					} else {
						if (registerCount == 1) {
							asm.push(' LDI R' + registerCount + ',(' + (localStackLength * 2 + number - 1) + '+R0)');
							registerCount++;
						}
						asm.push(' MOV R' + registerCount + ',R' + (registerCount - 1));
						asm.push(' INC R' + registerCount);
						asm.push(' STI (' + (localStackLength * 2 + number - 1) + '+R0),R' + registerCount);
					}
				} else if (functionVarTable.indexOf(variable) > -1){
					var number = localStackLength * 2 + functionVarTable.length + localVarTable.length - functionVarTable.indexOf(variable) + 1;
					asm.push(' MOV R' + registerCount + ',R' + (registerCount - 1));
					asm.push(' INC R' + registerCount);
					asm.push(' STI (' + number + '+R0),R' + registerCount + ' ;' + variable);
				} else if (isVar(variable))
					asm.push(' INC _' + variable);
			}
			//если переменная следует за инкрементом (++var)
			else {
				getToken();
				if (localVarTable.indexOf(thisToken) > -1) {
					var number = localVarTable.indexOf(thisToken);
					if ((number + 1) / 2 <= 6 && number >= 0 && varInRegister) {
						var numberVarInRegister = 15 - (number + 1) / 2;
						asm.push(' INC R' + numberVarInRegister);
						asm.push(' MOV R' + registerCount + ',R' + numberVarInRegister);
					} else {
						asm.push(' LDI R' + registerCount + ',(' + (localStackLength * 2 + localVarTable.indexOf(thisToken) - 1) + '+R0)');
						asm.push(' INC R' + registerCount);
						asm.push(' STI (' + (localStackLength * 2 + localVarTable.indexOf(thisToken) - 1) + '+R0),R' + registerCount);
					}
					registerCount++;
				} else if (isVar(thisToken)) {
					asm.push(' INC _' + thisToken);
					execut();
				}
			}
			getToken();
		}
		//если декремент
		else if (thisToken == '-' && operation == '-') {
			if (isVar(variable) || localVarTable.indexOf(variable) > -1 || functionVarTable.indexOf(variable) > -1) {
				if (localVarTable.indexOf(variable) > -1) {
					var number = localVarTable.indexOf(variable);
					if ((number + 1) / 2 <= 6 && number >= 0 && varInRegister) {
						var numberVarInRegister = 15 - (number + 1) / 2;
						asm.push(' DEC R' + numberVarInRegister);
					} else {
						if (registerCount == 1) {
							asm.push(' LDI R' + registerCount + ',(' + (localStackLength * 2 + number - 1) + '+R0)');
							registerCount++;
						}
						asm.push(' MOV R' + registerCount + ',R' + (registerCount - 1));
						asm.push(' DEC R' + registerCount);
						asm.push(' STI (' + (localStackLength * 2 + number - 1) + '+R0),R' + registerCount);
					}
				} else if (functionVarTable.indexOf(variable) > -1){
					var number = localStackLength * 2 + functionVarTable.length + localVarTable.length - functionVarTable.indexOf(variable) + 1;
					asm.push(' MOV R' + registerCount + ',R' + (registerCount - 1));
					asm.push(' DEC R' + registerCount);
					asm.push(' STI (' + number + '+R0),R' + registerCount + ' ;' + variable);
				} else if (isVar(variable))
					asm.push(' DEC _' + variable);
			} else {
				getToken();
				if (localVarTable.indexOf(thisToken) > -1) {
					var number = localVarTable.indexOf(thisToken);
					if ((number + 1) / 2 <= 6 && number >= 0 && varInRegister) {
						var numberVarInRegister = 15 - (number + 1) / 2;
						asm.push(' DEC R' + numberVarInRegister);
						asm.push(' MOV R' + registerCount + ',R' + numberVarInRegister);
					} else {
						asm.push(' LDI R' + registerCount + ',(' + (localStackLength * 2 + localVarTable.indexOf(thisToken) - 1) + '+R0)');
						asm.push(' DEC R' + registerCount);
						asm.push(' STI (' + (localStackLength * 2 + localVarTable.indexOf(thisToken) - 1) + '+R0),R' + registerCount);
					}
					registerCount++;
				} else if (isVar(thisToken)) {
					asm.push(' DEC _' + thisToken);
					execut();
				}
			}
			getToken();
		} else {
			execut();
			if (getRangOperation(thisToken) == 0)
				if (!(thisToken == ',' || thisToken == ')' || thisToken == ';'))
					getToken();
			//если следующая операция выше рангом, то выполняем сразу ее
			if (getRangOperation(thisToken) > 3)
				execut();
			registerCount--;
			typeCast(registerCount - 1, typeOnStack[registerCount - 1], registerCount, typeOnStack[registerCount]);
			if (operation == '+')
				asm.push(' ADD R' + (registerCount - 1) + ',R' + registerCount);
			else if (operation == '-')
				asm.push(' SUB R' + (registerCount - 1) + ',R' + registerCount);
			if (!(thisToken == ',' || thisToken == ')' || thisToken == ';'))
				execut();
		}
	}
	//деление, умножение, остаток
	function divMul() {
		var operation = thisToken;
		getToken();
		execut();
		if (getRangOperation(thisToken) == 0)
			if (!(thisToken == ',' || thisToken == ')' || thisToken == ';' || thisToken == '?'))
				getToken();
		//если следующая операция выше рангом, то выполняем сразу ее
		if (getRangOperation(thisToken) > 4)
			execut();
		registerCount--;
		typeCast(registerCount - 1, typeOnStack[registerCount - 1], registerCount, typeOnStack[registerCount]);
		if (operation == '*') {
			if (typeOnStack[(registerCount - 1)] == 'fixed') {
				//asm.push(' LDC R' + registerCount + ',' + MULTIPLY_FP_RESOLUTION_BITS +'\nSHR R' + (registerCount - 1) + ',R' + registerCount);
				asm.push(' MULF R' + (registerCount - 1) + ',R' + registerCount);
			} else
				asm.push(' MUL R' + (registerCount - 1) + ',R' + registerCount);

		} else if (operation == '/') {
			if (typeOnStack[(registerCount - 1)] == 'fixed') {
				//asm.push(' LDC R' + (registerCount + 1) + ',' + MULTIPLY_FP_RESOLUTION_BITS +'\nSHL R' + (registerCount - 1) + ',R' + (registerCount + 1));
				asm.push(' DIVF R' + (registerCount - 1) + ',R' + registerCount);
			} else
				asm.push(' DIV R' + (registerCount - 1) + ',R' + registerCount);
		} else if (operation == '%') {
			if (typeOnStack[(registerCount - 1)] == 'fixed') {
				typeCastToFirst((registerCount - 1), 'int');
				typeCastToFirst(registerCount, 'int');
			}
			asm.push(' DIV R' + (registerCount - 1) + ',R' + registerCount + ' \n MOV R' + (registerCount - 1) + ',R' + registerCount);
		}
		if (!(thisToken == ',' || thisToken == ')' || thisToken == ';' || thisToken == '?'))
			execut();
	}
	// & | ^
	function andOrXor() {
		var operation = thisToken;
		getToken();
		if (thisToken == operation) {
			operation += thisToken;
			getToken();
		}
		execut();
		if (getRangOperation(thisToken) == 0)
			if (!(thisToken == ',' || thisToken == ')' || thisToken == ';'))
				getToken();
		//если следующая операция выше рангом, то выполняем сразу ее
		if (getRangOperation(thisToken) > 2)
			execut();
		if (operation.length > 1 && thisToken != ')')
			execut();
		registerCount--;
		typeCast(registerCount - 1, typeOnStack[registerCount - 1], registerCount, typeOnStack[registerCount]);
		if (operation == '&')
			asm.push(' AND R' + (registerCount - 1) + ',R' + registerCount);
		else if (operation == '|')
			asm.push(' OR R' + (registerCount - 1) + ',R' + registerCount);
		if (operation == '&&')
			asm.push(' ANDL R' + (registerCount - 1) + ',R' + registerCount);
		else if (operation == '||')
			asm.push(' ORL R' + (registerCount - 1) + ',R' + registerCount);
		else if (operation == '^')
			asm.push(' XOR R' + (registerCount - 1) + ',R' + registerCount);
		if (!(thisToken == ',' || thisToken == ')' || thisToken == ';'))
			execut();
	}

	function notToken() {
		getToken();
		execut();
		asm.push(' NOT R' + (registerCount - 1) + ',R' + registerCount);
	}
	//сравнение
	function compare() {
		var operation = thisToken;
		getToken();
		//если следующий токен операция, то это могут быть ==, <=, >=, !=
		if (getRangOperation(thisToken) == 1) {
			operation += thisToken;
			getToken();
		}
		execut();
		getToken();
		if (getRangOperation(thisToken) > 1)
			execut();
		else
			previousToken();
		registerCount--;
		typeCast(registerCount - 1, typeOnStack[registerCount - 1], registerCount, typeOnStack[registerCount]);
		if (operation == '>')
			asm.push(' CMP R' + (registerCount - 1) + ',R' + registerCount + '\n LDF R' + (registerCount - 1) + ',3');
		else if (operation == '<')
			asm.push(' CMP R' + (registerCount - 1) + ',R' + registerCount + '\n LDF R' + (registerCount - 1) + ',2');
		else if (operation == '==')
			asm.push(' CMP R' + (registerCount - 1) + ',R' + registerCount + '\n LDF R' + (registerCount - 1) + ',1');
		else if (operation == '!=')
			asm.push(' CMP R' + (registerCount - 1) + ',R' + registerCount + '\n LDF R' + (registerCount - 1) + ',5');
		else if (operation == '<=')
			asm.push(' CMP R' + (registerCount - 1) + ',R' + registerCount + '\n LDF R' + (registerCount - 1) + ',4');
		else if (operation == '>=')
			asm.push(' CMP R' + registerCount + ',R' + (registerCount - 1) + '\n LDF R' + (registerCount - 1) + ',4');
		else if (operation == '>>')
			asm.push(' SHR R' + (registerCount - 1) + ',R' + registerCount);
		else if (operation == '<<')
			asm.push(' SHL R' + (registerCount - 1) + ',R' + registerCount);
		else if (operation == '!') {
			asm.push(' CMP R' + registerCount + ',0\n LDF R' + registerCount + ',1');
			registerCount++;
		} else
			return false;
		if (!(thisToken == ',' || thisToken == ')' || thisToken == ';' || thisToken == '?'))
			getToken();
		if (!(thisToken == ',' || thisToken == ')' || thisToken == ';' || thisToken == '?'))
			execut();
	}
	//обработка условных ветвлений
	function ifToken() {
		//labe делает ссылки уникальными
		var labe = labelNumber;
		labelNumber++;
		getToken();
		if (thisToken != '(')
			putError(lineCount, 13, 'if'); //info("" + lineCount + " ожидалась открывающая скобка в конструкции if");
		else
			bracketCount++;
		skipBracket();
		removeNewLine();
		registerCount--;
		asm.push(' CMP R' + registerCount + ',0 \n JZ end_if_' + labe);
		getToken();
		removeNewLine();
		//если открывающая фигурная скобка пропускаем блок этих скобок
		if (thisToken == '{') {
			skipBrace();
		}
		//иначе просто выполняем до конца строки
		else {
			execut();
			if (isVar(thisToken)) {
				getToken();
				execut();
			}
			if (thisToken == ')') {
				getToken();
				bracketCount--;
			}
		}
		registerCount = 1;
		getToken();
		removeNewLine();
		//обработка else
		if (thisToken == 'else') {
			asm.push('JMP end_else_' + labe);
			asm.push('end_if_' + labe + ':');
			getToken();
			execut();
			asm.push('end_else_' + labe + ':');
		} else {
			asm.push('end_if_' + labe + ':');
			previousToken();
		}
	}

	function whileToken() {
		var labe = labelNumber;
		labelNumber++;
		getToken();
		if (thisToken != '(')
			putError(lineCount, 13, 'while'); //info("" + lineCount + " ожидалась открывающая скобка в конструкции while");
		else
			bracketCount++;
		asm.push('start_while_' + labe + ':');
		blockStack.push('while_' + labe);
		skipBracket();
		registerCount--;
		asm.push(' CMP R' + registerCount + ',0 \n JZ end_while_' + labe);
		getToken();
		removeNewLine();
		if (thisToken == '{') {
			skipBrace();
		} else {
			execut();
			if (isVar(thisToken)) {
				getToken();
				execut();
			}
			if (thisToken == ')') {
				getToken();
				bracketCount--;
			}
		}
		registerCount = 1;
		getToken();
		removeNewLine();
		asm.push(' JMP start_while_' + labe + ' \nend_while_' + labe + ':');
		blockStack.pop();
		previousToken();
	}

	function doWhileToken() {
		var labe = labelNumber;
		labelNumber++;
		asm.push('start_dowhile_' + labe + ':');
		blockStack.push('dowhile_' + labe);
		registerCount = 1;
		getToken();
		removeNewLine();
		if (thisToken == '{') {
			skipBrace();
		} else {
			execut();
			if (isVar(thisToken)) {
				getToken();
				execut();
			}
			if (thisToken == ')')
				getToken();
		}
		registerCount = 1;
		getToken();
		removeNewLine();
		if (thisToken != 'while')
			putError(lineCount, 1, 'do ... while');
		getToken();
		if (thisToken != '(')
			putError(lineCount, 13, 'while'); //info("" + lineCount + " ожидалась открывающая скобка в конструкции while");
		skipBracket();
		registerCount--;
		asm.push(' CMP R' + registerCount + ',0 \n JZ end_dowhile_' + labe);
		getToken();
		asm.push(' JMP start_dowhile_' + labe + ' \nend_dowhile_' + labe + ':');
		blockStack.pop();
	}

	function forToken() {
		var labe = labelNumber;
		var startToken,
		memToken;
		labelNumber++;
		getToken();
		removeNewLine();
		if (thisToken != '(')
			putError(lineCount, 13, 'for'); //info("" + lineCount + " ожидалась открывающая скобка в конструкции for");
		//обрабатываем часть до первой точки с запятой, это выполнится только один раз
		while (thisToken != ';') {
			getToken();
			if (!thisToken)
				return;
			execut();
		}
		registerCount = 1;
		getToken();
		//проверка будет выполнятся каждую итерацию
		asm.push('start_for_' + labe + ':');
		blockStack.push('for_' + labe);
		execut();
		while (thisToken != ';') {
			getToken();
			if (!thisToken)
				return;
			execut();
		}
		registerCount--;
		asm.push(' CMP R' + registerCount + ',0 \n JZ end_for_' + labe);
		//запоминаем третий параметр if, не транслируя, он будет выполнятся в конце цикла
		startToken = thisTokenNumber;
		while (!(thisToken == ')' && bracketCount == 0)) {
			if (thisToken == '(')
				bracketCount++;
			else if (thisToken == ')')
				bracketCount--;
			getToken();
			if (!thisToken)
				return;
		}
		getToken();
		removeNewLine();
		if (thisToken == '{') {
			skipBrace();
		} else {
			execut();
			if (isVar(thisToken)) {
				getToken();
				execut();
			}
		}
		//теперь транслируем третий параметр
		asm.push('next_for_' + labe + ':');
		memToken = thisTokenNumber;
		thisTokenNumber = startToken;
		registerCount = 1;
		getToken();
		bracketCount++;
		skipBracket();
		//и восстанавливаем позицию транслирования
		thisTokenNumber = memToken;
		asm.push(' JMP start_for_' + labe + ' \nend_for_' + labe + ':');
		blockStack.pop();
		registerCount = 1;
	}

	function ternaryToken() {
		var labe = labelNumber;
		var saveRegCount;
		labelNumber += 2;
		registerCount--;
		asm.push(' CMP R' + registerCount + ',0 \n JZ end_ternary_' + labe);
		saveRegCount = registerCount;
		while (thisToken != ':') {
			getToken();
			if (!thisToken)
				return;
			execut();
		}
		asm.push(' JMP end_ternary_' + (labe + 1) + ':');
		asm.push('end_ternary_' + labe + ':');
		registerCount = saveRegCount;
		getToken();
		execut();
		asm.push('end_ternary_' + (labe + 1) + ':');
	}

	function switchToken() {
		var labe = labelNumber;
		labelNumber++;
		getToken();
		if (thisToken != '(')
			putError(lineCount, 13, 'switch'); //info("" + lineCount + " ожидалась открывающая скобка в конструкции switch");
		skipBracket();
		registerCount--;
		//оставляем пустую ячейку в таблице asm и запоминаем ее позицию, сюда будем добавлять весь код, сгенерированный case
		switchStack.push({
			block: asm.length,
			labe: labe
		});
		blockStack.push('switch_' + labe);
		asm.push(' ');
		asm.push(' JMP end_switch_' + labe);
		getToken();
		removeNewLine();
		if (thisToken == '{') {
			skipBrace();
		} else {
			putError(lineCount, 13, 'switch'); //info("" + lineCount + " ожидалась открывающая фигурная скобка в конструкции switch");
		}
		asm.push('end_switch_' + labe + ':');
		switchStack.pop();
		blockStack.pop();
		getToken();
		//removeNewLine();
	}

	function caseToken() {
		var lastSwitch = {
			block: 0,
			labe: 0
		};
		var labe = labelNumber;
		labelNumber++;
		//ищем к какому switch относится этот case
		if (switchStack.length > 0)
			lastSwitch = switchStack[switchStack.length - 1];
		else
			putError(lineCount, 14, 'case'); //info("" + lineCount + " отсутствует конструкция switch ");
		getToken();
		if (isNumber(thisToken)) {
			asm[lastSwitch.block] += 'CMP R1,' + parseInt(thisToken) + ' \n JZ case_' + labe + '\n ';
			asm.push(' case_' + labe + ':');
			getToken();
			if (thisToken != ':')
				putError(lineCount, 15, ''); //info("" + lineCount + " ожидалось двоеточие ");
		} else {
			putError(lineCount, 16, ''); //info("" + lineCount + " ожидалось число ");
		}
	}

	function defaultToken() {
		var lastSwitch = {
			block: 0,
			labe: 0
		};
		var labe = labelNumber;
		labelNumber++;
		if (switchStack.length > 0)
			lastSwitch = switchStack[switchStack.length - 1];
		else
			putError(lineCount, 14, ''); //info("" + lineCount + " отсутствует конструкция switch ");
		getToken();
		if (thisToken != ':')
			putError(lineCount, 15, ''); //info("" + lineCount + " ожидалось двоеточие ");
		asm[lastSwitch.block] += 'JMP default_' + labe + '\n ';
		asm.push(' default_' + labe + ':');
	}
	//break в данный момент работает только для прерывания switch, нужно доработать
	function breakToken() {
		if (blockStack.length > 0) {
			asm.push(' JMP end_' + blockStack[blockStack.length - 1]);
		} else {
			putError(lineCount, 14, 'break');
		}
	}

	function continueToken() {
		if (blockStack.length > 0) {
			var i = blockStack.length - 1;
			while (i >= 0) {
				if (blockStack[i].startsWith('for_')) {
					asm.push(' JMP next_' + blockStack[i]);
					return;
				} else if (blockStack[i].startsWith('while_')) {
					asm.push(' JMP start_' + blockStack[i]);
					return;
				}
			}
		}
		putError(lineCount, 14, 'continue');
	}
	//обработка объявления типа, предполагаем что за ним следует объявление переменной или функции
	function typeToken() {
		var type = thisToken;
		if (lastToken == '*')
			type = '*' + type;
		getToken();
		removeNewLine();
		if (thisToken == '*' || thisToken == '&') {
			if (thisToken == '*')
				type = thisToken + type;
			getToken();
		}
		//приведение типа, не реализовано
		if (thisToken == ')') {
			getToken();
			execut();
			return;
		}
		getToken();
		//вызываем регистрацию функции
		if (thisToken == '(') {
			previousToken();
			addFunction(type, 0, false);
		} else if (thisToken == '[') {
			addArray(type);
		}
		//объявление переменных одного типа через запятую
		else if (thisToken == ',' || thisToken == '=') {
			previousToken();
			previousToken();
			while (thisToken && thisToken != ';') {
				getToken();
				removeNewLine();
				var newVar = thisToken;
				addVar(type);
				getToken();
				if (thisToken == '=') {
					assigment();
					if (thisToken != ';')
						getToken();
				}
				removeNewLine();
				if (!(thisToken == ',' || thisToken == ';'))
					putError(lineCount, 17, ''); //info("" + lineCount + " неподдерживаемое объявление переменных");
			}
		} else {
			previousToken();
			addVar(type);
		}
	}

	function sizeofToken() {
		var bCount = 0;
		getToken();
		while (thisToken == '(') {
			getToken();
			bCount++;
		}
		if (isType(thisToken)) {
			if (thisToken == 'char') {
				asm.push(' LDC R' + registerCount + ',1');
			} else {
				asm.push(' LDC R' + registerCount + ',2');
			}
		} else if (isVar(thisToken)) {
			var v = getVar(thisToken);
			var s = v.length;
			if (v.type != 'char')
				s *= 2;
			asm.push(' LDI R' + registerCount + ',' + s);
		}
		registerCount++;
		while (bCount > 0) {
			getToken();
			bCount--;
		}
		getToken();
		if (getRangOperation(thisToken))
			execut();
	}
	//обработка указателей, стандарту не соответствует
	function pointerToken() {
		if (thisToken == '&') {
			getToken();
			if (functionVarTable.indexOf(thisToken) > 0) {
				asm.push(' MOV R' + registerCount + ',R0 \n LDC R' + (registerCount + 1) + ',' + (functionVarTable.indexOf(thisToken) * 2));
				asm.push(' ADD R' + registerCount + ',R' + (registerCount + 1));
				registerCount++;
			} else if (isVar(thisToken)) {
				asm.push(' LDI R' + registerCount + ',_' + thisToken);
				registerCount++;
			}
		} else if (thisToken == '*') {
			getToken();
			if (functionVarTable.indexOf(thisToken) > 0) {
				asm.push(' LDI R' + registerCount + ',(' + (localStackLength * 2 + functionVarTable.length + localVarTable.length - functionVarTable.indexOf(thisToken) + 1) + '+R0) ;' + thisToken);
				asm.push(' LDI R' + registerCount + ',(R' + registerCount + ')');
				registerCount++;
			} else if (isVar(thisToken)) {
				asm.push(' LDI R' + registerCount + ',(_' + thisToken + ')');
				asm.push(' LDI R' + registerCount + ',(R' + registerCount + ')');
				registerCount++;
			}
		}
	}
	//обработка строки. Добавляет строку и оставляет в регистре ссылку на нее
	function stringToken() {
		var labe = labelNumber;
		labelNumber++;
		dataAsm.push('_str' + labe + ':');
		pushString();
		asm.push(' LDI R' + registerCount + ',_str' + labe);
		registerCount++;
	}
	//удаляем перевод строки, если есть
	function removeNewLine() {
		var s;
		if (thisToken === '\n') {
			if (bracketCount != 0) {
				putError(lineCount - 1, 18);
				console.log(lineCount, bracketCount);
			}
			bracketCount = 0;
			if (lastToken == ';')
				registerCount = 1;
			if (thisTokenNumber - lastEndString > 1) {
				//добавляем информацию для отладки
				numberDebugString.push([asm.length, lineCount, 0]);
				//добавляем комментарии в таблицу asm для отладки
				s = ';' + lineCount + ' ' + t.slice(lastEndString, thisTokenNumber - 1).join(' ').replace(/\r|\n/g, '');
				if (s.length > 40)
					s = s.substring(0, 40) + '...';
				asm.push(s);
			}
			//пропускаем все последующие пустые переводы строки
			while (thisToken === '\n') {
				lastEndString = thisTokenNumber;
				getToken();
			}
		}
	}
	//выполняем блок скобок
	function skipBracket() {
		while (thisToken && thisToken != ')') {
			if (getRangOperation(thisToken) == 0)
				getToken();
			if (!thisToken || thisToken == ':')
				return;
			if (thisToken != ')')
				execut();
		}
		bracketCount--;
		removeNewLine();

	}
	//выполняем блок фигурных скобок
	function skipBrace() {
		while (thisToken && thisToken != '}') {
			getToken();
			if (!thisToken || thisToken == ':')
				return;
			execut();
		}
		getToken();
		if (thisToken != ';')
			previousToken();
		removeNewLine();
		registerCount = 1;
	}
	//определение типа токена и необходимой операции
	function execut() {
		//выйти, если токены закончились
		if (!thisToken) {
			return;
		}
		removeNewLine();
		if (isType(thisToken)) {
			typeToken();
		} else if (functionVarTable.indexOf(thisToken) > 0 || localVarTable.indexOf(thisToken) > 0) {
			localVarToken();
		} else if (isVar(thisToken)) {
			varToken();
		} else if (isFunction(thisToken)) {
			callFunction(thisToken);
		} else if (isNumber(thisToken)) {
			if (thisToken.indexOf('.') > -1) {
				thisToken = '' + Math.floor(parseFloat(thisToken) * (1 << MULTIPLY_FP_RESOLUTION_BITS));
				asm.push(' LDI R' + registerCount + ',' + thisToken);
				typeOnStack[registerCount] = 'fixed';
			} else {
				//байт код для добавления восьмибитного числа будет короче на два байта, по возможности добавляем его
				thisToken = '' + parseInt(thisToken);
				if ((thisToken * 1) < 255 && (thisToken * 1) >= 0) {
					asm.push(' LDC R' + registerCount + ',' + thisToken);
					typeOnStack[registerCount] = 'char';
				} else {
					asm.push(' LDI R' + registerCount + ',' + thisToken);
					typeOnStack[registerCount] = 'int';
				}
			}
			registerCount++;
		} else if (getRangOperation(thisToken) > 0) {
			//в этих условиях скорее всего работа с указателями, но это не всегда так, нужно улучшить
			if (thisToken == '&' && (lastToken == '(' || lastToken == '=' || lastToken == ','))
				pointerToken();
			else if (thisToken == '*' && (lastToken == '(' || lastToken == '=' || lastToken == ','))
				pointerToken();
			else if (thisToken == '*' && registerCount == 1) {
				getToken();
				execut();
			} else if (thisToken == '+' || thisToken == '-')
				addSub();
			else if (thisToken == '*' || thisToken == '/' || thisToken == '%')
				divMul();
			else if (thisToken == '&' || thisToken == '|' || thisToken == '^')
				andOrXor();
			else if (thisToken == '?')
				ternaryToken();
			else if (thisToken == ':')
				return;
			else
				compare();
			return;
		} else if (thisToken == '(') {
			bracketCount++;
			skipBracket();
			if (thisToken == ';')
				putError(lineCount, 18, ''); //info("" + lineCount + " ожидалась скобка");
			getToken();
		} else if (thisToken == '=' || thisToken == '+=' || thisToken == '-=' || thisToken == '*=' || thisToken == '/=') {
			assigment();
		} else if (thisToken == '~') {
			notToken();
		} else if (thisToken == ';') {
			return;
		} else if (thisToken == '{') {
			skipBrace();
			getToken();
		} else if (thisToken == ')') {
			bracketCount--;
			return;
		} else if (thisToken == '}' || thisToken == ']' || thisToken == ',') {
			return;
		} else if (thisToken == 'true') {
			asm.push(' LDC R' + registerCount + ',1');
		} else if (thisToken == 'false') {
			asm.push(' LDC R' + registerCount + ',0');
		} else if (thisToken == 'return') {
			returnToken();
		} else if (thisToken == 'struct') {
			addStruct();
		} else if (thisToken == 'if') {
			ifToken();
		} else if (thisToken == 'else') {
			return;
		} else if (thisToken == 'while') {
			whileToken();
		} else if (thisToken == 'do') {
			doWhileToken();
		} else if (thisToken == 'for') {
			forToken();
		} else if (thisToken == 'switch') {
			switchToken();
		} else if (thisToken == 'case') {
			caseToken();
		} else if (thisToken == 'default') {
			defaultToken();
		} else if (thisToken == 'continue') {
			continueToken();
		} else if (thisToken == 'break') {
			breakToken();
		} else if (thisToken == 'sizeof') {
			sizeofToken();
		} else if (thisToken == 'goto') {
			getToken();
			asm.push('JMP label_' + thisToken + ':');
			getToken();
			removeNewLine();
		} else if (thisToken == 'unsigned') {
			putError(lineCount, 19, 'switch'); //info("" + lineCount + "предупреждение, unsigned не реализовано " + thisToken);
			return;
		} else if (thisToken[0] == '"') {
			stringToken();
		} else {
			getToken();
			if (thisToken == ':') {
				asm.push('label_' + lastToken + ':');
				return;
			} else
				previousToken();
			removeNewLine();
			if (thisToken && thisToken.length > 0)
				putError(lineCount, 20, thisToken); //info("" + lineCount + " неизвестный токен " + thisToken);
		}
	}

	numberDebugString = [];
	console.time("compile");
	//регистрируем некоторые стандартные функции
	registerFunction('stopcpu', 'int', [], 1, 'PAUSE', true, 0);
	registerFunction('random', 'int', ['int', 'i'], 1, 'RAND R%1', true, 0);
	registerFunction('sqrt', 'int', ['int', 'n'], 1, 'SQRT R%1', true, 0);
	registerFunction('sin', 'fixed', ['int', 'n'], 1, 'SIN R%1', true, 0);
	registerFunction('cos', 'fixed', ['int', 'n'], 1, 'COS R%1', true, 0);
	registerFunction('putchar', 'char', ['char', 'c'], 1, 'PUTC R%1', true, 0);
	registerFunction('puts', 'int', ['*char', 'c'], 1, 'PUTS R%1', true, 0);
	registerFunction('putn', 'int', ['int', 'n'], 1, 'PUTN R%1', true, 0);
	registerFunction('gettimer', 'int', ['int', 'n'], 1, 'GTIMER R%1', true, 0);
	registerFunction('@gtm', 'int', ['int', 'n'], 1, 'GTIMER R%1', true, 0);
	registerFunction('settimer', 'void', ['int', 'n', 'int', 'time'], 1, 'STIMER R%2,R%1', true, 0);
	registerFunction('@stm', 'void', ['int', 'n', 'int', 'time'], 1, 'STIMER R%2,R%1', true, 0);
	registerFunction('clearscreen', 'int', [], 1, 'CLS', true, 0);
	registerFunction('@cls', 'int', [], 1, 'CLS', true, 0);
	registerFunction('setframerate', 'void', ['int', 'fps'], 1, 'SETFPS R%1', true, 0);
	registerFunction('setcolor', 'void', ['int', 'c'], 1, 'SFCLR R%1', true, 0);
	registerFunction('@col', 'void', ['int', 'c'], 1, 'SFCLR R%1', true, 0);
	registerFunction('setbgcolor', 'void', ['int', 'c'], 1, 'SBCLR R%1', true, 0);
	registerFunction('@bcl', 'void', ['int', 'c'], 1, 'SBCLR R%1', true, 0);
	registerFunction('setpalette', 'void', ['int', 'n', 'int', 'c'], 1, 'SPALET R%2,R%1', true, 0);
	registerFunction('@pal', 'void', ['int', 'n', 'int', 'c'], 1, 'SPALET R%2,R%1', true, 0);
	registerFunction('getchar', 'int', [], 1, 'GETK R%0', true, 0);
	registerFunction('getkey', 'int', [], 1, 'GETJ R%0', true, 0);
	registerFunction('@key', 'int', [], 1, 'GETJ R%0', true, 0);
	registerFunction('putpixel', 'void', ['int', 'x', 'int', 'y'], 1, 'PPIX R%2,R%1', true, 0);
	registerFunction('@pix', 'void', ['int', 'x', 'int', 'y'], 1, 'PPIX R%2,R%1', true, 0);
	registerFunction('getpixel', 'int', ['int', 'x', 'int', 'y'], 1, 'GETPIX R%2,R%1', true, 0);
	registerFunction('@gpx', 'int', ['int', 'x', 'int', 'y'], 1, 'GETPIX R%2,R%1', true, 0);
	registerFunction('getsprite', 'void', ['int', 'n', 'int', 'a'], 1, 'LDSPRT R%2,R%1', true, 0);
	registerFunction('putsprite', 'void', ['int', 'n', 'int', 'x', 'int', 'y'], 1, 'DRSPRT R%3,R%2,R%1', true, 0);
	registerFunction('getspriteinxy', 'int', ['int', 'x', 'int', 'y'], 1, 'GSPRXY R%2,R%1', true, 0);
	registerFunction('gettileinxy', 'int', ['int', 'x', 'int', 'y'], 1, 'GTILEXY R%2,R%1', true, 0);
	registerFunction('angbetweenspr', 'int', ['int', 'n1', 'int', 'n2'], 1, 'AGBSPR R%2,R%1', true, 0);
	registerFunction('spritespeedx', 'void', ['int', 'n', 'int', 's'], 1, 'LDC R15,2 \n SSPRTV R%2,R15,R%1', true, 0);
	registerFunction('spritespeedy', 'void', ['int', 'n', 'int', 's'], 1, 'LDC R15,3 \n SSPRTV R%2,R15,R%1', true, 0);
	registerFunction('spritegetvalue', 'int', ['int', 'n', 'int', 'type'], 1, 'SPRGET R%2,R%1', true, 0);
	registerFunction('spritesetvalue', 'void', ['int', 'n', 'int', 'type', 'int', 'value'], 1, 'SSPRTV R%3,R%2,R%1', true, 0);
	registerFunction('setimagesize', 'void', ['fixed', 's'], 1, 'ISIZE R%1', true, 0);
	registerFunction('setledcolor', 'void', ['int', 'c'], 1, 'SETLED R%1', true, 0);
	registerFunction('tone', 'void', ['int', 'freq', 'int', 'time'], 1, 'PLAYTN R%2,R%1', true, 0);
	registerFunction('loadrtttl', 'void', ['int', 'adr', 'int', 'loop'], 1, 'LOADRT R%2,R%1', true, 0);
	registerFunction('playrtttl', 'int', [], 1, 'PLAYRT', true, 0);
	registerFunction('pausertttl', 'int', [], 1, 'PAUSERT', true, 0);
	registerFunction('stoprtttl', 'int', [], 1, 'STOPRT', true, 0);
	registerFunction('savedata', 'int', ['int', 'name', 'int', 'array', 'int', 'count'], 1, 'NDATA R%3 \n SDATA R%2,R%1 \n MOV R%3,R%2', true, 0);
	registerFunction('loaddata', 'int', ['int', 'name', 'int', 'array'], 1, 'NDATA R%2 \n LDATA R%1 \n MOV R%2,R%1', true, 0);
	registerFunction('drawtile', 'void', ['int', 'x', 'int', 'y'], 1, 'DRTILE R%2,R%1', true, 0);
	registerFunction('setcollisionmap', 'void', ['int', 'adr'], 1, 'SETCTILE R%1', true, 0);
	registerFunction('scroll', 'void', ['char', 'direction'], 1, 'SCROLL R%1,R%1', true, 0);
	registerFunction('@srl', 'void', ['char', 'direction'], 1, 'SCROLL R%1,R%1', true, 0);
	registerFunction('gotoxy', 'void', ['int', 'x', 'int', 'y'], 1, 'SETX R%2 \n SETY R%1', true, 0);
	registerFunction('line', 'void', ['int', 'x', 'int', 'y', 'int', 'x1', 'int', 'y1'], 1, '_line: \n MOV R1,R0 \n LDC R2,2 \n ADD R1,R2 \n DLINE R1 \n RET', false, 0);
	registerFunction('circle', 'void', ['int', 'x', 'int', 'y', 'int', 'r'], 1, '_circle: \n MOV R1,R0 \n LDC R2,2 \n ADD R1,R2 \n DCIRK R1 \n RET', false, 0);
	registerFunction('@cir', 'void', ['int', 'x', 'int', 'y', 'int', 'r'], 1, '_@cir: \n MOV R1,R0 \n LDC R2,2 \n ADD R1,R2 \n DCIRK R1 \n RET', false, 0);
	registerFunction('fillcircle', 'void', ['int', 'x', 'int', 'y', 'int', 'r'], 1, '_fillcircle: \n MOV R1,R0 \n LDC R2,2 \n ADD R1,R2 \n FCIRK R1 \n RET', false, 0);
	registerFunction('@fcr', 'void', ['int', 'x', 'int', 'y', 'int', 'r'], 1, '_@fcr: \n MOV R1,R0 \n LDC R2,2 \n ADD R1,R2 \n FCIRK R1 \n RET', false, 0);
	registerFunction('rect', 'void', ['int', 'x', 'int', 'y', 'int', 'x1', 'int', 'y1'], 1, '_rect: \n MOV R1,R0 \n LDC R2,2 \n ADD R1,R2 \n DRECT R1 \n RET', false, 0);
	registerFunction('fillrect', 'void', ['int', 'x', 'int', 'y', 'int', 'x1', 'int', 'y1'], 1, '_fillrect: \n MOV R1,R0 \n LDC R2,2 \n ADD R1,R2 \n FRECT R1 \n RET', false, 0);
	registerFunction('@frc', 'void', ['int', 'x', 'int', 'y', 'int', 'x1', 'int', 'y1'], 1, '_@frc: \n MOV R1,R0 \n LDC R2,2 \n ADD R1,R2 \n FRECT R1 \n RET', false, 0);
	registerFunction('triangle', 'void', ['int', 'x', 'int', 'y', 'int', 'x1', 'int', 'y1', 'int', 'x2', 'int', 'y2'], 1, '_triangle: \n MOV R1,R0 \n LDC R2,2 \n ADD R1,R2 \n DTRIANG R1 \n RET', false, 0);
	registerFunction('@trn', 'void', ['int', 'x', 'int', 'y', 'int', 'x1', 'int', 'y1', 'int', 'x2', 'int', 'y2'], 1, '_@trn: \n MOV R1,R0 \n LDC R2,2 \n ADD R1,R2 \n DTRIANG R1 \n RET', false, 0);
	registerFunction('filltriangle', 'void', ['int', 'x', 'int', 'y', 'int', 'x1', 'int', 'y1', 'int', 'x2', 'int', 'y2'], 1, '_filltriangle: \n MOV R1,R0 \n LDC R2,2 \n ADD R1,R2 \n FTRIANG R1 \n RET', false, 0);
	registerFunction('@ftr', 'void', ['int', 'x', 'int', 'y', 'int', 'x1', 'int', 'y1', 'int', 'x2', 'int', 'y2'], 1, '_@ftr: \n MOV R1,R0 \n LDC R2,2 \n ADD R1,R2 \n FTRIANG R1 \n RET', false, 0);
	registerFunction('spritespeed', 'void', ['int', 'n', 'int', 'speed', 'int', 'dir'], 1, '_spritespeed: \n MOV R1,R0 \n LDC R2,2 \n ADD R1,R2 \n SPRSDS R1 \n RET', false, 0);
	registerFunction('delayredraw', 'void', [], 1, '_delayredraw: \n LDF R1,6\n CMP R1,0\n JZ _delayredraw \n RET', false, 0);
	registerFunction('@ddw', 'void', [], 1, '_@ddw: \n LDF R1,6\n CMP R1,0\n JZ _@ddw \n RET', false, 0);
	registerFunction('distance', 'int', ['int', 'x1', 'int', 'y1', 'int', 'x2', 'int', 'y2'], 1, '_distance: \n MOV R1,R0 \n LDC R2,2 \n ADD R1,R2 \n DISTPP R1 \n RET', false, 0);
	dataAsm = [];
	dataAsm.push('_drawchar: \n_@chr: \n MOV R1,R0 \n LDC R2,2 \n ADD R1,R2 \n DRWCHAR R1 \n RET');
	registerFunction('drawchar', 'void', ['char', 'char', 'int', 'x', 'int', 'y'], 1, dataAsm, false, 0);
	registerFunction('@chr', 'void', ['char', 'char', 'int', 'x', 'int', 'y'], 1, dataAsm, false, 0);
	dataAsm = [];
	dataAsm.push('_drawstring: \n_@str: \n MOV R1,R0 \n LDC R2,2 \n ADD R1,R2 \n DRWSTR R1 \n RET');
	registerFunction('drawstring', 'void', ['int', 'string', 'int', 'x', 'int', 'y'], 1, dataAsm, false, 0);
	registerFunction('@str', 'void', ['int', 'string', 'int', 'x', 'int', 'y'], 1, dataAsm, false, 0);
	dataAsm = [];
	dataAsm.push('_loadfont: \n_@fnt: \n MOV R1,R0 \n LDC R2,2 \n ADD R1,R2 \n FONTLOAD R1 \n RET');
	registerFunction('loadfont', 'void', ['int', 'adr', 'int', 'start', 'int', 'end'], 1, dataAsm, false, 0);
	registerFunction('@fnt', 'void', ['int', 'adr', 'int', 'start', 'int', 'end'], 1, dataAsm, false, 0);
	dataAsm = [];
	dataAsm.push('_setfontsize: \n_@fsz: \n MOV R1,R0 \n LDC R2,2 \n ADD R1,R2 \n FONTSIZE R1 \n RET');
	registerFunction('setfontsize', 'void', ['int', 'imgwidth', 'int', 'imgheight', 'int', 'charwidth', 'int', 'charheight'], 1, dataAsm, false, 0);
	registerFunction('@fsz', 'void', ['int', 'imgwidth', 'int', 'imgheight', 'int', 'charwidth', 'int', 'charheight'], 1, dataAsm, false, 0);
	dataAsm = [];
	dataAsm.push('_putimage: \n_@pim: \n MOV R1,R0 \n LDC R2,2 \n ADD R1,R2 \n DRWIM R1 \n RET');
	registerFunction('putimage', 'void', ['int', 'a', 'int', 'x', 'int', 'y', 'int', 'w', 'int', 'h'], 1, dataAsm, false, 0);
	registerFunction('@pim', 'void', ['int', 'a', 'int', 'x', 'int', 'y', 'int', 'w', 'int', 'h'], 1, dataAsm, false, 0);
	dataAsm = [];
	dataAsm.push('_putimage1bit: \n_@pib: \n MOV R1,R0 \n LDC R2,2 \n ADD R1,R2 \n DRWBIT R1 \n RET');
	registerFunction('putimage1bit', 'void', ['int', 'a', 'int', 'x', 'int', 'y', 'int', 'w', 'int', 'h'], 1, dataAsm, false, 0);
	registerFunction('@pib', 'void', ['int', 'a', 'int', 'x', 'int', 'y', 'int', 'w', 'int', 'h'], 1, dataAsm, false, 0);
	dataAsm = [];
	dataAsm.push('_putimagerle: \n_@pir: \n MOV R1,R0 \n LDC R2,2 \n ADD R1,R2 \n DRWRLE R1 \n RET');
	registerFunction('putimagerle', 'void', ['int', 'a', 'int', 'x', 'int', 'y', 'int', 'w', 'int', 'h'], 1, dataAsm, false, 0);
	registerFunction('@pir', 'void', ['int', 'a', 'int', 'x', 'int', 'y', 'int', 'w', 'int', 'h'], 1, dataAsm, false, 0);
	dataAsm = [];
	dataAsm.push('_setclip: \n_@clp: \n MOV R1,R0 \n LDC R2,2 \n ADD R1,R2 \n SETCLIP R1 \n RET');
	registerFunction('setclip', 'void', ['int', 'x', 'int', 'y', 'int', 'x1', 'int', 'y1'], 1, dataAsm, false, 0);
	registerFunction('@clp', 'void', ['int', 'x', 'int', 'y', 'int', 'x1', 'int', 'y1'], 1, dataAsm, false, 0);
	dataAsm = [];
	dataAsm.push('_memcpy: \n MOV R1,R0 \n LDC R2,2 \n ADD R1,R2 \n MEMCPY R1 \n RET');
	registerFunction('memcpy', 'void', ['int', 'a1', 'int', 'a2', 'int', 'size'], 1, dataAsm, false, 0);
	dataAsm = [];
	dataAsm.push('_setparticle: \n_@prt: \n MOV R1,R0 \n LDC R2,2 \n ADD R1,R2 \n SPART R1 \n RET');
	registerFunction('setparticle', 'void', ['int', 'gravity', 'int', 'count', 'int', 'time'], 1, dataAsm, false, 0);
	registerFunction('@prt', 'void', ['int', 'gravity', 'int', 'count', 'int', 'time'], 1, dataAsm, false, 0);
	dataAsm = [];
	dataAsm.push('_setemitter: \n_@emt: \n MOV R1,R0 \n LDC R2,2 \n ADD R1,R2 \n SEMIT R1 \n RET');
	registerFunction('setemitter', 'void', ['int', 'time', 'int', 'dir', 'int', 'dir1', 'int', 'speed'], 1, dataAsm, false, 0);
	registerFunction('@emt', 'void', ['int', 'time', 'int', 'dir', 'int', 'dir1', 'int', 'speed'], 1, dataAsm, false, 0);
	dataAsm = [];
	dataAsm.push('_emittersize: \n_@ems: \n MOV R1,R0 \n LDC R2,2 \n ADD R1,R2 \n SEMITSZ R1 \n RET');
	registerFunction('emittersize', 'void', ['int', 'width', 'int', 'height', 'int', 'size'], 1, dataAsm, false, 0);
	registerFunction('@ems', 'void', ['int', 'width', 'int', 'height', 'int', 'size'], 1, dataAsm, false, 0);
	dataAsm = [];
	dataAsm.push('_drawparticle: \n_@dpr: \n MOV R1,R0 \n LDC R2,2 \n ADD R1,R2 \n DPART R1 \n RET');
	registerFunction('drawparticle', 'void', ['int', 'x', 'int', 'y', 'char', 'color'], 1, dataAsm, false, 0);
	registerFunction('@dpr', 'void', ['int', 'x', 'int', 'y', 'char', 'color'], 1, dataAsm, false, 0);
	dataAsm = [];
	dataAsm.push('_loadtile: \n MOV R1,R0 \n LDC R2,2 \n ADD R1,R2 \n LDTILE R1 \n RET');
	registerFunction('loadtile', 'void', ['int', 'a', 'int', 'imgwidth', 'int', 'imgheight', 'int', 'width', 'int', 'height'], 1, dataAsm, false, 0);
	dataAsm = [];
	dataAsm.push('_printf: \n MOV R2,R0 \n ADD R2,R1 \n LDI R2,(R2) \n LDC R3,(R2) \nnext_printf_c:')
	dataAsm.push(' CMP R3,37 ;% \n JZ printf_get\n PUTC R3\n INC R2 \n LDC R3,(R2) \n JNZ next_printf_c');
	dataAsm.push(' RET \nnext_printf_c_end:\n INC R2 \n LDC R3,(R2)\n JNZ next_printf_c \n RET\nprintf_get:');
	dataAsm.push(' INC R2 \n LDC R3,(R2) \n CMP R3,37 ;%\n JZ printf_percent\n DEC R1,2 \n LDI R4,(R1+R0)');
	dataAsm.push(' CMP R3,100 ;d\n JZ printf_d \n CMP R3,105 ;i\n JZ printf_d \n CMP R3,115 ;s\n JZ printf_s \n CMP R3,99 ;c\n JZ printf_c');
	dataAsm.push(' CMP R3,102 ;f\n JZ printf_f \n JMP next_printf_c \nprintf_percent:\n PUTC R3 \n JMP next_printf_c_end \nprintf_d: \n PUTN R4');
	dataAsm.push(' JMP next_printf_c_end\nprintf_c: \n PUTC R4\n JMP next_printf_c_end\nprintf_s:\n PUTS R4 \n JMP next_printf_c_end');
	dataAsm.push(' printf_f:\n PUTF R4 \n JMP next_printf_c_end');
	registerFunction('printf', 'int', ['*char', 's', '...'], 1, dataAsm, false, 0);
	dataAsm = [];
	dataAsm.push('_free:\n LDI R1,(2 + R0)\n DEC R1,2\n LDI R3,32768\n LDI R2,(R1)\n SUB R2,R3\n LDI R4,(R1+R2)\n CMP R4,0\n JZ end_free_0');
	dataAsm.push(' CMP R3,R4\n JP next_free\n STI (R1),R2\n RET \nend_free_0:\n LDI R2,0\n STI (R1),R2\n RET\nnext_free:\n ADD R2,R4');
	dataAsm.push(' LDI R4,(R1+R2)\n CMP R4,0\n JZ end_free_0\n CMP R3,R4\n JP next_free\n STI (R1),R2 \n RET');
	registerFunction('free', 'void', ['int', 'a'], 1, dataAsm, false, 0);
	dataAsm = [];
	dataAsm.push('\n_malloc: \n LDI R2,(2 + R0)\n CMP R2,0 \n JZ end_malloc \n  MOV R5,R2\n LDC R4,1\n AND R5,R4\n CMP R5,1\n JNZ next_malloc');
	dataAsm.push(' INC R2\nnext_malloc:\n INC R2,2\n LDI R1,#END \n LDI R4,32768 ;0x8000\nnext_byte:\n LDI R3,(R1)\n CMP R3,R4');
	dataAsm.push(' JNP malloc1 \n SUB R3,R4\n ADD R1,R3 \n CMP R1,R0 \n JP end_malloc\n JMP next_byte\nmalloc1:\n CMP R3,0 \n JNZ malloc2');
	dataAsm.push(' MOV R5,R2\n ADD R5,R1\n CMP R5,R0 \n JP end_malloc\n ADD R2,R4\n STI (R1),R2\n INC R1,2\n RET\nmalloc2: \n MOV R6,R3');
	dataAsm.push(' SUB R6,R2\n JNP next_byte1 \n MOV R5,R2\n ADD R5,R1\n CMP R5,R0\n JP end_malloc\n ADD R2,R4\n STI (R1),R2\n INC R1,2');
	dataAsm.push(' CMP R6,0 \n JZ ret_malloc\n STI (R5),R6\n RET\n next_byte1: \n ADD R1,R3 \n JMP next_byte \nend_malloc:\n LDC R1,0\n RET');
	dataAsm.push('ret_malloc:\n RET');
	registerFunction('malloc', 'int', ['int', 'l'], 1, dataAsm, false, 0);
	dataAsm = [];
	//основной цикл компиляции, выполняется пока есть токены на входе
	while (getToken()) {
		execut();
	}
	//указываем место для кучи, если нужно
	if (isFunction('malloc'))
		asm.push(' LDI R15,0 \n STI (#END),R15');
	//в конце программы вызываем main если есть
	if (isFunction('main')) {
		for (var i = 0; i < functionTable.length; i++) {
			if (functionTable[i].name == 'main') {
				functionTable[i].use = 1;
				if (functionTable[i].varLength > 0) {
					if (functionTable[i].varLength < 15)
						asm.push(' DEC R0,' + functionTable[i].varLength);
					else
						asm.push(' LDC R15,' + functionTable[i].varLength + '\n SUB R0,R15');
				}
				break;
			}
		}
		asm.push(' CALL _main');
	}
	//если ее нет, то программа будет работать все равно
	else
		putError(lineCount, 21, ''); //info("не найдена точка входа в функцию main");
	//при возврате из main останавливаем выполнение программы
	asm.push('HLT');
	//проверяем, были ли хоть раз вызваны функции и добовляем код только вызванных
	for (var i = 0; i < functionTable.length; i++) {
		if (functionTable[i].use > 0)
			asm = asm.concat(functionTable[i].asm);
	}
	//объеденяем код с данными
	asm = asm.concat(dataAsm);
	console.timeEnd("compile");

	return asm;
}
