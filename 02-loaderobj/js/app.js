//Variables para los objetos
var gl = null;
var shaderProgram  = null; //Shader program to use.
var vao = null;
var vao2 =null; //Geometry to render (stored in VAO).
var vao3 = null;
var vao4=null;
var parsedOBJ = null; //Archivos OBJ Traducidos para que los pueda leer webgl2
var parsedOBJ2 = null;
var parsedOBJ3 = null;
var parsedOBJ4 = null;


//Uniform locations.
var u_satelliteMatrix;
var u_planetMatrix;
var u_ring1Matrix;
var u_ring2Matrix;
var u_viewMatrix;
var u_projMatrix;
var u_ka;
var u_kd;
var u_ks;
var u_normalMatrix;
var u_coefEspec;
var u_posL;
var u_ia;
var u_id;
var u_is;


//Uniform values.
var satelliteMatrix = mat4.create();
var planetMatrix = mat4.create();
var ring1Matrix = mat4.create();
var ring2Matrix = mat4.create();
var viewMatrix = mat4.create();
var projMatrix = mat4.create();

var angle = [];
//Variables para generar la camara esferica
var camaraEsferica;
var eye = [2, 2, 2];
var target = [0, 0, 0];
var up = [0, 1, 0];

//Guardo los sliders para resetear todo a sus posiciones iniciales
//Se cargaran cuando el usuario mueva algun slider
var slider=[];
//Variables de control
var changed = false; //Es true si algun valor fue cambiado desde el ultimo reset
var fullScreen = false;//Es true si esta en pantalla completa
var rotationAngle=[];
var animated = [];
var then = 0;
var rotationSpeed = 30;

//MATERIALES
var jade;
var gold;
var rock;

//OBJETOS
var obj_planet;
var obj_satellite;
var obj_ring1;
var obj_ring2;

//LUCES
var light;
var light_position = [0.0,10.0,100.0,0.0];
var light_intensity = [[1.0,1.0,1.0],[1.0,1.0,1.0],[1.0,1.0,1.0]];
var light_angle = 0.0;

