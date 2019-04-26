// Fragment Shader source, asignado a una variable para usarlo en un tag <script>
var fragmentShaderSource =`#version 300 es

precision highp float;

in vec3 vNE;
in vec3 vLE;
in vec3 vVE;
out vec4 colorFrag;
uniform vec4 ka;
uniform float coefEspec;
uniform vec4 kd;
uniform vec4 ks;

void main(){
    vec3 N = normalize(vNE);
    vec3 L = normalize(vLE);
    vec3 V = normalize(vVE);
    vec3 H = normalize(L+V);

    //Calculo termino difuso + espec de Blinn-Phong
    float difuso = max(dot(L,N),0.0) ;
    float specBlinnPhong = pow(max(dot(N,H),0.0),coefEspec);
    if(dot(L,N)< 0.0){
        specBlinnPhong = 0.0;
    }

    colorFrag = ka + kd*difuso + ks*specBlinnPhong;

}
`
