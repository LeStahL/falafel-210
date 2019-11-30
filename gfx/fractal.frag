#version 130

uniform float iTime;
uniform vec2 iResolution;

const vec3 c = vec3(1.,0.,-1.);
const float pi = acos(-1.);

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

vec2 cmul(in vec2 a, in vec2 b)
{
    return vec2(dot(a,b*c.xz), dot(a,b.yx));
//    return vec2(a.x*b.x - a.y*b.y, a.x*b.y + a.y*b.x);
}

// Distance to regular voronoi
void dvoronoi(in vec2 x, out float d, out vec2 ind)
{
    vec2 y = floor(x);
   	float ret = 1.;
    
    //find closest control point. ("In which cell am I?")
    vec2 pf=c.yy, p;
    float df=10.;
    
    for(int i=-1; i<=1; i+=1)
        for(int j=-1; j<=1; j+=1)
        {
            p = y + vec2(float(i), float(j));
            vec2 pa;
            rand(p, pa.x);
            rand(p-1.3, pa.y);
            //pa = .5+.5*pa;
            p += pa;
            
            d = length(x-p);
            
            if(d < df)
            {
                df = d;
                pf = p;
            }
        }
    
    //compute voronoi distance: minimum distance to any edge
    for(int i=-1; i<=1; i+=1)
        for(int j=-1; j<=1; j+=1)
        {
            p = y + vec2(float(i), float(j));
            vec2 pa;
            rand(p, pa.x);
            rand(p-1.3, pa.y);
            //pa = .5+.5*pa;
            p += pa;
            
            vec2 o = p - pf;
            d = length(.5*o-dot(x-pf, o)/dot(o,o)*o);
            ret = min(ret, d);
        }
    
    d = ret;
    ind = pf;
}

void dbox(in vec2 x, in vec2 b, out float d)
{
    vec2 da = abs(x)-b;
    d = length(max(da,c.yy)) + min(max(da.x,da.y),0.0);
}

void smoothmin(in float a, in float b, in float k, out float dst)
{
    float h = max( k-abs(a-b), 0.0 )/k;
    dst = min( a, b ) - h*h*h*k*(1.0/6.0);
}

// Distance to regular voronoi
void dsmoothvoronoi(in vec2 x, out float d, out vec2 ind)
{
    vec2 y = floor(x);
   	float ret = 1.;
    
    //find closest control point. ("In which cell am I?")
    vec2 pf=c.yy, p;
    float df=10.;
    
    for(int i=-1; i<=1; i+=1)
        for(int j=-1; j<=1; j+=1)
        {
            p = y + vec2(float(i), float(j));
            vec2 pa;
            rand(p, pa.x);
            rand(p-1.3, pa.y);
            //pa = .5+.5*pa;
            p += pa;
            
            d = length(x-p);
            
            if(d < df)
            {
                df = d;
                pf = p;
            }
        }
    
    //compute voronoi distance: minimum distance to any edge
    for(int i=-1; i<=1; i+=1)
        for(int j=-1; j<=1; j+=1)
        {
            p = y + vec2(float(i), float(j));
            vec2 pa;
            rand(p, pa.x);
            rand(p-1.3, pa.y);
            //pa = .5+.5*pa;
            p += pa;
            
            vec2 o = p - pf;
            d = length(.5*o-dot(x-pf, o)/dot(o,o)*o);
            smoothmin(ret, d, .2, ret);
        }
    
    d = ret;
    ind = pf;
}

