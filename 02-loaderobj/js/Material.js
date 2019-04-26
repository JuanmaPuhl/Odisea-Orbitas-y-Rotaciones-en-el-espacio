class Material{

  constructor(ka,kd,ks,shininess){
    this.ka = ka;
    this.kd = kd;
    this.ks = ks;
    this.shininess = shininess;
  }

  getKa(){
    return this.ka;
  }

  getKd(){
    return this.kd;
  }

  getKs(){
    return this.ks;
  }

  getShininess(){
    return this.shininess;
  }
}
