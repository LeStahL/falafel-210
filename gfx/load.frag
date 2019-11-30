#version 130
/*
 * sunnel for falael, maybe, by lemique of team210
 * 
 */

// iProgress in [0,1], dont use iTime
//  change in the first section of void mainImage

uniform float iProgress;
uniform vec2 iResolution;

out vec4 gl_FragColor;

const float pi = acos(-1.);
const vec3 c = vec3(1.,0.,-1.);

void palette(in float scale, out vec3 col)
{
    scale = fract(scale);
    const int N = 8;
    const vec3 colors[N] = vec3[N](
            vec3(0.88,0.01,0.42),
            vec3(0.36,0.04,0.47),
            vec3(0.41,0.26,0.91),
            vec3(0.18,0.82,0.82),
            vec3(0.37,0.95,0.18),
        	vec3(0.79,0.84,0.06),
        	vec3(0.89,0.64,0.04),
        	vec3(0.93,0.35,0.02)
    );
	float index = floor(scale*float(N)), 
        remainder = scale*float(N)-index;
    col = mix(colors[int(index)],colors[int(index)+1], remainder);
}

void dstar(in vec2 x, in float N, in vec2 R, out float dst)
{
    float d = pi/N,
        p0 = acos(x.x/length(x)),
        p = mod(p0, d),
        i = mod(round((p-p0)/d),2.);
    x = length(x)*vec2(cos(p),sin(p));
    vec2 a = mix(R,R.yx,i),
    	p1 = a.x*c.xy,
        ff = a.y*vec2(cos(d),sin(d))-p1;
   	ff = ff.yx*c.zx;
    dst = dot(x-p1,ff)/length(ff);
}

float sm(in float d)
{
    return smoothstep(1.5/iResolution.y, -1.5/iResolution.y, d);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = (fragCoord.xy -.5*iResolution.xy)/iResolution.y;
    
    // define prog
    float progress = iProgress;
    float d;
    vec3 col = c.yyy, 
        c1;
    
    dstar(uv, 8., vec2(.39,.5), d);
    
    float phi = atan(uv.y,uv.x);
    palette((phi+pi)/2./pi, c1);
    c1 = mix(c1, .5*c1, mod((phi-mod(phi,pi/8.))*8./pi,2.));
    c1 = mix(c1, length(c1)/sqrt(3.)*c.xxx, smoothstep(progress*pi*2.-.05,progress*pi*2.+.05, pi+phi));
    col = mix(col, c1, sm(-d+.05));
    
    palette(.3, c1);
    col = mix(col, c1, sm((abs(d-.045)-.005)/12.));
    col = mix(col, c1, sm(abs(d-.045)-.002));
    
    d = abs(d)-.002;
    
    palette(.5, c1);
    col = mix(col, c1, sm((d-.005)/12.));
    col = mix(col, c1, sm(d));
    
    col = mix(col, c.yyy, sm(length(uv)-.01));
    
    // Output to screen
    fragColor = vec4(clamp(col,0.,1.),1.0);
}

void main()
{
	mainImage(gl_FragColor, gl_FragCoord.xy);
}