vec3 iterate(in vec2 cc)
{
    vec3 dist = 1.e4*c.xxx;
    vec2 z = c.yy;
    for( int i=0; i<10; i++ )
    {
        //z = sqrt( (cmul(z,z) + cc - 1.)/(2.*z+cc-2.));
        z = cmul(z,z)+cmul(cc,cc);
        vec2 ta = mix(cc*z*z, cc*z,clamp((iTime-10.*spb)/spb,0.,1.));
        ta = mix(ta, cc*cmul(z,z)+cc, clamp((iTime-20.*spb)/spb,0.,1.));
        ta = mix(ta, cc*cmul(z,z)+cc*z, clamp((iTime-30.*spb)/spb,0.,1.));
        ta = mix(ta, sin(cc)*z, clamp((iTime-40.*spb)/spb,0.,1.));
        ta = mix(ta, cmul(z,z)+cc, clamp((iTime-50.*spb)/spb,0.,1.));
        
        vec2 ln;
        lfnoise(iTime*c.xx, ln.x);
        lfnoise(iTime*c.xx+1337., ln.y);
        ta += .1*ln;
        
        z = mix(c.yy,ta,.5+.5*ln.x)+abs(mod(z, ta)-.5*ta);
        //z = sqrt(abs(z));
        if(length(z)>2.0f ) return c.yyy;
        
        float se;
        lfnoise(z, se);
        
        vec3 da;
        vec2 s;
        //dbox(z, vec2(.03,.1), da);
        dsmoothvoronoi(12.*z-se, da.x, s);
        da.x = abs(da.x -.001)-.001;
        dsmoothvoronoi(4.3*z+se, da.y, s);
        da.y = abs(da.y -.1)-.001;
        //da.y = abs(length(z)-.3)-.01;
        dsmoothvoronoi(3.3*z-se, da.z, s);
        da.z = abs(da.z -.01)-.0001;
        //da = abs(da)-.1*vec3(.01,.03,.04);
        //da = sin(da);
        
        da = sqrt(da);
        
        dist = min(dist, da);
        
        //dist = min( dist, dot(z-.2*c.xy,z-.2*c.xy));
    }
    return sqrt(dist);
}

void palette(in float scale, out vec3 col)
{
    float na;
    lfnoise(12.*scale*c.xx-iTime, na);
    na = .5+.5*na;
    
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

float sm(in float d)
{
    return smoothstep(1.5/iResolution.y, -1.5/iResolution.y, d);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    vec2 uv = vec2(fragCoord.xy-.5*iResolution.xy)/iResolution.yy;
    
    scale = mod(iTime,spb)-.5*spb;
    scale = smoothstep(-.3*spb, -.1*spb, scale)*(1.-smoothstep(.1*spb, .3*spb, scale));
    nbeats = (iTime-mod(iTime, spb))/spb;

    uv *= mix(1., 1.1, scale*scale*scale);
    
    float phi = .03*scale*scale*scale;
    mat2 R = mat2(cos(phi), sin(phi), -sin(phi), cos(phi));
    uv = R * uv;
    vec3 col = c.yyy;
    
    vec2 na;
    lfnoise(iTime*c.xx, na.x);
    lfnoise(iTime*c.xx+1337., na.y);
    
    uv += .1*na;
    
    float r;
    rand(nbeats*c.xx, r);
    
    uv *= 1.5+r;
    
    vec3 fa = iterate(uv);
    
    fa *= mix(1.4,1.7,scale)*fa;
    //fa *= 5.;
    
    vec3 c1, c2, c3;
    palette(4.*fa.x*na.x, c1);
    palette(3.*fa.y*na.y, c2);
    palette(2.*fa.z*na.x, c3);
    
    col = mix(c.yyy, c2, fa.x*fa.y*fa.z);
    col = mix(col, c3, fa.y*fa.x);
    col = mix(col, c1, fa.z);
    
    col *= 3.;
    
    col = mix(col, 2.*col, sm((abs(fa.y)-.2*scale)/12.));
//     col = mix(col, c1, sm(length(col)-.5));
    col = mix(col, c.yyy, clamp(iTime-28.,0.,1.));

    fragColor = vec4(clamp(col,0.,1.),1.0);
}

void main()
{
    mainImage(gl_FragColor, gl_FragCoord.xy);
}
