#version 130

uniform float iTime;
uniform vec2 iResolution;

const float pi = acos(-1.);
const vec3 c = vec3(1.,0.,-1.);

const float bpm = 136.,
        spb = 60./bpm;
float scale, nbeats;

void rand(in vec2 x, out float n)
{
    x += 400.;
    n = fract(sin(dot(sign(x)*abs(x) ,vec2(12.9898,78.233)))*43758.5453);
}

void lfnoise(in vec2 t, out float n)
{
    vec2 i = floor(t);
    t = fract(t);
    t = smoothstep(c.yy, c.xx, t);
    vec2 v1, v2;
    rand(i, v1.x);
    rand(i+c.xy, v1.y);
    rand(i+c.yx, v2.x);
    rand(i+c.xx, v2.y);
    v1 = c.zz+2.*mix(v1, v2, t.y);
    n = mix(v1.x, v1.y, t.x);
}

void mfnoise(in vec2 x, in float d, in float b, in float e, out float n)
{
    n = 0.;
    float a = 1., nf = 0., buf;
    for(float f = d; f<b; f *= 2.)
    {
        lfnoise(f*x, buf);
        n += a*buf;
        a *= e;
        nf += 1.;
    }
    n *= (1.-e)/(1.-pow(e, nf));
}

void dlinesegment(in vec2 x, in vec2 p1, in vec2 p2, out float d)
{
    vec2 da = p2-p1;
    d = length(x-mix(p1, p2, clamp(dot(x-p1, da)/dot(da,da),0.,1.)));
}

const int npts = 308;
const float path[npts] = float[npts](-0.500,-0.145,-0.500,0.145,-0.500,0.145,0.500,0.145,0.500,0.145,0.500,-0.145,0.500,-0.145,-0.500,-0.145,0.471,-0.107,0.471,0.028,0.471,0.028,0.390,0.028,0.390,0.028,0.435,-0.028,0.435,-0.028,0.435,-0.085,0.435,-0.085,0.390,-0.085,0.390,-0.085,0.390,-0.028,0.390,-0.028,0.341,-0.028,0.341,-0.028,0.341,-0.085,0.341,-0.085,0.293,-0.085,0.293,-0.085,0.293,-0.028,0.293,-0.028,0.341,-0.028,0.341,-0.028,0.293,0.028,0.293,0.028,0.293,0.086,0.293,0.086,0.341,0.086,0.341,0.086,0.341,0.028,0.341,0.028,0.390,0.028,0.390,0.028,0.390,0.086,0.390,0.086,0.471,0.086,0.471,0.086,0.471,0.110,0.471,0.110,0.055,0.110,0.055,0.110,0.055,0.086,0.055,0.086,0.103,0.086,0.103,0.086,0.103,0.028,0.103,0.028,0.055,0.028,0.055,0.028,0.055,-0.028,0.055,-0.028,0.103,-0.028,0.103,-0.028,0.103,-0.085,0.103,-0.085,0.055,-0.085,0.055,-0.085,0.007,-0.028,0.007,-0.028,0.007,0.110,0.007,0.110,-0.469,0.110,-0.469,0.110,-0.469,0.086,-0.469,0.086,-0.399,0.086,-0.399,0.086,-0.399,-0.028,-0.399,-0.028,-0.350,-0.028,-0.350,-0.028,-0.350,0.086,-0.350,0.086,-0.302,0.086,-0.302,0.086,-0.302,-0.028,-0.302,-0.028,-0.350,-0.085,-0.350,-0.085,-0.399,-0.085,-0.399,-0.085,-0.447,-0.028,-0.447,-0.028,-0.447,0.028,-0.447,0.028,-0.469,0.028,-0.469,0.028,-0.469,-0.107,-0.469,-0.107,-0.112,-0.107,-0.112,-0.107,-0.112,0.086,-0.112,0.086,-0.016,0.086,-0.016,0.086,-0.016,0.028,-0.016,0.028,-0.065,0.028,-0.065,0.028,-0.065,-0.107,-0.065,-0.107,0.471,-0.107,-0.279,0.028,-0.232,0.086,-0.232,0.086,-0.136,0.086,-0.136,0.086,-0.136,-0.028,-0.136,-0.028,-0.184,-0.085,-0.184,-0.085,-0.279,-0.085,-0.279,-0.085,-0.279,0.028,-0.184,0.028,-0.232,0.028,-0.232,0.028,-0.232,-0.028,-0.232,-0.028,-0.184,-0.028,-0.184,-0.028,-0.184,0.028,0.126,-0.085,0.126,0.028,0.126,0.028,0.172,0.086,0.172,0.086,0.268,0.086,0.268,0.086,0.268,0.028,0.268,0.028,0.224,-0.028,0.224,-0.028,0.224,-0.028,0.224,-0.028,0.224,0.028,0.224,0.028,0.172,0.028,0.172,0.028,0.172,-0.028,0.172,-0.028,0.268,-0.028,0.268,-0.028,0.268,-0.085,0.268,-0.085,0.126,-0.085);

float sm(in float d)
{
    return smoothstep(1.5/iResolution.y, -1.5/iResolution.y, d);
}

