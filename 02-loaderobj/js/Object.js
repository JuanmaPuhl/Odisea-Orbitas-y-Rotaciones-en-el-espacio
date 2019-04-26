class Object{

  constructor(parsedOBJ){
    this.parsedOBJ = parsedOBJ;
    this.indices = this.parsedOBJ.indices;
    this.positions = this.parsedOBJ.positions;
    this.colors = this.parsedOBJ.positions;
    this.normals = this.parsedOBJ.normals;
    this.indexCount = this.indices.length;
    this.objectMatrix = mat4.create();
  }

  setMaterial(material){
    this.material = material;
  }

  resetObjectMatrix(){
    this.objectMatrix = mat4.create();
  }
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
}