/*Esta funcion se ejecuta al cargar la pagina. Carga todos los objetos para que luego sean dibujados, asi como los valores iniciales
de las variables a utilizar*/
function onLoad() {
	let canvas = document.getElementById('webglCanvas');
	gl = canvas.getContext('webgl2');

	//Cargo los objetos a la escena
	onModelLoad();
	cargarSliders();//Cargo los sliders

	obj_planet = new Object(parsedOBJ);
	obj_satellite = new Object(parsedOBJ2);
	obj_ring1 = new Object(parsedOBJ3);
	obj_ring2 = new Object(parsedOBJ4);

	light = new Light(light_position , light_intensity , light_angle);

	//vertexShaderSource y fragmentShaderSource estan importadas en index.html <script>
	shaderProgram = ShaderProgramHelper.create(vertexShaderSource, fragmentShaderSource);
	let posLocation = gl.getAttribLocation(shaderProgram, 'vertexPos');
	let colLocation = gl.getAttribLocation(shaderProgram, 'vertexCol');
	let normalMatrix_location = gl.getAttribLocation(shaderProgram, 'vertexNormal');
	u_satelliteMatrix = gl.getUniformLocation(shaderProgram, 'modelMatrix');
	u_planetMatrix = gl.getUniformLocation(shaderProgram, 'modelMatrix');
	u_ring1Matrix = gl.getUniformLocation(shaderProgram, 'modelMatrix');
	u_ring2Matrix = gl.getUniformLocation(shaderProgram, 'modelMatrix');
	u_viewMatrix = gl.getUniformLocation(shaderProgram, 'viewMatrix');
	u_projMatrix = gl.getUniformLocation(shaderProgram, 'projMatrix');
	u_ka = gl.getUniformLocation(shaderProgram, 'ka');
	u_kd = gl.getUniformLocation(shaderProgram, 'kd');
	u_ks = gl.getUniformLocation(shaderProgram, 'ks');
	u_normalMatrix = gl.getUniformLocation(shaderProgram, 'normalMatrix');
	u_coefEspec = gl.getUniformLocation(shaderProgram, 'coefEspec');
	u_posL = gl.getUniformLocation(shaderProgram, 'posL');
	u_ia = gl.getUniformLocation(shaderProgram, 'ia');
	u_id = gl.getUniformLocation(shaderProgram, 'id');
	u_is = gl.getUniformLocation(shaderProgram, 'is');


	//Para el planeta
	let vertexAttributeInfoArray = [
		new VertexAttributeInfo(obj_planet.getPositions(), posLocation, 3),
		new VertexAttributeInfo(obj_planet.getColors(), colLocation, 3),
		new VertexAttributeInfo(obj_planet.getNormals(), normalMatrix_location, 3)
	];
	//Para el satelite
	let vertexAttributeInfoArray2 = [
		new VertexAttributeInfo(obj_satellite.getPositions(), posLocation, 3),
		new VertexAttributeInfo(obj_satellite.getColors(), colLocation, 3),
		new VertexAttributeInfo(obj_satellite.getNormals(), normalMatrix_location, 3)
	];
	//Para el anillo interior
	let vertexAttributeInfoArray3 = [
		new VertexAttributeInfo(obj_ring1.getPositions(), posLocation, 3),
		new VertexAttributeInfo(obj_ring1.getColors(), colLocation, 3),
		new VertexAttributeInfo(obj_ring1.getNormals(), normalMatrix_location, 3)
	];
	//Para el anillo exterior
	let vertexAttributeInfoArray4 = [
		new VertexAttributeInfo(obj_ring2.getPositions(), posLocation, 3),
		new VertexAttributeInfo(obj_ring2.getColors(), colLocation, 3),
		new VertexAttributeInfo(obj_ring2.getNormals(), normalMatrix_location, 3)
	];

	//Asigno VAOs
	obj_planet.setVao(VAOHelper.create(obj_planet.getIndices(), vertexAttributeInfoArray));
	obj_satellite.setVao(VAOHelper.create(obj_satellite.getIndices(), vertexAttributeInfoArray2));
	obj_ring1.setVao(VAOHelper.create(obj_ring1.getIndices(), vertexAttributeInfoArray3));
	obj_ring2.setVao(VAOHelper.create(obj_ring2.getIndices(), vertexAttributeInfoArray4));


	gl.clearColor(0.05, 0.05, 0.05, 1.0); //Cambio el color de fondo
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	/*Creacion de camara*/
	camaraEsferica= new sphericalCamera(glMatrix.toRadian(angle[4]),glMatrix.toRadian(angle[5]),3,target,up);
	viewMatrix=camaraEsferica.createViewMatrix();//Calculo la matriz de vista
	let fov = glMatrix.toRadian(angle[3]); //Establezco el campo de vision inicial
	let aspect = canvas.width / canvas.height;//Establezco la relacion de aspecto
	let near = 0.1;//Establezco la distancia minima que renderizare
	let far = 10.0;//Establezco la distancia maxima que renderizare
	projMatrix=camaraEsferica.createPerspectiveMatrix(fov,near,far,aspect);//Calculo la matriz de proyeccion

	//Creacion de MATERIALES
	crearMateriales();


	obj_planet.setMaterial(gold);
	obj_satellite.setMaterial(gold);
	obj_ring1.setMaterial(rock);
	obj_ring2.setMaterial(jade);

	gl.enable(gl.DEPTH_TEST);//Activo esta opcion para que dibuje segun la posicion en Z. Si hay dos fragmentos con las mismas x,y pero distinta zIndex
	//Dibujara los que esten mas cerca de la pantalla.
	requestAnimationFrame(onRender)//Pido que inicie la animacion ejecutando onRender
}

/*Reordeno valores para dibujarlos como lineas
	La idea es que si tengo el triangulo con vertices (0,0,0) (1,1,0) (-1,1,0)
	debo unirlos de la siguiente manera: (0,0,0) (1,1,0) , (0,0,0) (-1,1,0) , (-1,1,0) (1,1,0)
	para dibujarlos como lineas. Es decir, establezco el punto inicial y el punto final.
*/
function convertIndexes(indexes){
	let newIndexes = [];
	for (let x = 0; x < indexes.length; x = x + 3) {
		//Linea 1
		newIndexes.push(indexes[x]);
		newIndexes.push(indexes[x + 1]);
		//Linea 2
		newIndexes.push(indexes[x + 1]);
		newIndexes.push(indexes[x + 2]);
		//Linea 3. Tiene que ser asi para respetar el sentido antihorario
		newIndexes.push(indexes[x + 2]);
		newIndexes.push(indexes[x]);
	}
	return newIndexes;
}