void dvortex(in vec2 x, out float ret)
{
    ret = 1.;
    float da;

    float n = 0.;
    for(int i=0; i<npts/4; ++i)
    {
        vec2 ptsi = vec2(path[4*i], path[4*i+1]),
            ptsip1 = vec2(path[4*i+2], path[4*i+3]),
            k = x-ptsi, 
            d = ptsip1-ptsi;
        
        float beta = k.x/d.x,
            alpha = d.y*k.x/d.x-k.y;
        
        n += step(.0, beta)*step(beta, 1.)*step(0., alpha);
        dlinesegment(x, ptsi, ptsip1, da);
        ret = min(ret, da);
    }
    
    ret = mix(ret, -ret, mod(n, 2.));
}

void palette(in float scale, out vec3 col)
{
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

void colorize(in vec2 uv, inout vec3 col)
{
    vec2 dis;
    lfnoise(iTime*c.xx+1337., dis.x);
    lfnoise(iTime*c.xx+2337., dis.y);
    uv += .2*dis;
    
    float size;
    rand(nbeats*c.xx+3337., size);
    uv *= 1.+size;
    
    float phi = pi/4.+.03*scale*scale*scale;
    mat2 R = mat2(cos(phi), sin(phi), -sin(phi), cos(phi));
    uv = mix(uv, R*uv, clamp(iTime-2., 0., 1.));
    
    float ra, rb;
    rand(nbeats*c.xx, ra);
    ra = floor(1.+4.*ra);
    
    lfnoise(iTime*c.xx, rb);
    rb = .8+.2*rb;
    
    vec2 y = vec2(mix(length(uv),length(mod(uv,rb)-.5*rb),clamp((iTime-12.*spb)/spb,0.,1.)),atan(uv.y,uv.x));
    float dphi = mix(pi/2., pi/4., clamp((iTime-8.*spb)/spb,0.,1.));
    dphi = mix(dphi, pi/ra, clamp((iTime-9.*spb)/spb,0.,1.));
    y.y = mod(y.y,dphi)-mix(0.,.5*dphi, clamp((iTime-7.*spb)/spb,0.,1.));
    
    uv = mix(uv, y.x*vec2(cos(y.y),sin(y.y)), clamp((iTime-2.*spb)/spb,0.,1.));
    
	//col = c.yyy;
    uv *= 1.1;
    float d;
    dvortex(uv, d);

    float r;
    rand(floor(12.*iTime)/12.*c.xx, r);
    r *= mix(2.*pi,0., clamp((iTime-16.*spb)/spb,0.,1.));
    
    R = mat2(cos(r), sin(r), -sin(r), cos(r));
    
    float n;
    mfnoise(R*uv, 2., 1.e4, .55, n);
    n = abs(n)-.01;
    
    vec3 c1;
    palette(n, c1); 
    
    col = mix(col, c1, sm(d));
    
    col = mix(col, c.yyy, 1.1*sm(n/25.));
    col = mix(col, c.yyy, sm(n));
    
    float bound;
    mfnoise(y.y*c.xx-1337., 1., 1.e2, .65, bound);
    bound = .5+.5*bound;
    bound = mix(0., .55, clamp((bound*iTime-spb)/spb,0.,1.));
    
    lfnoise(length(uv)*c.xx, r);
    r = .5+.5*r;
    palette(r, c1);
    
    col = mix(mix(col, 2.*col+mix(2.*c1, 2.-2.*c1, scale), sm(n/125.)), col, sm(-length(uv)+bound));
    col = mix(mix(col, 2.*c1, sm(abs(n)/5.)), col, sm(4.*(-length(uv)+bound)));
    
    col = mix(col, c1, sm((abs(length(uv)-.55)-.003)/mix(1.,10.,scale))/mix(1.,10.,1.-scale)); // circle outline
    col = mix(col, 4.*c1, sm((abs(abs(d)-.01)-.001))/mix(1.,10.,1.-scale)); // vortex outline
    col *= mix(1.2,.8, clamp((iTime-13.*spb)/spb,0.,1.));
    //c2 = mix(col, mix(c2, col, r), clamp((iTime-14.*spb)/spb, 0.,1.));
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = (fragCoord-.5*iResolution.xy)/iResolution.yy;

    scale = mod(iTime,spb)-.5*spb;
    scale = smoothstep(-.3*spb, -.1*spb, scale)*(1.-smoothstep(.1*spb, .3*spb, scale));
    nbeats = (iTime-mod(iTime, spb))/spb;
    
    vec3 o = c.yyx + uv.x*c.xyy + uv.y * c.yxy,
        dir = c.yyz+.1*c.yxy;
    float d;
    
    vec3 col = c.yyy;
    for(float i=0.; i<mix(1., 12., clamp((iTime-16.*spb)/spb, 0.,1.)); i+=1.)
    {
        d = -(o.z-i*.1)/dir.z;
        vec3 x = o + d * dir;
        float r;
        lfnoise(iTime*c.xx, r);
        float phi = mix(0.,pi*r, clamp((iTime-20.*spb)/spb, 0.,1.)*(1.-clamp((iTime-24.*spb)/spb,0.,1.)));
        mat2 R = mat2(cos(phi), sin(phi), -sin(phi), cos(phi));
        vec2 dx;
        lfnoise(iTime*c.xx+4.*-1337., dx.x);
        lfnoise(iTime*c.xx+4.*i+1337., dx.y);
        
 	   	colorize(R*x.xy-.04*dx, col);
    }
    
    vec3 c1;
    //if(length(col)!=0.)palette(length(col-c.xxx)/4., c1);
    
    fragColor = vec4(clamp(col,0.,1.),1.0);
}


void main()
{
    mainImage(gl_FragColor, gl_FragCoord.xy);
}
