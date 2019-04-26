class Light{

  //Tanto lightPosition como intensity son vec3
  //intensity[0]=intensidad ambiente;
  //intensity[1]=intensidad difusa;
  //intensity[2]=intensidad especular;
  constructor(lightPosition,intensity,angle){
        this.lightPosition = lightPosition;
        this.intensity = intensity;
        this.angle = angle;
  }

  //Retorno la posicion de la luz
  getLightPosition(){
    return this.lightPosition;
  }

  //Retorno la intensidad de la luz
  getIntensity(){
    return this.intensity;
  }

  getAngle(){
    return angle;
  }

}