/*Este metodo se llama constantemente gracias al metodo requestAnimationFrame(). En los sliders no
se llama al onRender, sino que unicamente actualiza valores. Luego el onRender recupera esos valores y transforma
los objetos como corresponda.*/
function onRender(now) {
	now *= 0.001; //Tiempo actual
	var deltaTime = now - then; //El tiempo que paso desde la ultima llamada al onRender y la actual
	then = now; //Actualizo el valor
	refreshAngles(deltaTime); //Actualizo los angulos teniendo en cuenta el desfasaje de tiempo
	/*Reinicio Matrices*/
	obj_planet.resetObjectMatrix();
	obj_satellite.resetObjectMatrix();
	obj_ring1.resetObjectMatrix();
	obj_ring2.resetObjectMatrix();
	/*Actualizo las transformaciones para cada uno de los objetos*/
	rotatePlanet();//Roto el planeta
	rotateSatellite();//Roto el satelite
	orbitSatellite();//Orbito el satelite
	scaleSatellite();//Escalo el satelite
	scalePlanet();//Escalo el planeta
	rotateRing1();//Roto el anillo interior
	rotateRing2();//Roto el anillo exterior
	scaleRing1();//Escalo el anillo 1
	scaleRing2();//Escalo el anillo 2

	/*--------------------------Control de camara --------------------------*/
	if(animated[5]) //Si esta rotando automaticamente a la izquierda...
		viewMatrix = camaraEsferica.quaternionCamera(glMatrix.toRadian(rotationAngle[5]),glMatrix.toRadian(angle[4])); //Roto segun el angulo de rotacion 5
	else
		if(animated[6]) //Si esta rotando automaticamente a la derecha...
			viewMatrix = camaraEsferica.quaternionCamera(glMatrix.toRadian(rotationAngle[6]),glMatrix.toRadian(angle[4])); //Roto segun el angulo de rotacion 6
		else {// Si no esta siendo animada
			viewMatrix = camaraEsferica.quaternionCamera(glMatrix.toRadian(angle[5]),glMatrix.toRadian(angle[4])); //Roto segun el angulo del slider
		}
	projMatrix=camaraEsferica.zoom(angle[3]);//Vuelvo a calcular la matriz de proyeccion (Perspectiva)

	/*Comienzo a preparar para dibujar*/
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.useProgram(shaderProgram);

	passLight(light);/*-----------------------PASO LA LUZ--------------------------*/
	passCamera();
	drawObject(obj_planet);
	drawObject(obj_satellite);
	drawObject(obj_ring1);
	drawObject(obj_ring2);
	gl.useProgram(null);
	requestAnimationFrame(onRender); //Continua el bucle
}


function passCamera(){
	gl.uniformMatrix4fv(u_viewMatrix, false, viewMatrix);
	gl.uniformMatrix4fv(u_projMatrix, false, projMatrix);
}

function passLight(light){
	gl.uniform4fv(u_posL, light.getLightPosition());
	gl.uniform3fv(u_ia, light.getIntensity()[0]);
	gl.uniform3fv(u_id, light.getIntensity()[1]);
	gl.uniform3fv(u_is, light.getIntensity()[2]);
}

function drawObject(object){
	if(object===obj_planet)
		gl.uniformMatrix4fv(u_planetMatrix, false, object.getObjectMatrix());
	if(object===obj_satellite)
		gl.uniformMatrix4fv(u_satelliteMatrix, false, object.getObjectMatrix());
	if(object===obj_ring1)
		gl.uniformMatrix4fv(u_ring1Matrix, false, object.getObjectMatrix());
	if(object===obj_ring2)
		gl.uniformMatrix4fv(u_ring2Matrix, false, object.getObjectMatrix())

	gl.uniformMatrix4fv(u_normalMatrix, false, object.getObjectMatrix());
	/*-----------------------PASO LOS VALORES DEL MATERIAL--------------------*/
	gl.uniform4fv(u_ka,object.getMaterial().getKa());
	gl.uniform4fv(u_kd,object.getMaterial().getKd());
	gl.uniform4fv(u_ks,object.getMaterial().getKs());
	gl.uniform1f(u_coefEspec,object.getMaterial().getShininess());

	gl.bindVertexArray(object.getVao());//Asocio el vao del planeta
	gl.drawElements(gl.TRIANGLES, object.getIndexCount(), gl.UNSIGNED_INT, 0);//Dibuja planeta
	gl.bindVertexArray(null);
}

