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

void zextrude(in float z, in float d2d, in float h, out float d)
{
    vec2 w = vec2(-d2d, abs(z)-0.5*h);
    d = length(max(w,0.0));
}

void add(in vec2 sda, in vec2 sdb, out vec2 sdf)
{
    sdf = (sda.x<sdb.x)?sda:sdb;
}

void scene(in vec3 x, out vec2 sdf)
{
    x.y -= .3*iTime;
    x.x -= 100.;
    
 	float n;
    mfnoise(x.xy, 1., 1.e2, .45, n);
    
    float v;
    vec2 vi;
    
    dsmoothvoronoi(12.*(x.xy-.01*n), v, vi);
    v = abs(v/12.)-.001;
    
    float d;
    zextrude(x.z, -v, .01*scale, d);
    smoothmin(d, x.z, mix(.02,.06,scale), d);
    
    sdf = vec2(d, 1.);
    
    for(float i = 1.; i<=2.; i+=1.)
    {
    dsmoothvoronoi(i*24.*(x.xy-.005*n), v, vi);
    v = abs(v/24.)-.0005;
    
    zextrude(x.z, -v, .01*scale, d);
    smoothmin(d, sdf.x, mix(.01,.03/i,scale), d);
    
    add(sdf, vec2(d, 1.), sdf);
    }
    
    
    float n1;
    mfnoise(x.xy, 3.,5.e3, .25, n1);
    n1 = .5+.5*n1;
    n1 *= smoothstep(-.3,.3,abs(x.x));
    n1 = abs(n1)-.03;
    sdf.x -= 1.3*n1;
}

void normal(in vec3 x, out vec3 n, in float dx)
{
    vec2 s, na;
    
    scene(x,s);
    scene(x+dx*c.xyy, na);
    n.x = na.x;
    scene(x+dx*c.yxy, na);
    n.y = na.x;
    scene(x+dx*c.yyx, na);
    n.z = na.x;
    n = normalize(n-s.x);
}

float sm(in float d)
{
    return smoothstep(1.5/iResolution.y, -1.5/iResolution.y, d);
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

void colorize(in vec2 uv, out vec3 col)
{
    uv.y -= .3*iTime;
    
    float n;
    mfnoise(uv, 1., 1.e2, .45, n);
    
    float v;
    vec2 vi;
    
    dsmoothvoronoi(12.*(uv-.01*n), v, vi);
    v = abs(v/12.)-.001;
    
    vec3 c1;
    float la;
    lfnoise(uv-.1*n, la);
    palette(la, c1);
    
    col = c1;
    col = mix(col, 2.*col, abs(v)-.001);
    
    dsmoothvoronoi(24.*(uv-.005*n), v, vi);
    v = abs(v/24.)-.001;
    
    col = mix(col, 2.*col, abs(v)-.001);
    
    float na;
    lfnoise(iTime*c.xx, na);
    na = .5+.5*na;
    
    palette(na, c1);
    col = mix(col, c1, sm(v));
    
    float n1;
    mfnoise(uv, 3.,5.e3, .55, n1);
    n1 = .5+.5*n1;
    col = mix(col, 2.*col, n1);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = (fragCoord-.5*iResolution.xy)/iResolution.yy,
        s;
    
    uv = vec2(length(uv), (1./2.*atan(uv.x,uv.y)));
    
    scale = mod(iTime,spb)-.5*spb;
    scale = smoothstep(-.3*spb, -.1*spb, scale)*(1.-smoothstep(.1*spb, .3*spb, scale));
    nbeats = (iTime-mod(iTime, spb))/spb;

    float ra;
    rand(nbeats*c.xx, ra);
    uv.x += .1+.1*ra;
    
    uv *= .2+ra;
    float dp = pi/floor(3.+8.*ra);
    uv.y = abs(mod(uv.y,dp)-.5*dp);
    dp = .2+.2*ra;
    //uv.x = abs(mod(uv.x,dp)-.5*dp);
    
    float phi = pi/8.*ra+.03*scale*scale*scale;
    mat2 R = mat2(cos(phi), sin(phi), -sin(phi), cos(phi));
    uv = R* uv;
    
    vec3 o0 = c.yyx+.1*c.yxy,
        o = o0,
        r = c.xyy,
        t = c.yyy, 
        u = cross(normalize(t-o),r),
        dir,
        n, 
        x,
        c1 = c.yyy,
        l,
        col = c.yyy;
    int N = 450,
        i;

    t = uv.x * r + uv.y * u;
    dir = normalize(t-o);
    
    float d = -(o.z-.01)/dir.z;
    
    // Raymarch branch
    for(i = 0; i<N; ++i)
    {
        x = o + d * dir;
        scene(x,s);
        if(s.x < 1.e-4) break;
        //d += s.x<1.e-1?min(s.x,5.e-2):s.x;
        d += min(s.x, 5.e-3);
        //d += s.x;
    }
    float v, vc;
    vec2 vi;
    
    float na;
    lfnoise(12.*x.z*c.xx, na);
    na = .5+.5*na;
    
    if(i<N)
    {
        normal(x, n, 5.e-4);
        l = normalize(x+.1*n);
        
        if(s.y == 0.) // Tunnel wall
        {
            col = mix(vec3(0.75,0.11,0.11),vec3(0.47,1.00,0.00), na);
            col = mix(col, 4.*vec3(0.87,0.01,0.38)*col, clamp(length(x),0.,1.));
            col = mix(col, vec3(0.22,0.31,0.71), clamp(.5*abs(dot(n,c.xxx)),0.,1.));
            col = .1*col 
                + .2*col*dot(l, n)
                + 1.4*col*pow(abs(dot(reflect(l,n),dir)),2.);
        }
        
        else if(s.y == 1.) // Glowshit
        {
            colorize(x.xy-x.z, col);
            vec3 c1;
            
            vec2 cc;
            lfnoise(x.z+iTime*c.xx+x.z, cc.x);
            lfnoise(x.z+2.*iTime*c.xx+1337., cc.y);
            cc = .5*c.xx+.5*cc;
            
            palette(cc.x, c1);
            col = mix(col, c1, clamp(.5*abs(dot(n,c.xxx)),0.,1.));
			palette(cc.y, c1);
            c1 *= c1;
            col = mix(col, c1, clamp(.5*abs(dot(n,c.xxy)),0.,1.));
            col = .1*col 
                + .2*col*dot(l, n)
                + 1.4*col*pow(abs(dot(reflect(l,n),dir)),2.);
        }
        else if(s.y == 2.) // Glowshit 2
        {
            col = vec3(0.27,0.04,0.73);
            col = mix(col, vec3(0.22,0.31,0.71), clamp(.5*abs(dot(n,c.xxx)),0.,1.));
            col = .1*col 
                + .2*col*dot(l, n)
                + .4*col*pow(abs(dot(reflect(l,n),dir)),2.);
        }
    }
    
    fragColor = vec4(col,1.0);
}

void main()
{
    mainImage(gl_FragColor, gl_FragCoord.xy);
}
