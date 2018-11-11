precision mediump float;

varying vec2 vUv;
varying vec4 vColor;

uniform vec4 mainColor;
uniform sampler2D mainTexture;

void main(void)
{
    gl_FragColor = vec4(texture2D(mainTexture,vUv).xyz*mainColor.xyz*vColor.xyz,1.0);
}
 