/*Funcion para refrescar los angulos de rotacion automatica*/
function refreshAngles(deltaTime){
	 // A partir del tiempo que pasó desde el ultimo frame (timeDelta), calculamos los cambios que tenemos que aplicar al cubo
	for(let x = 0; x<10 ; x++){
		if(animated[x]){
			if(x==1){ //Si lo que se esta animando es el satelite
				rotationAngle[x] = -deltaTime * rotationSpeed+rotationAngle[x];//Acomodo el angulo de rotacion
				if(rotationAngle[x]<-360) //Verifico que no se pase de los valores establecidos para el slider
					rotationAngle[x]=360; //No hay problema alguno en que se pase, pero si se deja mucho tiempo corriendo
				if(rotationAngle[x]>360) //Puede llegar al maximo valor de integer y pueden llegar a ocurrir errores
					rotationAngle[x]=-360;
			}
			else
			if(x==6){ //Si lo que se esta animando es la camara rotando automaticamente de forma horaria
				rotationAngle[x] = deltaTime * (-rotationSpeed)+rotationAngle[x];
				if(rotationAngle[x]<=0)
					rotationAngle[x]=360;
			}
			else
			 if(x==5){//Si lo que estoy animando es la camara rotando automaticamente de forma antihoraria
				rotationAngle[x] = deltaTime * rotationSpeed + rotationAngle[x];
				if(rotationAngle[x]>360)
					rotationAngle[x]=0;
			}
			else
				if(x==7){//Si lo que estoy animando es el planeta rotando automaticamente de forma horaria
				rotationAngle[x] =deltaTime * (-rotationSpeed) + rotationAngle[x];
				if(rotationAngle[x]<-360)
					rotationAngle[x]=360;
				if(rotationAngle[x]>360)
					rotationAngle[x]=-360;
			}
			else{//Si no es ninguno de los casos anteriores establezco un angulo de rotacion estandar
				rotationAngle[x] = deltaTime * rotationSpeed + rotationAngle[x];
				if(rotationAngle[x]>360)
					rotationAngle[x]=-360;
			}
		}
	}
}

/*Funcion para rotar el anillo interior*/
function rotateRing1(){
	let escalar1Y = 2; //Establezco el valor del escalar por el cual multiplicare al angulo de rotacion segun Y
	let escalar1Z = -1; //Establezco el valor del escalar por el cual multiplicare al angulo de rotacion segun Z
	let matrix = obj_ring1.getObjectMatrix();
	let rotationMatrix = mat4.create();//Creo una matriz de 4 dimensiones. Esta sera la matriz de rotacion
	if(animated[0]){ //Si el planeta esta siendo animado...
		mat4.fromYRotation(rotationMatrix, glMatrix.toRadian(escalar1Y * rotationAngle[0]));//Roto con respecto a Y con el angulo de rotacion
		mat4.multiply(matrix, rotationMatrix, matrix); //Aplico la rotacion
		mat4.fromZRotation(rotationMatrix, glMatrix.toRadian(escalar1Z * rotationAngle[0])); //Roto con respecto a Z con el angulo de rotacion
	}else
		if(animated[7]){ //Si el planeta esta siendo animado...
		mat4.fromYRotation(rotationMatrix, glMatrix.toRadian(escalar1Y * rotationAngle[7]));//Roto con respecto a Y con el angulo de rotacion
		mat4.multiply(matrix, rotationMatrix, matrix);//Aplico Rotacion
		mat4.fromZRotation(rotationMatrix, glMatrix.toRadian(escalar1Z * rotationAngle[7]));//Roto con respecto a Z con el angulo de rotacion
	}
	else{ //Sino...
		mat4.fromYRotation(rotationMatrix, glMatrix.toRadian(escalar1Y * angle[0]));//Roto con respecto a Y con el angulo del slider
		mat4.multiply(matrix, rotationMatrix, matrix);//Aplico la rotacion
		mat4.fromZRotation(rotationMatrix, glMatrix.toRadian(escalar1Z * angle[0]));//Roto con respecto a Z con el angulo del slider
	}
	mat4.multiply(matrix, rotationMatrix, matrix);//Aplico rotacion y escalo
	let anguloX1 = 62;//Establezco el valor del escalar por el cual multiplicare al angulo de rotacion segun X
	mat4.fromXRotation(rotationMatrix, glMatrix.toRadian(anguloX1));//Roto con respecto a X
	mat4.multiply(matrix, rotationMatrix, matrix);//Aplico la rotacion
}

