class Object{

  constructor(parsedOBJ){
    this.parsedOBJ = parsedOBJ;
    this.indices = this.parsedOBJ.indices;
    this.positions = this.parsedOBJ.positions;
    this.colors = this.parsedOBJ.positions;
    this.normals = this.parsedOBJ.normals;
    this.indexCount = this.indices.length;
    this.objectMatrix = mat4.create();
    this.animated = false;
    this.vao = null;
    this.center = Utils.boundingBoxCenter(this.positions);
  }

  /*-------------------SETTERS-------------------*/
  setCenter(center){
    this.center = center;
  }

  setVao(vao){
    this.vao = vao;
  }

  setMaterial(material){
    this.material = material;
  }

  animate(value){
    this.animated = value;
  }

  resetObjectMatrix(){
    this.objectMatrix = mat4.create();
  }

  /*--------------------GETTERS-------------------*/

  getIndices(){
    return this.indices;
  }

  getPositions(){
    return this.positions;
  }

  getColors(){
    return this.colors;
  }

  getNormals(){
    return this.normals;
  }

  getIndexCount(){
    return this.indexCount;
  }

  getMaterial(){
    return this.material;
  }

  getObjectMatrix(){
    return this.objectMatrix;
  }

  getVao(){
    return this.vao;
  }

  getCenter(){
    return this.center;
  }

  isAnimated(){
    return this.animated;
  }


}