/*Funcion para rotar el anillo exterior*/
function rotateRing2(){
	let escalar2Y = -1; //Establezco el valor del escalar por el cual multiplicare al angulo de rotacion segun Y
	let escalar2Z = 1; //Establezco el valor del escalar por el cual multiplicare al angulo de rotacion segun Z
	let matrix = obj_ring2.getObjectMatrix();
	let rotationMatrix = mat4.create();//Creo una matriz de 4 dimensiones. Esta sera la matriz de rotacion
	if(animated[0]){ //Si el planeta esta siendo animado...
		mat4.fromYRotation(rotationMatrix, glMatrix.toRadian(escalar2Y * rotationAngle[0]));//Roto con respecto a Y con el angulo de rotacion
		mat4.multiply(matrix, rotationMatrix, matrix);//Aplico Rotacion
		mat4.fromZRotation(rotationMatrix, glMatrix.toRadian(escalar2Z * rotationAngle[0]));//Roto con respecto a Z con el angulo de rotacion
	}
	else
		if(animated[7]){ //Si el planeta esta siendo animado...
			mat4.fromYRotation(rotationMatrix, glMatrix.toRadian(escalar2Y * rotationAngle[7]));//Roto con respecto a Y con el angulo de rotacion
			mat4.multiply(matrix, rotationMatrix, matrix);//Aplico Rotacion
			mat4.fromZRotation(rotationMatrix, glMatrix.toRadian(escalar2Z * rotationAngle[7]));//Roto con respecto a Z con el angulo de rotacion
		}
		else{ //Sino...
			mat4.fromYRotation(rotationMatrix, glMatrix.toRadian(escalar2Y * angle[0]));//Roto con respecto a Y con el angulo del slider
			mat4.multiply(matrix, rotationMatrix, matrix);//Aplico Rotacion
			mat4.fromZRotation(rotationMatrix, glMatrix.toRadian(escalar2Z * angle[0]));//Roto con respecto a Z con el angulo del slider
		}
	mat4.multiply(matrix, rotationMatrix, matrix);//Aplico la rotacion
	let anguloX2 = 21; //Establezco el valor del escalar por el cual multiplicare al angulo de rotacion segun X
  mat4.fromXRotation(rotationMatrix, glMatrix.toRadian(anguloX2));//Roto con respecto a X
	mat4.multiply(matrix, rotationMatrix, matrix);//Aplico la rotacion
}

/*Funcion para rotar el planeta*/
function rotatePlanet(){
	let rotationMatrix = mat4.create();//Creo una matriz de 4 dimensiones. Esta sera la matriz de rotacion
	let translationMatrix = mat4.create();//Creo una matriz de 4 dimensiones. Esta sera la matriz de traslacion
	let matrix = obj_planet.getObjectMatrix();
	if(animated[0])//Si esta siendo animado...
		//Creo matriz de rotacion para el planeta con el angulo de rotacion automatico
		mat4.fromYRotation(rotationMatrix, glMatrix.toRadian(rotationAngle[0]));
		else
			if(animated[7])//Si esta siendo animado...
				//Creo matriz de rotacion para el planeta con el angulo de rotacion automatico
				mat4.fromYRotation(rotationMatrix, glMatrix.toRadian(rotationAngle[7]));
			else//sino... creo matriz de rotacion con el angulo del slider
				mat4.fromYRotation(rotationMatrix, glMatrix.toRadian(angle[0]));
	//Aplico transformaciones al planeta
	mat4.multiply(matrix, rotationMatrix, matrix);
}

/*Funcion para escalar el anillo interior*/
function scaleRing1(){
	let scaleMatrix = mat4.create();//Creo una matriz de 4 dimensiones. Esta sera la matriz de escalado
	let matrix = obj_ring1.getObjectMatrix();
	let scale = [0.079,0.079,0.079];//Seteo el vector de escalado
	mat4.fromScaling(scaleMatrix,scale);//Creo la matriz de escalado
	mat4.multiply(matrix, scaleMatrix, matrix);//Aplico escalado
}

/*Funcion para escalar el anillo exterior*/
function scaleRing2(){
	let scaleMatrix = mat4.create();//Creo una matriz de 4 dimensiones. Esta sera la matriz de escalado
	let matrix = obj_ring2.getObjectMatrix();
	let scale = [0.1,0.1,0.1];//Setep el vector de escalado
	mat4.fromScaling(scaleMatrix,scale);//Creo la matriz de escalado
	mat4.multiply(matrix, scaleMatrix, matrix);//Aplico escalado
}

/*Funcion para rotar el satelite*/
function rotateSatellite(){
	let rotationMatrix = mat4.create();//Creo una matriz de 4 dimensiones. Esta sera la matriz de rotacion
	let translationMatrix = mat4.create();//Creo una matriz de 4 dimensiones. Esta sera la matriz de traslacion
	let matrix = obj_satellite.getObjectMatrix();
	if(animated[1])//Si esta siendo animado
		//Creo matriz de rotacion para el satelite
		mat4.fromZRotation(rotationMatrix, glMatrix.toRadian(rotationAngle[1]));
		else
			if(animated[8])
				mat4.fromZRotation(rotationMatrix, glMatrix.toRadian(rotationAngle[8]));
	else//Sino... creo matriz de rotacion con el angulo del slider
		mat4.fromZRotation(rotationMatrix, glMatrix.toRadian(-angle[1]));
	//Obtengo las componentes del punto central de rotacion del objeto y multiplico por -1 para obtener
	//el vector de traslacion al 0,0,0
	let center = obj_satellite.getCenter();
	let vecTranslation =[-1*parseFloat(center[0]),-1*parseFloat(center[1]),-1*parseFloat(center[2])];
	mat4.fromTranslation(translationMatrix,vecTranslation);//Creo matriz de traslacion
	mat4.multiply(matrix,translationMatrix, matrix);//Traslado el satelite al 0,0,0
	mat4.multiply(matrix, rotationMatrix, matrix);//Roto el satelite
	mat4.invert(translationMatrix,translationMatrix)//Calculo la matriz de traslacion al punto original
	mat4.multiply(matrix,translationMatrix,matrix);//Vuelvo a pos normal
}

/*Funcion para orbitar el satelite*/
function orbitSatellite(){
	let rotationMatrix = mat4.create();//Creo una matriz de 4 dimensiones. Esta sera la matriz de rotacion
	let matrix = obj_satellite.getObjectMatrix();
	if(animated[2])//Si esta siendo animado... Creo matriz de rotacion en orbita para el satelite con el angulo de rot automatica
		mat4.fromYRotation(rotationMatrix, glMatrix.toRadian(-rotationAngle[2]));
		else
	if(animated[9])
		mat4.fromYRotation(rotationMatrix, glMatrix.toRadian(rotationAngle[9]));
	else//Sino... creo matriz de rotacion con el angulo del slider
		mat4.fromYRotation(rotationMatrix, glMatrix.toRadian(-angle[2]));
	mat4.multiply(matrix, rotationMatrix, matrix);//Muevo al satelite por la orbita
}

/*Funcion para escalar el satelite*/
function scaleSatellite(){
	let matrix = obj_satellite.getObjectMatrix();
	let scale = [0.09,0.09,0.09];//Creo el vector de escalado
	let scaleMatrix = mat4.create();//Creo una matriz de 4 dimensiones. Esta sera la matriz de escalado
	mat4.fromScaling(scaleMatrix,scale);//Creo la matriz de escalado
	mat4.multiply(matrix, scaleMatrix, matrix);//Aplico el escalado
}

/*Funcion para escalar el planeta*/
function scalePlanet(){
	let matrix = obj_planet.getObjectMatrix();
	let scale = [0.08,0.08,0.08];//Creo el vector de escalado
	let scaleMatrix = mat4.create();//Creo una matriz de 4 dimensiones. Esta sera la matriz de escalado
	mat4.fromScaling(scaleMatrix,scale);//Creo la matriz de escalado
	mat4.multiply(matrix, scaleMatrix, matrix);//Aplico el escalado
}

/*Funcion para cargar los objetos*/
function onModelLoad() {
	parsedOBJ = OBJParser.parseFile(planeta); //Cargo el planeta
	parsedOBJ2 = OBJParser.parseFile(satelite); //Cargo el satelite
	parsedOBJ3 = OBJParser.parseFile(anillo1); //Cargo el anillo interior
	parsedOBJ4 = OBJParser.parseFile(anillo2); //Cargo el anillo exterior
}
